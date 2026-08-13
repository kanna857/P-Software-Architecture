import json
from typing import Dict, Any
from sqlmodel import Session
from app.agents.base import AgentEnvelope, get_llm
from app.rag.search import hybrid_retrieve
from langchain_core.messages import SystemMessage, HumanMessage
from app.agents.project_classifier import classify_project

def run_database_agent(session: Session, idea: str, requirements: Dict[str, Any]) -> AgentEnvelope:
    """
    Designs the database schema, entity structures, indexing, and replication strategies.
    Uses Database knowledge-base retrieval.
    """
    rag_docs = hybrid_retrieve(session, "caching connection pooling postgres database design", "Database", top_k=2)
    rag_context = "\n\n".join([f"[{d['title']}]: {d['content']}" for d in rag_docs])
    
    llm = get_llm()
    if llm:
        system_prompt = (
            "You are a Database Architecture Agent.\n"
            "Analyze the software requirements and design a robust database architecture.\n"
            "Provide the primary database type (e.g., Relational / PostgreSQL), caching strategy, "
            "schema table list with relationships, indexes, partitioning strategy, and generated SQL and Prisma schemas.\n\n"
            f"Use this database knowledge base content:\n{rag_context}\n\n"
            "Return JSON matching the schema of AgentEnvelope where status is 'complete' and outputs contains fields: "
            "db_type (str), caching_strategy (str), schemas (dict with tables list, sql script, prisma schema, index recommendations)."
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
            print(f"Database LLM failed: {e}. Falling back to default schema generator.")

    # Retrieve or generate project-specific database design details
    proj_info = requirements.get("project_info")
    if not proj_info:
        proj_info = classify_project(idea, {})
        
    tables = proj_info["tables"]
    sql_script = proj_info["sql_script"]
    prisma_schema = proj_info["prisma_schema"]
    db_type = proj_info["db_type"]
    caching_strategy = proj_info["caching_strategy"]
    partitioning = proj_info["partitioning"]
    replication = proj_info["replication"]

    return AgentEnvelope(
        agent="database_agent",
        status="complete",
        outputs={
            "db_type": db_type,
            "caching_strategy": caching_strategy,
            "partitioning": partitioning,
            "replication": replication,
            "tables": tables,
            "sql_script": sql_script,
            "prisma_schema": prisma_schema,
            "index_recommendations": [t["indexes"][0] for t in tables if t.get("indexes")]
        },
        dependencies_on=["requirements_agent"],
        conflicts_flagged=[],
        confidence=0.88
    )
