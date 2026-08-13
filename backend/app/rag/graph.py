from typing import List, Dict, Any
from sqlmodel import Session, select
from app.models.project import KnowledgeGraphEdge
from app.database import engine

# Predefined trusted relations to prevent auto-generating corrupt connections
TRUSTED_GRAPH_RULES = {
    "React": {"supports": ["REST API", "GraphQL", "Next.js"]},
    "REST API": {"uses": ["JWT", "OAuth2", "HTTPS"]},
    "JWT": {"implements": ["Authentication", "Session Token"]},
    "PostgreSQL": {"matches": ["PgBouncer", "SQLModel", "SQLAlchemy"]},
    "Kubernetes": {"deploys": ["Docker Container", "Helm Chart"]},
    "Redis": {"caches": ["Product Catalog", "Session Database"]}
}

def validate_relationship(source: str, target: str, relationship_type: str) -> bool:
    """
    Checks the compatibility database to ensure arbitrary relations
    do not pollute the trusted knowledge graph.
    """
    # Strict rule validation check
    if source in TRUSTED_GRAPH_RULES:
        allowed = TRUSTED_GRAPH_RULES[source].get(relationship_type, [])
        if target in allowed:
            return True
    return False

def add_graph_edge(session: Session, source: str, target: str, relationship_type: str) -> bool:
    """Validates and adds an edge to the SQL Knowledge Graph."""
    if not validate_relationship(source, target, relationship_type):
        print(f"Edge rejected: {source} -> {relationship_type} -> {target} does not pass verification guidelines.")
        return False
        
    # Check if edge already exists
    stmt = (
        select(KnowledgeGraphEdge)
        .where(KnowledgeGraphEdge.source == source)
        .where(KnowledgeGraphEdge.target == target)
        .where(KnowledgeGraphEdge.relationship_type == relationship_type)
    )
    existing = session.exec(stmt).first()
    if existing:
        return True
        
    edge = KnowledgeGraphEdge(source=source, target=target, relationship_type=relationship_type)
    session.add(edge)
    session.commit()
    return True

def query_graph_connections(session: Session, node_name: str) -> List[Dict[str, Any]]:
    """Returns outbound edges representing architectural dependencies."""
    stmt = select(KnowledgeGraphEdge).where(
        (KnowledgeGraphEdge.source == node_name) | (KnowledgeGraphEdge.target == node_name)
    )
    edges = session.exec(stmt).all()
    return [
        {
            "source": e.source,
            "target": e.target,
            "relationship": e.relationship_type
        } for e in edges
    ]

def seed_knowledge_graph(session: Session):
    """Preloads the database with verified technology linkages."""
    count = session.exec(select(KnowledgeGraphEdge)).first()
    if count:
        return
        
    for source, relations in TRUSTED_GRAPH_RULES.items():
        for rel_type, targets in relations.items():
            for target in targets:
                add_graph_edge(session, source, target, rel_type)
