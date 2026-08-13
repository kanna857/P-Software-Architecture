import json
from typing import Dict, Any
from sqlmodel import Session
from app.agents.base import AgentEnvelope, get_llm
from langchain_core.messages import SystemMessage, HumanMessage

def run_planner_agent(session: Session, idea: str, requirements: Dict[str, Any]) -> AgentEnvelope:
    """
    Analyzes requirements and produces a step-by-step agent execution plan,
    determining dependencies and parallel run eligibility.
    """
    llm = get_llm()
    if llm:
        system_prompt = (
            "You are a Project Planner Agent.\n"
            "Analyze the software idea and extracted requirements. Decompose the architecture work into subtasks.\n"
            "Decide which agents (database_agent, api_agent, security_agent, devops_agent) need to execute and their order.\n"
            "Return JSON matching the schema of AgentEnvelope where status is 'complete' and outputs contains the fields:\n"
            "- execution_steps (list of tasks with name, agent, status, and depends_on)\n"
            "- parallel_eligible (boolean indicating if database, api, security, and devops can run in parallel)"
        )
        human_prompt = f"Idea: {idea}\nRequirements: {json.dumps(requirements)}"
        
        try:
            structured_llm = llm.with_structured_output(AgentEnvelope)
            envelope = structured_llm.invoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=human_prompt)
            ])
            return envelope
        except Exception as e:
            print(f"Planner LLM execution failed: {e}. Falling back to default plan.")
            
    # Default plan
    steps = [
        {"name": "Database Schema Planning", "agent": "database_agent", "status": "pending", "depends_on": []},
        {"name": "API Spec Generation", "agent": "api_agent", "status": "pending", "depends_on": ["database_agent"]},
        {"name": "Security Risk Analysis", "agent": "security_agent", "status": "pending", "depends_on": ["api_agent"]},
        {"name": "Infrastructure Manifest Creation", "agent": "devops_agent", "status": "pending", "depends_on": ["database_agent", "api_agent"]}
    ]
    
    return AgentEnvelope(
        agent="planner_agent",
        status="complete",
        outputs={
            "execution_steps": steps,
            "parallel_eligible": True,
            "recommended_agents": ["database_agent", "api_agent", "security_agent", "devops_agent"]
        },
        dependencies_on=["requirements_agent"],
        conflicts_flagged=[],
        confidence=0.95
    )
