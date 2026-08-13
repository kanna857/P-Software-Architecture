import json
from typing import Dict, Any
from sqlmodel import Session
from app.agents.base import AgentEnvelope, get_llm
from app.rag.search import hybrid_retrieve
from langchain_core.messages import SystemMessage, HumanMessage
from app.agents.project_classifier import classify_project

def run_requirements_agent(session: Session, idea: str, project_meta: Dict[str, Any]) -> AgentEnvelope:
    """
    Extracts functional & non-functional requirements, constraints, and assumptions.
    Integrates Hybrid RAG contexts.
    """
    # 1. Retrieve relevant RAG documentation
    rag_docs = hybrid_retrieve(session, idea, "Database", top_k=2)
    rag_context = "\n\n".join([f"[{d['title']}]: {d['content']}" for d in rag_docs])
    
    # 2. Get LLM and run
    llm = get_llm()
    if llm:
        system_prompt = (
            "You are a Requirements Engineering Agent.\n"
            "Analyze the software idea and project metadata. Extract:\n"
            "- Functional Requirements\n"
            "- Non-Functional Requirements\n"
            "- Primary Target Users & Actors\n"
            "- Constraints & Technical Assumptions\n"
            "- Integrations and compliance requirements.\n\n"
            f"Use the following architecture knowledge where appropriate:\n{rag_context}\n\n"
            "Return JSON matching the schema of AgentEnvelope where status is 'complete' and outputs contains the fields: "
            "functional_requirements (list), non_functional_requirements (list), actors (list), constraints (list), assumptions (list), integrations (list)."
        )
        human_prompt = f"Idea: {idea}\nMetadata: {json.dumps(project_meta)}"
        
        try:
            # We use structured output if supported, or prompt with JSON format instructions
            structured_llm = llm.with_structured_output(AgentEnvelope)
            envelope = structured_llm.invoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=human_prompt)
            ])
            return envelope
        except Exception as e:
            print(f"Requirements LLM failed or not supported with structured outputs: {e}. Falling back to default parser.")
            
    # Dynamic fallback project classification
    proj_info = classify_project(idea, project_meta)
    
    outputs = {
        "functional_requirements": proj_info["functional_requirements"],
        "non_functional_requirements": [
            f"Scalability: Target capacity support matching expected users: {project_meta.get('expected_users') or '100,000 users'}.",
            f"Performance: Fast latency profiles under 150ms with custom indexes and caching strategies.",
            f"Availability: Designed with {project_meta.get('availability_req') or '99.9% Uptime Multi-AZ'} targets.",
            f"Compliance: Adherence to security standards: {project_meta.get('compliance_req') or 'GDPR / industry compliance'}."
        ],
        "actors": proj_info["actors"],
        "constraints": [
            f"Budget limit: {project_meta.get('budget') or '$500/month'}.",
            f"Infrastructure cloud environment: {project_meta.get('cloud_preference') or 'AWS'}.",
            "No external shared state in APIs for stateless operations"
        ],
        "assumptions": [
            "Users access application interfaces via standard web browsers.",
            "Security headers and rate limiting are enforced at the API gateway layer."
        ],
        "integrations": proj_info["integrations"],
        "project_info": proj_info
    }
    
    return AgentEnvelope(
        agent="requirements_agent",
        status="complete",
        outputs=outputs,
        dependencies_on=[],
        conflicts_flagged=[],
        confidence=0.9
    )
