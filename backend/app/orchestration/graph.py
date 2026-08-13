import json
import asyncio
from typing import Dict, Any, Literal
from sqlmodel import Session, select
from langgraph.graph import StateGraph, END

from app.orchestration.state import GraphState
from app.database import engine
from app.models.project import Project, Architecture, ArchitectureVersion, AgentRun
from app.agents import (
    run_requirements_agent,
    run_planner_agent,
    run_database_agent,
    run_api_agent,
    run_security_agent,
    run_devops_agent,
    run_architect_agent,
    run_cost_agent,
    run_scale_agent,
    run_threat_modeling_agent,
    run_tradeoff_agent,
    run_judge_agent
)

# Active WebSocket connections manager import
# We will define this utility in main.py, let's write a simple helper here to notify frontend.
active_websockets = {}

async def notify_progress(client_id: str, agent: str, status: str, payload: Any = None):
    if not client_id:
        return
    # Find client queue/websocket and send
    if client_id in active_websockets:
        try:
            ws = active_websockets[client_id]
            data = {"agent": agent, "status": status, "payload": payload}
            await ws.send_text(json.dumps(data))
        except Exception as e:
            print(f"WS send failed: {e}")

# Nodes implementation
async def requirements_node(state: GraphState) -> GraphState:
    state["current_agent"] = "requirements_agent"
    await notify_progress(state["websocket_client_id"], "requirements_agent", "running")
    
    with Session(engine) as session:
        project = session.get(Project, state["project_id"])
        project_meta = {}
        if project:
            project_meta = {
                "name": project.name,
                "description": project.description,
                "industry": project.industry,
                "expected_users": project.expected_users,
                "expected_traffic": project.expected_traffic,
                "cloud_preference": project.cloud_preference,
                "availability_req": project.availability_req,
                "budget": project.budget,
                "tech_preference": project.tech_preference,
                "security_req": project.security_req,
                "compliance_req": project.compliance_req,
                "additional_req": project.additional_req
            }
        # Run agent
        envelope = run_requirements_agent(session, state["user_idea"], project_meta)
        state["requirements"] = envelope.outputs
        
        # Log to DB
        run_record = AgentRun(
            architecture_id=state["architecture_id"],
            agent_name="requirements_agent",
            status="complete",
            output=json.dumps(envelope.model_dump()),
            confidence=envelope.confidence
        )
        session.add(run_record)
        session.commit()
        
    await notify_progress(state["websocket_client_id"], "requirements_agent", "completed", envelope.outputs)
    return state

async def planner_node(state: GraphState) -> GraphState:
    state["current_agent"] = "planner_agent"
    await notify_progress(state["websocket_client_id"], "planner_agent", "running")
    
    with Session(engine) as session:
        envelope = run_planner_agent(session, state["user_idea"], state["requirements"])
        state["plan"] = envelope.outputs
        
        run_record = AgentRun(
            architecture_id=state["architecture_id"],
            agent_name="planner_agent",
            status="complete",
            output=json.dumps(envelope.model_dump()),
            confidence=envelope.confidence
        )
        session.add(run_record)
        session.commit()
        
    await notify_progress(state["websocket_client_id"], "planner_agent", "completed", envelope.outputs)
    return state

async def database_node(state: GraphState) -> GraphState:
    state["current_agent"] = "database_agent"
    await notify_progress(state["websocket_client_id"], "database_agent", "running")
    
    with Session(engine) as session:
        envelope = run_database_agent(session, state["user_idea"], state["requirements"])
        state["database"] = envelope.outputs
        
        run_record = AgentRun(
            architecture_id=state["architecture_id"],
            agent_name="database_agent",
            status="complete",
            output=json.dumps(envelope.model_dump()),
            confidence=envelope.confidence
        )
        session.add(run_record)
        session.commit()
        
    await notify_progress(state["websocket_client_id"], "database_agent", "completed", envelope.outputs)
    return state

async def api_node(state: GraphState) -> GraphState:
    state["current_agent"] = "api_agent"
    await notify_progress(state["websocket_client_id"], "api_agent", "running")
    
    with Session(engine) as session:
        envelope = run_api_agent(session, state["user_idea"], state["database"])
        state["api"] = envelope.outputs
        
        run_record = AgentRun(
            architecture_id=state["architecture_id"],
            agent_name="api_agent",
            status="complete",
            output=json.dumps(envelope.model_dump()),
            confidence=envelope.confidence
        )
        session.add(run_record)
        session.commit()
        
    await notify_progress(state["websocket_client_id"], "api_agent", "completed", envelope.outputs)
    return state

