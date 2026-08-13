import os
import zipfile
import io
import json
from typing import Dict, Any, List

def inspect_repository(repo_path: str) -> Dict[str, Any]:
    """Scans folder structure and returns file lists."""
    if not os.path.exists(repo_path):
        return {"error": "Path does not exist"}
        
    tree = {}
    for root, dirs, files in os.walk(repo_path):
        # Prune node_modules, .git, .venv
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules", ".venv", "__pycache__")]
        rel_path = os.path.relpath(root, repo_path)
        if rel_path == ".":
            rel_path = "/"
        tree[rel_path] = files
        
    return {"repo_path": repo_path, "structure": tree}

def inspect_openapi(spec_content: str) -> Dict[str, Any]:
    """Parses basic OpenAPI details."""
    try:
        data = json.loads(spec_content)
        endpoints = []
        for path, path_item in data.get("paths", {}).items():
            for method, operation in path_item.items():
                endpoints.append({
                    "path": path,
                    "method": method.upper(),
                    "summary": operation.get("summary", "")
                })
        return {"title": data.get("info", {}).get("title"), "endpoints": endpoints}
    except Exception as e:
        return {"error": f"Failed to parse OpenAPI: {str(e)}"}

def inspect_database(schema_sql: str) -> Dict[str, Any]:
    """Identifies tables in SQL schema."""
    tables = []
    lines = schema_sql.split("\n")
    for line in lines:
        if "create table" in line.lower():
            parts = line.split()
            if len(parts) >= 3:
                name = parts[2].replace("(", "").replace("`", "").replace('"', '')
                tables.append(name)
    return {"tables_found": tables}

def get_cloud_pricing(provider: str, resource: str, size: str) -> float:
    """
    Returns official mock database values for resources to prevent arbitrary model calculations.
    """
    # Simple hardcoded routing mapping standard sizes to monthly rates
    pricing = {
        "aws": {
            "compute": {"micro": 8.5, "small": 17.0, "medium": 34.0, "large": 68.0},
            "database": {"micro": 15.0, "small": 30.0, "medium": 90.0, "large": 180.0},
            "cache": {"small": 20.0, "medium": 70.0, "large": 140.0}
        },
        "gcp": {
            "compute": {"micro": 7.5, "small": 15.0, "medium": 30.0, "large": 60.0},
            "database": {"micro": 12.0, "small": 25.0, "medium": 80.0, "large": 160.0},
            "cache": {"small": 18.0, "medium": 65.0, "large": 130.0}
        }
    }
    
    prov = provider.lower()
    res = resource.lower()
    sz = size.lower()
    
    if prov in pricing and res in pricing[prov]:
        return pricing[prov][res].get(sz, 35.0)
    return 25.0

def generate_code_zip(architecture_data: Dict[str, Any]) -> bytes:
    """
    Generates a full in-memory ZIP package containing structured source boilerplates,
    SQL scripts, Kubernetes templates, and Docker configs.
    """
    db_out = architecture_data.get("database", {})
    api_out = architecture_data.get("api", {})
    dev_out = architecture_data.get("devops", {})
    
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        # Write sql file
        sql_script = db_out.get("sql_script", "-- Empty database schema")
        zip_file.writestr("database/schema.sql", sql_script)
        
        # Write prisma
        prisma_schema = db_out.get("prisma_schema", "// Empty Prisma schema")
        zip_file.writestr("database/schema.prisma", prisma_schema)
        
        # Write openapi
        openapi = api_out.get("openapi_spec", "{}")
        zip_file.writestr("api/openapi.json", openapi)
        
        # Write Dockerfile
        dockerfile = dev_out.get("dockerfile", "# Base Dockerfile")
        zip_file.writestr("deployment/Dockerfile", dockerfile)
        
        # Write Compose
        compose = dev_out.get("docker_compose", "# Base Compose")
        zip_file.writestr("deployment/docker-compose.yml", compose)
        
        # Write K8s
        k8s = dev_out.get("kubernetes_manifests", "# Base Manifests")
        zip_file.writestr("deployment/kubernetes.yaml", k8s)
        
        # Write GitHub Actions CI
        ci = dev_out.get("github_actions", "# CI config")
        zip_file.writestr(".github/workflows/ci.yml", ci)
        
        # Write basic README
        readme = f"# AI Generated Architecture\n\nGenerated for software project idea."
        zip_file.writestr("README.md", readme)
        
    return zip_buffer.getvalue()
