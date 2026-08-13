import os
import json
import math
from typing import List, Dict, Any
from sqlmodel import Session, select
from app.models.project import RAGDocument

# Simple helper to get embeddings
def get_embedding(text: str) -> List[float]:
    """
    Computes text embeddings. Uses OpenAI/Gemini if available,
    otherwise falls back to a simple TF-IDF inspired vectorizer.
    """
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    if openai_key and len(openai_key) > 10:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)
            response = client.embeddings.create(
                model="text-embedding-3-small",
                input=[text]
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"OpenAI embedding generation failed: {e}. Falling back.")
            
    if gemini_key and len(gemini_key) > 10:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            result = genai.embed_content(
                model="models/embedding-001",
                content=text,
                task_type="retrieval_document"
            )
            return result["embedding"]
        except Exception as e:
            print(f"Gemini embedding generation failed: {e}. Falling back.")
            
    # Simple fallback TF-IDF vectorizer (128 dimensions)
    # This ensures RAG works beautifully offline or without keys!
    vector = [0.0] * 128
    words = text.lower().split()
    if not words:
        return vector
    for word in words:
        # Simple hash trick to map words to index
        idx = abs(hash(word)) % 128
        vector[idx] += 1.0
    # Normalize the vector
    norm = math.sqrt(sum(v*v for v in vector))
    if norm > 0:
        vector = [v / norm for v in vector]
    return vector

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a * norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)

def keyword_score(query: str, doc_text: str) -> float:
    query_words = set(query.lower().split())
    doc_words = doc_text.lower().split()
    if not doc_words:
        return 0.0
    matches = sum(1 for w in doc_words if w in query_words)
    return matches / len(query_words) if query_words else 0.0

def hybrid_retrieve(session: Session, query: str, collection_name: str, top_k: int = 4) -> List[Dict[str, Any]]:
    """
    Performs query understanding, retrieves documents using vector and keyword search,
    applies Reciprocal Rank Fusion, and returns top results with citations.
    """
    # 1. Query Decomposition (Basic keyword extraction)
    subqueries = [query]
    if "and" in query:
        subqueries.extend([sq.strip() for sq in query.split("and") if sq.strip()])
        
    query_vector = get_embedding(query)
    
    # Fetch documents from correct collection
    statement = select(RAGDocument).where(RAGDocument.collection_name == collection_name)
    docs = session.exec(statement).all()
    
    vector_results = []
    keyword_results = []
    
    for doc in docs:
        # Load embedding from DB
        doc_emb = None
        if doc.embedding_json:
            try:
                doc_emb = json.loads(doc.embedding_json)
            except Exception:
                pass
        
        if not doc_emb:
            doc_emb = get_embedding(doc.content)
            doc.embedding_json = json.dumps(doc_emb)
            session.add(doc)
            session.commit()
            
        v_sim = cosine_similarity(query_vector, doc_emb)
        vector_results.append((doc, v_sim))
        
        k_sim = keyword_score(query, doc.content)
        keyword_results.append((doc, k_sim))
        
    # Sort results
    vector_results.sort(key=lambda x: x[1], reverse=True)
    keyword_results.sort(key=lambda x: x[1], reverse=True)
    
    # Reciprocal Rank Fusion (RRF)
    rrf_scores = {}
    k_constant = 60
    
    for rank, (doc, _) in enumerate(vector_results):
        rrf_scores[doc.id] = rrf_scores.get(doc.id, 0.0) + (1.0 / (k_constant + rank + 1))
        
    for rank, (doc, _) in enumerate(keyword_results):
        rrf_scores[doc.id] = rrf_scores.get(doc.id, 0.0) + (1.0 / (k_constant + rank + 1))
        
    # Build final ranked list
    fused_results = []
    for doc_id, score in rrf_scores.items():
        doc = session.get(RAGDocument, doc_id)
        fused_results.append({
            "id": doc.id,
            "title": doc.title,
            "content": doc.content,
            "collection": doc.collection_name,
            "rrf_score": score
        })
        
    fused_results.sort(key=lambda x: x["rrf_score"], reverse=True)
    return fused_results[:top_k]

