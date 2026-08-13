# AI Software Architect 2.0

AI Software Architect 2.0 is a production-grade multi-agent platform that automates software system design, validation, estimation, and simulation. Based on a plain-language prompt, the platform decomposes tasks via a Planner Agent, triggers specialist agents (Requirements, Database, API, Security, DevOps, Architect, Cost, Scale, Judge), retrieves local design context using Hybrid RAG, evaluates outputs using an LLM Judge, triggers self-healing loops, and simulates load multipliers.

---

## 1. Project Monorepo Structure

- `/backend`: FastAPI Python application containing agent nodes, LangGraph pipelines, and Hybrid RAG search handlers.
- `/frontend`: Next.js client application styled with Tailwind CSS, supporting React Flow canvas diagrams, Monaco editors, Recharts cost bars, and live WebSocket log consoles.
- `/docs`: Technical references.

---

## 2. Setting Up Environment Variables

Copy the sample configuration file `.env.example` at the root of the project into a new `.env` file inside the `backend` folder:

```bash
# In backend/.env
OPENAI_API_KEY=your_openai_key_here
GEMINI_API_KEY=your_gemini_key_here
DATABASE_URL=sqlite:///./architect.db
```

*Note: The platform is built to work fully out-of-the-box even without active LLM keys (it falls back to standard heuristic configurations and seed structures for the e-commerce demo so you can test it immediately).*

---

## 3. How to Run the Application Locally

### Step A: Start the FastAPI Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Activate the Python virtual environment:
   - On Windows (PowerShell):
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - On Linux/macOS:
     ```bash
     source .venv/bin/activate
     ```
3. Run the uvicorn API server launcher:
   ```bash
   python run.py
   ```

*The API server will launch on `http://localhost:8000`. Database initialization and RAG knowledge base seeding run automatically on startup.*

### Step B: Start the Next.js Frontend

1. Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Run the Next.js development server:
   ```bash
   npm run dev
   ```

*The frontend application will launch on `http://localhost:3000`.*

---

## 4. Run the E-Commerce Demo Out-of-the-Box

1. Open the browser at `http://localhost:3000`.
2. Click the **"Launch E-Commerce Demo"** button on the dashboard.
3. This creates a new project project context with preloaded parameters for 100k users.
4. Click **"Run Agent Pipeline"** in the top-right corner.
5. Watch the agents execute live in the **"Pipeline"** tab, streaming details via WebSockets.
6. Explore diagrams (C4 Context, Container, Sequence, ER, AWS topologies) on the **"Diagrams"** tab, ask What-If questions, compare configurations, and inspect database/API models.