async def security_node(state: GraphState) -> GraphState:
    state["current_agent"] = "security_agent"
    await notify_progress(state["websocket_client_id"], "security_agent", "running")
    
    with Session(engine) as session:
        envelope = run_security_agent(session, state["user_idea"], state["api"])
        state["security"] = envelope.outputs
        
        run_record = AgentRun(
            architecture_id=state["architecture_id"],
            agent_name="security_agent",
            status="complete",
            output=json.dumps(envelope.model_dump()),
            confidence=envelope.confidence
        )
        session.add(run_record)
        session.commit()
        
    await notify_progress(state["websocket_client_id"], "security_agent", "completed", envelope.outputs)
    return state

async def devops_node(state: GraphState) -> GraphState:
    state["current_agent"] = "devops_agent"
    await notify_progress(state["websocket_client_id"], "devops_agent", "running")
    
    with Session(engine) as session:
        db_api_outputs = {
            "database": state["database"],
            "api": state["api"]
        }
        envelope = run_devops_agent(session, state["user_idea"], db_api_outputs)
        state["devops"] = envelope.outputs
        
        run_record = AgentRun(
            architecture_id=state["architecture_id"],
            agent_name="devops_agent",
            status="complete",
            output=json.dumps(envelope.model_dump()),
            confidence=envelope.confidence
        )
        session.add(run_record)
        session.commit()
        
    await notify_progress(state["websocket_client_id"], "devops_agent", "completed", envelope.outputs)
    return state

async def architect_node(state: GraphState) -> GraphState:
    state["current_agent"] = "architecture_agent"
    await notify_progress(state["websocket_client_id"], "architecture_agent", "running")
    
    with Session(engine) as session:
        inputs = {
            "requirements": state["requirements"],
            "database": state["database"],
            "api": state["api"],
            "security": state["security"],
            "devops": state["devops"]
        }
        envelope = run_architect_agent(session, state["user_idea"], inputs)
        state["architecture"] = envelope.outputs
        
        run_record = AgentRun(
            architecture_id=state["architecture_id"],
            agent_name="architecture_agent",
            status="complete",
            output=json.dumps(envelope.model_dump()),
            confidence=envelope.confidence
        )
        session.add(run_record)
        session.commit()
        
    await notify_progress(state["websocket_client_id"], "architecture_agent", "completed", envelope.outputs)
    return state

async def cost_node(state: GraphState) -> GraphState:
    state["current_agent"] = "cost_agent"
    await notify_progress(state["websocket_client_id"], "cost_agent", "running")
    
    with Session(engine) as session:
        envelope = run_cost_agent(session, state["user_idea"], state["architecture"])
        state["cost"] = envelope.outputs
        
        run_record = AgentRun(
            architecture_id=state["architecture_id"],
            agent_name="cost_agent",
            status="complete",
            output=json.dumps(envelope.model_dump()),
            confidence=envelope.confidence
        )
        session.add(run_record)
        session.commit()
        
    await notify_progress(state["websocket_client_id"], "cost_agent", "completed", envelope.outputs)
    return state

async def scale_node(state: GraphState) -> GraphState:
    state["current_agent"] = "scale_simulation_agent"
    await notify_progress(state["websocket_client_id"], "scale_simulation_agent", "running")
    
    with Session(engine) as session:
        db_api_outputs = {
            "database": state["database"],
            "api": state["api"],
            "architecture": state["architecture"]
        }
        envelope = run_scale_agent(session, state["user_idea"], db_api_outputs)
        state["scale"] = envelope.outputs
        
        run_record = AgentRun(
            architecture_id=state["architecture_id"],
            agent_name="scale_simulation_agent",
            status="complete",
            output=json.dumps(envelope.model_dump()),
            confidence=envelope.confidence
        )
        session.add(run_record)
        session.commit()
        
    await notify_progress(state["websocket_client_id"], "scale_simulation_agent", "completed", envelope.outputs)
    return state

async def threat_modeling_node(state: GraphState) -> GraphState:
    state["current_agent"] = "threat_modeling_agent"
    await notify_progress(state["websocket_client_id"], "threat_modeling_agent", "running")
    
    with Session(engine) as session:
        db_api_sec = {
            "database": state["database"],
            "api": state["api"],
            "security": state["security"]
        }
        envelope = run_threat_modeling_agent(session, state["user_idea"], db_api_sec)
        state["threat_model"] = envelope.outputs
        
        run_record = AgentRun(
            architecture_id=state["architecture_id"],
            agent_name="threat_modeling_agent",
            status="complete",
            output=json.dumps(envelope.model_dump()),
            confidence=envelope.confidence
        )
        session.add(run_record)
        session.commit()
        
    await notify_progress(state["websocket_client_id"], "threat_modeling_agent", "completed", envelope.outputs)
    return state

