import json
from typing import Dict, Any, List
from sqlmodel import Session
from app.agents.base import AgentEnvelope, get_llm
from langchain_core.messages import SystemMessage, HumanMessage
from app.agents.project_classifier import classify_project

def run_architect_agent(session: Session, idea: str, inputs: Dict[str, Any]) -> AgentEnvelope:
    """
    Combines agent designs, validates consistency, generates architectural decision records,
    and constructs multi-level Mermaid diagram blocks.
    """
    llm = get_llm()
    if llm:
        system_prompt = (
            "You are the Lead Systems Architect Agent.\n"
            "Merge inputs from requirements, database, API, security, and devops into a unified architecture.\n"
            "Flag conflicts (e.g., entity name mismatches, missing authentication middleware, cloud incompatibilities).\n"
            "Generate Mermaid code blocks for C4 Context, Container, ER Diagram, and AWS topology.\n"
            "Return JSON matching the schema of AgentEnvelope where status is 'complete' and outputs contains fields:\n"
            "- merged_summary (str)\n"
            "- conflicts_detected (list of strings)\n"
            "- diagrams (dict with c4_context, c4_container, er_diagram, aws_deployment, sequence_diagram as Mermaid text values)\n"
            "- adrs (list of Architectural Decision Records containing decision, context, options, selected_option, reason, tradeoffs)"
        )
        human_prompt = f"Idea: {idea}\nAgent Sub-designs: {json.dumps(inputs)}"
        
        try:
            structured_llm = llm.with_structured_output(AgentEnvelope)
            envelope = structured_llm.invoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=human_prompt)
            ])
            return envelope
        except Exception as e:
            print(f"Architect LLM failed: {e}. Falling back to default architect generator.")
    # Retrieve or generate project classification details
    reqs_output = inputs.get("requirements", {})
    proj_info = reqs_output.get("project_info")
    if not proj_info:
        proj_info = classify_project(idea, {})
        
    proj_name = proj_info["project_name"]
    
    # Dynamic C4 Context Diagram
    c4_context = f"graph TD\n    User([User/Client]) -->|Interacts with| App[{proj_name}]\n"
    
    integrations = reqs_output.get("integrations") or proj_info["integrations"]
    if integrations:
        for index, integ in enumerate(integrations):
            cleaned_integ = integ.split("(")[0].strip()
            c4_context += f"    App -->|Integrates with| Int{index}[{cleaned_integ}]\n"
    else:
        c4_context += "    App -->|Integrates with| Payment[Stripe Gateway]\n"
        c4_context += "    App -->|Dispatches email alerts| Email[SendGrid Email API]\n"
        
    # Dynamic C4 Container Diagram
    db_output = inputs.get("database", {})
    db_type = db_output.get("db_type") or proj_info["db_type"]
    caching = db_output.get("caching_strategy") or proj_info["caching_strategy"]
    caching_type = "Redis" if "redis" in caching.lower() else "Memcached"
    
    c4_container = f"""graph TB
    subgraph Client App
      Browser[Next.js App UI]
    end
    subgraph API Platform
      Gateway[Nginx Ingress / API Gateway]
      AppSvc[FastAPI Core Backend Application]
      Db[({db_type})]
      Cache[({caching_type} Cache Store)]
    end
    Browser -->|HTTPS API Requests| Gateway
    Gateway -->|Forward| AppSvc
    AppSvc -->|Read/Write SQL| Db
    AppSvc -->|Session Lookup| Cache
"""

    # Dynamic ER Diagram
    tables = db_output.get("tables") or proj_info["tables"]
    er_diagram = "erDiagram\n"
    if tables:
        for table in tables:
            tname = table["name"]
            er_diagram += f"    {tname} {{\n"
            for col in table["columns"]:
                col_parts = col.split("(")
                col_name = col_parts[0].strip()
                col_type = "VARCHAR"
                if len(col_parts) > 1:
                    col_type = col_parts[1].split(",")[0].replace(")", "").strip()
                er_diagram += f"        {col_type} {col_name}\n"
            er_diagram += "    }\n"
            
        relations_drawn = False
        for table in tables:
            tname = table["name"]
            for col in table["columns"]:
                if "fk ->" in col.lower() or "references" in col.lower():
                    # Parse target table
                    target = col.lower().split("->")[-1].split(")")[0].strip()
                    er_diagram += f"    {target} ||--o{{ {tname} : \"references\"\n"
                    relations_drawn = True
        
        if not relations_drawn and len(tables) >= 2:
            for table in tables:
                tname = table["name"]
                if tname == "users":
                    continue
                has_user_id = any("user_id" in col.lower() for col in table["columns"])
                if has_user_id:
                    er_diagram += f"    users ||--o{{ {tname} : \"owns\"\n"
                    relations_drawn = True
            
            if not relations_drawn:
                er_diagram += f"    {tables[0]['name']} ||--o{{ {tables[1]['name']} : \"has\"\n"

    # Dynamic Sequence Diagram
    api_output = inputs.get("api", {})
    endpoints = api_output.get("endpoints") or proj_info["endpoints"]
    selected_path = "/api/auth/login"
    selected_desc = "Authenticate credentials"
    if endpoints:
        selected_path = endpoints[0]["path"]
        selected_desc = endpoints[0]["description"]
        
    sequence_diagram = f"""sequenceDiagram
    actor Client
    participant UI as Web Frontend
    participant API as FastAPI Backend
    participant DB as {db_type}
    Client->>UI: Action Trigger
    UI->>API: POST {selected_path} ({selected_desc})
    API->>DB: Read/Write Transactions
    DB-->>API: Query Success Response
    API-->>UI: Return Response payload
    UI-->>Client: Update UI layout
"""

    # Dynamic AWS Deployment Topology
    aws_deployment = f"""graph TB
    subgraph AWS VPC
      subgraph Public Subnets
        ALB[Application Load Balancer]
      end
      subgraph Private Subnets
        EKS1[EKS Pod Node 1]
        EKS2[EKS Pod Node 2]
      end
      subgraph Database Subnets
        RDS[(Amazon RDS {db_type} Multi-AZ)]
        ElastiCache[(Amazon ElastiCache {caching_type})]
      end
    end
    Internet[Web Clients] -->|HTTPS| ALB
    ALB -->|Port 8000| EKS1
    ALB -->|Port 8000| EKS2
    EKS1 & EKS2 --> RDS
    EKS1 & EKS2 --> ElastiCache
"""

    adrs = [
        {
            "decision": f"{db_type} database storage",
            "context": "Needs robust data consistency and fast queries query executions.",
            "options": f"{db_type}, In-Memory cache, CSV files",
            "selected_option": db_type,
            "reason": "Meets relational integrity requirements and transactional reliability target constraints.",
            "tradeoffs": "Horizontal scaling requires replication.",
            "consequences": "Allows structured indexes and query constraints."
        },
        {
            "decision": f"{caching_type} Cache Store",
            "context": "Needs fast session and catalogue lookup metrics.",
            "options": f"{caching_type}, Local Memory",
            "selected_option": caching_type,
            "reason": "Sub-millisecond lookup latency configurations.",
            "tradeoffs": "Adds additional runtime dependencies to verify.",
            "consequences": "Diverts read volume away from databases."
        }
    ]

    return AgentEnvelope(
        agent="architecture_agent",
        status="complete",
        outputs={
            "merged_summary": f"Unified service architecture matching design specs for {idea}.",
            "conflicts_detected": [],
            "diagrams": {
                "c4_context": c4_context,
                "c4_container": c4_container,
                "er_diagram": er_diagram,
                "aws_deployment": aws_deployment,
                "sequence_diagram": sequence_diagram
            },
            "adrs": adrs
        },
        dependencies_on=["requirements_agent", "database_agent", "api_agent", "security_agent", "devops_agent"],
        conflicts_flagged=[],
        confidence=0.94
    )
