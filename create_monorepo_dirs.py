import os

MONOREPO_DIRS = [
    "gateway",
    "planner",
    "agents",
    "requirements",
    "database",
    "api",
    "security",
    "devops",
    "architecture",
    "testing",
    "performance",
    "reliability",
    "compliance",
    "cost",
    "scale_simulation",
    "threat_modeling",
    "tradeoff",
    "evaluation",
    "rag",
    "knowledge_graph",
    "diagram",
    "code_generation",
    "integrations",
    "versioning",
    "observability",
    "knowledge-base",
    "deployment",
    "docker",
    "terraform",
    "kubernetes",
    "helm",
    "tests",
    "docs"
]

def make_dirs():
    base_path = os.path.dirname(os.path.abspath(__file__))
    for folder in MONOREPO_DIRS:
        folder_path = os.path.join(base_path, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        # Write representative README
        readme_path = os.path.join(folder_path, "README.md")
        with open(readme_path, "w") as f:
            f.write(f"# {folder.replace('_', ' ').capitalize()} Module\n\n")
            f.write(f"This directory represents the **{folder}** domain separation layer in AI Software Architect 2.0.\n")
            
        print(f"Created: {folder_path}")

if __name__ == "__main__":
    make_dirs()