async def tradeoff_node(state: GraphState) -> GraphState:
    state["current_agent"] = "tradeoff_agent"
    await notify_progress(state["websocket_client_id"], "tradeoff_agent", "running")
    
    with Session(engine) as session:
        inputs = {
            "requirements": state["requirements"],
            "architecture": state["architecture"],
            "cost": state["cost"]
        }
        envelope = run_tradeoff_agent(session, state["user_idea"], inputs)
        state["tradeoffs"] = envelope.outputs
        
        run_record = AgentRun(
            architecture_id=state["architecture_id"],
            agent_name="tradeoff_agent",
            status="complete",
            output=json.dumps(envelope.model_dump()),
            confidence=envelope.confidence
        )
        session.add(run_record)
        session.commit()
        
    await notify_progress(state["websocket_client_id"], "tradeoff_agent", "completed", envelope.outputs)
    return state

async def judge_node(state: GraphState) -> GraphState:
    state["current_agent"] = "llm_judge"
    await notify_progress(state["websocket_client_id"], "llm_judge", "running")
    
    with Session(engine) as session:
        inputs = {
            "requirements": state["requirements"],
            "database": state["database"],
            "api": state["api"],
            "security": state["security"],
            "devops": state["devops"],
            "architecture": state["architecture"],
            "cost": state["cost"],
            "scale": state["scale"]
        }
        envelope = run_judge_agent(session, state["user_idea"], inputs)
        state["judge_results"] = envelope.outputs
        
        # Update architecture record status & readiness score
        arch = session.get(Architecture, state["architecture_id"])
        if arch:
            arch.production_readiness_score = envelope.outputs.get("production_readiness", 87)
            if envelope.status == "failed" and state["iterations"] < 2:
                arch.status = "running"
            elif envelope.status == "failed":
                arch.status = "review_required"
            else:
                arch.status = "completed"
            session.add(arch)
            session.commit()
            
        run_record = AgentRun(
            architecture_id=state["architecture_id"],
            agent_name="llm_judge",
            status="complete" if envelope.status != "failed" else "failed",
            output=json.dumps(envelope.model_dump()),
            confidence=envelope.confidence
        )
        session.add(run_record)
        session.commit()
        
    await notify_progress(state["websocket_client_id"], "llm_judge", "completed", envelope.outputs)
    return state

# Routing logic for self healing
def route_self_healing(state: GraphState) -> Literal["database_agent", "api_agent", "cost_agent", "end"]:
    judge_res = state.get("judge_results")
    if not judge_res:
        return "end"
        
    # Check if there is healing instructions and we are under the iteration limit
    healing = judge_res.get("healing_directions")
    if healing and state["iterations"] < 3:
        state["iterations"] += 1
        resp_agent = healing.get("responsible_agent")
        
        print(f"Self-Healing active: rerouting to {resp_agent} (Iteration {state['iterations']}/3)")
        
        if resp_agent == "database_agent":
            return "database_agent"
        elif resp_agent == "api_agent":
            return "api_agent"
        elif resp_agent == "cost_agent":
            return "cost_agent"
            
    return "end"

# Graph creation
workflow = StateGraph(GraphState)

# Add Nodes
workflow.add_node("requirements_agent", requirements_node)
workflow.add_node("planner_agent", planner_node)
workflow.add_node("database_agent", database_node)
workflow.add_node("api_agent", api_node)
workflow.add_node("security_agent", security_node)
workflow.add_node("devops_agent", devops_node)
workflow.add_node("architecture_agent", architect_node)
workflow.add_node("cost_agent", cost_node)
workflow.add_node("scale_simulation_agent", scale_node)
workflow.add_node("threat_modeling_agent", threat_modeling_node)
workflow.add_node("tradeoff_agent", tradeoff_node)
workflow.add_node("llm_judge", judge_node)

# Connect Edges
workflow.set_entry_point("requirements_agent")
workflow.add_edge("requirements_agent", "planner_agent")
workflow.add_edge("planner_agent", "database_agent")
workflow.add_edge("database_agent", "api_agent")
workflow.add_edge("api_agent", "security_agent")
workflow.add_edge("security_agent", "devops_agent")
workflow.add_edge("devops_agent", "architecture_agent")

# Parallel/Sequential following architect
workflow.add_edge("architecture_agent", "cost_agent")
workflow.add_edge("cost_agent", "scale_simulation_agent")
workflow.add_edge("scale_simulation_agent", "threat_modeling_agent")
workflow.add_edge("threat_modeling_agent", "tradeoff_agent")
workflow.add_edge("tradeoff_agent", "llm_judge")

# Add conditional healing edge
workflow.add_conditional_edges(
    "llm_judge",
    route_self_healing,
    {
        "database_agent": "database_agent",
        "api_agent": "api_agent",
        "cost_agent": "cost_agent",
        "end": END
    }
)

app_graph = workflow.compile()
