import json
from typing import Dict, Any
from sqlmodel import Session
from app.agents.base import AgentEnvelope, get_llm
from app.rag.search import hybrid_retrieve
from langchain_core.messages import SystemMessage, HumanMessage
from app.agents.project_classifier import classify_project

def run_api_agent(session: Session, idea: str, db_design: Dict[str, Any]) -> AgentEnvelope:
    """
    Generates API Specs, routes, payloads, and complete OpenAPI YAML/JSON definitions.
    """
    rag_docs = hybrid_retrieve(session, "REST API OpenAPI jwt authentication rate limiting", "Database", top_k=2)
    rag_context = "\n\n".join([f"[{d['title']}]: {d['content']}" for d in rag_docs])
    
    llm = get_llm()
    if llm:
        system_prompt = (
            "You are an API Design Agent.\n"
            "Analyze the database design and generate REST API routes, schemas, pagination, rate limits, and an OpenAPI 3.0 specification.\n\n"
            f"Use the following knowledge:\n{rag_context}\n\n"
            "Return JSON matching the schema of AgentEnvelope where status is 'complete' and outputs contains the fields:\n"
            "- endpoints (list of routes with path, method, description, request_body, response_body)\n"
            "- rate_limiting (rate limit config detail)\n"
            "- openapi_spec (string representation of YAML/JSON OpenAPI specification)"
        )
        human_prompt = f"Idea: {idea}\nDatabase Design: {json.dumps(db_design)}"
        
        try:
            structured_llm = llm.with_structured_output(AgentEnvelope)
            envelope = structured_llm.invoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=human_prompt)
            ])
            return envelope
        except Exception as e:
            print(f"API LLM failed: {e}. Falling back to default spec generator.")

    proj_info = None
    if isinstance(db_design, dict):
        proj_info = db_design.get("project_info")
    if not proj_info:
        proj_info = classify_project(idea, {})
        
    endpoints = proj_info["endpoints"]
    
    openapi_spec = {
      "openapi": "3.0.0",
      "info": {
        "title": f"{proj_info['project_name']} API",
        "version": "1.0.0",
        "description": "Standard REST API generated for: " + idea
      },
      "paths": {}
    }
    
    for ep in endpoints:
        path = ep["path"]
        method = ep["method"].lower()
        if path not in openapi_spec["paths"]:
            openapi_spec["paths"][path] = {}
        openapi_spec["paths"][path][method] = {
            "summary": ep["description"],
            "responses": {
                "200": {
                    "description": "Successful operation"
                }
            }
        }
    
    return AgentEnvelope(
        agent="api_agent",
        status="complete",
        outputs={
            "endpoints": endpoints,
            "authentication": "Bearer JWT with RS256 signing. Refresh token stored in secure HttpOnly cookie.",
            "pagination": "Cursor pagination on database queries using 'limit' and 'cursor_uuid' parameters.",
            "rate_limiting": "Bucket rate limiter: 100 requests per minute per IP for standard endpoints, 10 per minute for auth routes.",
            "openapi_spec": json.dumps(openapi_spec, indent=2)
        },
        dependencies_on=["database_agent"],
        conflicts_flagged=[],
        confidence=0.91
    )
