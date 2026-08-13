import os
import json
import pytest
from sqlmodel import Session, SQLModel, create_engine, select
from app.models.project import Project, Architecture, ArchitectureVersion, AgentRun, RAGDocument
from app.rag.search import get_embedding, cosine_similarity, hybrid_retrieve, seed_rag_database
from app.agents.requirements import run_requirements_agent
from app.agents.judge import run_judge_agent
from app.agents.base import AgentEnvelope

# Setup test DB (in-memory SQLite)
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})

@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

def test_db_setup(session):
    # Verify tables can be created and queried
    project = Project(
        name="E-Commerce API",
        description="E-commerce web backend",
        industry="Retail",
        expected_users="100000"
    )
    session.add(project)
    session.commit()
    session.refresh(project)
    
    assert project.id is not None
    assert project.name == "E-Commerce API"
    
    arch = Architecture(project_id=project.id, name="v1 design", status="pending")
    session.add(arch)
    session.commit()
    session.refresh(arch)
    
    assert arch.id is not None
    assert arch.project_id == project.id

def test_rag_seeding_and_retrieval(session):
    # Seed
    seed_rag_database(session)
    
    # Retrieve
    docs = session.exec(select(RAGDocument)).all()
    assert len(docs) > 0
    
    # Search
    results = hybrid_retrieve(session, "PostgreSQL database connection pooling scaling", "Database", top_k=2)
    assert len(results) > 0
    assert any("PostgreSQL" in r["title"] or "PostgreSQL" in r["content"] for r in results)

def test_requirements_agent_contract(session):
    idea = "Build a chat app for 5000 users with end-to-end encryption"
    envelope = run_requirements_agent(session, idea, {"industry": "Messaging"})
    
    assert isinstance(envelope, AgentEnvelope)
    assert envelope.agent == "requirements_agent"
    assert envelope.status == "complete"
    assert "functional_requirements" in envelope.outputs
    assert len(envelope.outputs["functional_requirements"]) > 0

def test_judge_agent_contract(session):
    idea = "Build an e-commerce platform"
    architecture_mock = {
        "requirements": ["Auth", "Catalog", "Checkout"],
        "database": {"db_type": "PostgreSQL"},
        "api": {"endpoints": []},
        "security": {"owasp_mitigations": []},
        "devops": {"dockerfile": ""}
    }
    
    envelope = run_judge_agent(session, idea, architecture_mock)
    
    assert isinstance(envelope, AgentEnvelope)
    assert envelope.agent == "llm_judge"
    assert envelope.outputs["production_readiness"] > 0
    assert "scores" in envelope.outputs

def test_version_increment_and_delete(session):
    proj = Project(name="Test Proj", description="Test Desc")
    session.add(proj)
    session.commit()
    
    arch = Architecture(project_id=proj.id, name="Test Arch", version=1, status="pending")
    session.add(arch)
    session.commit()
    
    assert arch.version == 1
    
    ver = ArchitectureVersion(architecture_id=arch.id, version_num=1, data=json.dumps({"test": "data"}))
    session.add(ver)
    session.commit()
    
    # Verify it exists
    queried_ver = session.exec(select(ArchitectureVersion).where(ArchitectureVersion.architecture_id == arch.id)).first()
    assert queried_ver is not None
    assert queried_ver.version_num == 1
    
    # Delete and verify
    session.delete(queried_ver)
    session.commit()
    
    deleted_ver = session.exec(select(ArchitectureVersion).where(ArchitectureVersion.architecture_id == arch.id)).first()
    assert deleted_ver is None
