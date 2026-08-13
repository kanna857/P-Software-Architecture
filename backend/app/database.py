import os
from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./architect.db")

# For SQLite, we need to allow multiple threads to access it
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)

def init_db():
    # Import all models to ensure they are registered with SQLModel.metadata
    from app.models.project import Project, Architecture, ArchitectureVersion, AgentRun, RAGDocument, KnowledgeGraphEdge, User
    SQLModel.metadata.create_all(engine)

def get_db():
    with Session(engine) as session:
        yield session