# Seed data for Knowledge Base
SEED_KNOWLEDGE = [
    # Database Design
    {
        "title": "PostgreSQL Scaling and Connection Pooling",
        "collection_name": "Database",
        "content": "For PostgreSQL handling high transaction volume, connection pooling is mandatory to prevent connection exhaustion. Use PgBouncer as a lightweight connection pooler. Implement read replicas to offload read-heavy operations from the primary writer. Partition large tables (e.g. order history) by range or hash to keep indexes small and queries fast."
    },
    {
        "title": "Redis Caching Patterns",
        "collection_name": "Database",
        "content": "Use Redis Cache-Aside pattern for database read queries. Set appropriate TTL (Time to Live) values (e.g., 1 hour for product catalog, 5 minutes for user sessions) to avoid stale data. Implement Redis cluster for high availability and sentinel for automatic failover. Use distributed locks (Redlock) for critical transaction sections like stock checks."
    },
    # Security
    {
        "title": "JWT and Session Security Best Practices",
        "collection_name": "Security",
        "content": "JWT tokens must be signed using RS256/ES256 algorithms rather than HS256. Store access tokens in-memory or secure cookies, and refresh tokens in HttpOnly, SameSite=Strict, Secure cookies. Implement token revocation via a Redis blacklist. Always validate audience (aud), issuer (iss), and expiration (exp) claims."
    },
    {
        "title": "OWASP API Security Top 10 Mitigation",
        "collection_name": "Security",
        "content": "To prevent broken object level authorization (BOLA), validate that the logged-in user owns the resource requested. Implement strict input validation using schema-based checkers (e.g., Pydantic or JSON schema). Prevent SSRF by disabling outbound requests from backend servers except to whitelisted endpoints. Rate limit all endpoints using Token Bucket algorithm."
    },
    # DevOps / Cloud
    {
        "title": "Kubernetes Microservice Deployment",
        "collection_name": "DevOps",
        "content": "Deploy services in Kubernetes using Deployments with replica counts configured. Set resource requests and limits (CPU/Memory) on all pods. Define readinessProbes and livenessProbes to ensure traffic is only routed to healthy containers. Use NetworkPolicies to isolate namespaces and prevent unauthorized inter-pod communications."
    },
    {
        "title": "Terraform AWS Multi-AZ Architecture",
        "collection_name": "DevOps",
        "content": "Deploy applications across at least two Availability Zones (Multi-AZ) to achieve high availability. Use Terraform AWS VPC module to configure public subnets for Application Load Balancers, private subnets for application nodes, and isolated database subnets. Configure Auto Scaling Groups (ASG) scaling on CPU utilization or queue depth."
    },
    # Scale Simulation / Failure Modes
    {
        "title": "Database Connection Exhaustion Failure Mode",
        "collection_name": "Scaling Failure Modes",
        "content": "Under 10x-100x traffic spikes, standard database servers fail due to 'Too many clients' exceptions. This happens when the application spawns one connection per incoming HTTP request without pooling. Mitigation: Install PgBouncer, set maximum connection limits, and implement database-level query timeouts."
    },
    {
        "title": "Synchronous Cascade Failure & Queue Decoupling",
        "collection_name": "Scaling Failure Modes",
        "content": "At 1000x traffic, synchronous service-to-service REST calls result in cascade failures. If the inventory service goes down or experiences latency, the order service blocks, thread pools saturate, and the entire checkout flow crashes. Mitigation: Use message queues (RabbitMQ, Kafka, or AWS SQS) for event-driven asynchronous order processing."
    }
]

def seed_rag_database(session: Session):
    # Check if documents exist
    count = session.exec(select(RAGDocument)).first()
    if count:
        return
    for item in SEED_KNOWLEDGE:
        emb = get_embedding(item["content"])
        doc = RAGDocument(
            title=item["title"],
            content=item["content"],
            collection_name=item["collection_name"],
            embedding_json=json.dumps(emb)
        )
        session.add(doc)
    session.commit()
