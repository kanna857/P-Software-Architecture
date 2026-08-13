from typing import Dict, Any, List, Optional, TypedDict

class GraphState(TypedDict):
    project_id: int
    architecture_id: int
    user_idea: str
    requirements: Optional[Dict[str, Any]]
    plan: Optional[Dict[str, Any]]
    database: Optional[Dict[str, Any]]
    api: Optional[Dict[str, Any]]
    security: Optional[Dict[str, Any]]
    devops: Optional[Dict[str, Any]]
    architecture: Optional[Dict[str, Any]]
    cost: Optional[Dict[str, Any]]
    scale: Optional[Dict[str, Any]]
    threat_model: Optional[Dict[str, Any]]
    tradeoffs: Optional[Dict[str, Any]]
    judge_results: Optional[Dict[str, Any]]
    iterations: int
    current_agent: str
    status: str  # "running", "completed", "failed", "review_required"
    websocket_client_id: Optional[str]
