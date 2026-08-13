import os
from typing import Literal, List, Dict, Any, Optional
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

class AgentEnvelope(BaseModel):
    agent: str
    status: Literal["complete", "needs_input", "conflict", "failed"]
    outputs: Dict[str, Any] = Field(
        description="The detailed structured outputs of the agent. Must follow the specific agent guidelines."
    )
    dependencies_on: List[str] = Field(default_factory=list)
    conflicts_flagged: List[str] = Field(default_factory=list)
    confidence: float

def get_llm():
    """
    Returns the appropriate LLM client based on configured environment variables.
    Defaults to OpenAI (gpt-4o-mini / gpt-4o), falls back to Gemini,
    or falls back to a simulated output if no keys are provided.
    """
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    if openai_key and len(openai_key) > 10:
        return ChatOpenAI(
            model="gpt-4o-mini",
            api_key=openai_key,
            temperature=0.1
        )
    elif gemini_key and len(gemini_key) > 10:
        return ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            api_key=gemini_key,
            temperature=0.1
        )
    return None  # Fallback to simulated outputs if no keys are configured
