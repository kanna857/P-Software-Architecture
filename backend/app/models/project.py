from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    role: str = "USER"  # "ADMIN", "ARCHITECT", "USER"
    full_name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Project(SQLModel, table=True):
    __tablename__ = "projects"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    industry: Optional[str] = None
    expected_users: Optional[str] = None
    expected_traffic: Optional[str] = None
    cloud_preference: Optional[str] = None
    availability_req: Optional[str] = None
    budget: Optional[str] = None
    tech_preference: Optional[str] = None
    security_req: Optional[str] = None
    compliance_req: Optional[str] = None
    additional_req: Optional[str] = None
    user_id: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Architecture(SQLModel, table=True):
    __tablename__ = "architectures"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="projects.id")
    name: str
    version: int = 1
    selected_option: str = "balanced"  # "cost_optimized", "balanced", "high_scale"
    status: str = "pending"  # "pending", "running", "completed", "failed", "review_required"
    production_readiness_score: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ArchitectureVersion(SQLModel, table=True):
    __tablename__ = "architecture_versions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    architecture_id: int = Field(foreign_key="architectures.id")
    version_num: int
    data: str  # JSON text storing full architecture result details
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AgentRun(SQLModel, table=True):
    __tablename__ = "agent_runs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    architecture_id: int = Field(foreign_key="architectures.id")
    agent_name: str
    status: str  # "pending", "running", "complete", "failed", "needs_input", "conflict"
    output: Optional[str] = None  # JSON text representing the envelope output
    confidence: float = 0.0
    error_message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class RAGDocument(SQLModel, table=True):
    __tablename__ = "rag_documents"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str
    collection_name: str  # "Security", "DevOps", "Database", etc.
    embedding_json: Optional[str] = None  # JSON serialization of embedding vector
    created_at: datetime = Field(default_factory=datetime.utcnow)

class KnowledgeGraphEdge(SQLModel, table=True):
    __tablename__ = "knowledge_graph_edges"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    source: str  # Node name (e.g. "React")
    target: str  # Node name (e.g. "REST API")
    relationship_type: str  # "supports", "uses", "implements", "secures"
    weight: float = 1.0
