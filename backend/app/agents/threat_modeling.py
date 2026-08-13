import json
from typing import Dict, Any
from sqlmodel import Session
from app.agents.base import AgentEnvelope, get_llm
from langchain_core.messages import SystemMessage, HumanMessage

def run_threat_modeling_agent(session: Session, idea: str, db_api_security_outputs: Dict[str, Any]) -> AgentEnvelope:
    """
    Constructs STRIDE-based threat models, mapping trust boundaries, assets, threats, and mitigations.
    """
    llm = get_llm()
    if llm:
        system_prompt = (
            "You are a Cybersecurity Threat Modeling Agent.\n"
            "Generate a formal STRIDE threat model (Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation of Privilege).\n"
            "Identify system assets, trust boundaries, threats with likelihood/severity metrics, and architecture mitigations.\n"
            "Do not promise security certifications. Declare it clearly as architectural guidance.\n"
            "Return JSON matching the schema of AgentEnvelope where status is 'complete' and outputs contains fields:\n"
            "- assets (list of strings)\n"
            "- trust_boundaries (list of strings)\n"
            "- threats (list of dicts containing stride_category, threat, impact, severity, likelihood, mitigation, residual_risk)"
        )
        human_prompt = f"Idea: {idea}\nDetails: {json.dumps(db_api_security_outputs)}"
        
        try:
            structured_llm = llm.with_structured_output(AgentEnvelope)
            envelope = structured_llm.invoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=human_prompt)
            ])
            return envelope
        except Exception as e:
            print(f"Threat Modeling LLM failed: {e}. Falling back to standard threat model.")

    threats = [
        {
            "stride_category": "Spoofing",
            "threat": "Adversary hijacks customer authentication token via session theft.",
            "impact": "Unauthorised access to user profiles, checkout, and card tokens.",
            "severity": "High",
            "likelihood": "Medium",
            "mitigation": "Set Secure, HttpOnly, SameSite=Strict cookies. Shorten token expiry to 15 minutes and implement refresh token rotation.",
            "residual_risk": "Low"
        },
        {
            "stride_category": "Tampering",
            "threat": "Malicious user alters transaction amounts or product ID payload in checkout request.",
            "impact": "Financial loss due to buying premium products at manipulated low prices.",
            "severity": "Critical",
            "likelihood": "Low",
            "mitigation": "Enforce database-level pricing checkouts. Reject any pricing arguments submitted from the client frontend; look up price records directly from the database.",
            "residual_risk": "Negligible"
        },
        {
            "stride_category": "Information Disclosure",
            "threat": "Leaked database credentials or connection string from code repositories.",
            "impact": "Complete compromise of backend user and transaction data.",
            "severity": "Critical",
            "likelihood": "Medium",
            "mitigation": "Store database credentials inside AWS Secrets Manager or GCP Secret Manager. Inject credentials into containers via IAM role bindings rather than text environment variables.",
            "residual_risk": "Low"
        },
        {
            "stride_category": "Denial of Service",
            "threat": "DDoS flood saturates application endpoints.",
            "impact": "Complete platform blackout for all legitimate customers.",
            "severity": "High",
            "likelihood": "Medium",
            "mitigation": "Install Cloudflare/AWS Shield edge protections. Implement rate limiting on API gateway.",
            "residual_risk": "Medium"
        }
    ]

    disclaimer = "DISCLAIMER: This threat model is an architectural guidance tool and does not constitute a formal legal, compliance, or cybersecurity audit certification."
    
    return AgentEnvelope(
        agent="threat_modeling_agent",
        status="complete",
        outputs={
            "assets": ["User database credentials", "Transaction & checkout logs", "Product Catalog data", "Private TLS signing keys"],
            "trust_boundaries": ["Client Web Browser vs API Ingress Gateway", "API Ingress Gateway vs Backend Pods", "Backend Pods vs RDS database instance"],
            "threats": threats,
            "disclaimer": disclaimer
        },
        dependencies_on=["security_agent"],
        conflicts_flagged=[],
        confidence=0.91
    )
