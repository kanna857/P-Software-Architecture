"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Sidebar from "@/components/sidebar";
import AgentPipeline, { AgentStatus } from "@/components/agent-pipeline";
import ArchitectureCanvas from "@/components/architecture-canvas";
import CostAnalysis from "@/components/cost-analysis";
import ScaleSimulation from "@/components/scale-simulation";
import SecurityPanel from "@/components/security-panel";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";

// Lucide icons
import { 
  PlusCircle, 
  Layers, 
  Cpu, 
  Settings, 
  TrendingUp, 
  ShieldCheck, 
  Terminal,
  Activity,
  FileCode,
  GitBranch,
  ArrowRight,
  Download,
  Trash2,
  Zap,
  Sparkles,
  BarChart2
} from "lucide-react";

// Animation variants
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 400, damping: 30 }
  }
};

const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } }
};

const BACKEND_URL = "http://127.0.0.1:8000";
const WS_URL = "ws://127.0.0.1:8000";

export default function Home() {
  const [currentView, setCurrentView] = useState("dashboard"); // "dashboard", "new-architecture", "knowledge", "integrations", "settings", "project-x"
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedArchId, setSelectedArchId] = useState<number | null>(null);
  const [architectureData, setArchitectureData] = useState<any>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  
  // What-If state
  const [whatIfQuestion, setWhatIfQuestion] = useState("");
  const [whatIfResponse, setWhatIfResponse] = useState<any>(null);
  const [isWhatIfLoading, setIsWhatIfLoading] = useState(false);

  // Comparison state
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const [compareResponse, setCompareResponse] = useState<any>(null);

  // Project Creation states
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formIndustry, setFormIndustry] = useState("Technology");
  const [formUsers, setFormUsers] = useState("100,000");
  const [formTraffic, setFormTraffic] = useState("5000 req/sec");
  const [formCloud, setFormCloud] = useState("AWS");
  const [formAvailability, setFormAvailability] = useState("99.9% Uptime");
  const [formBudget, setFormBudget] = useState("$500/month");
  const [formSecurity, setFormSecurity] = useState("JWT Auth + Encryption at rest");
  const [formCompliance, setFormCompliance] = useState("GDPR");

  // WebSocket Live states
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([
    { name: "requirements_agent", label: "Requirements Agent", status: "pending" },
    { name: "planner_agent", label: "Planner Agent", status: "pending" },
    { name: "database_agent", label: "Database Agent", status: "pending" },
    { name: "api_agent", label: "API Agent", status: "pending" },
    { name: "security_agent", label: "Security Agent", status: "pending" },
    { name: "devops_agent", label: "DevOps Agent", status: "pending" },
    { name: "architecture_agent", label: "Architecture Agent", status: "pending" },
    { name: "llm_judge", label: "LLM Judge Evaluation", status: "pending" }
  ]);

  // Tab selections within project view
  const [activeProjectTab, setActiveProjectTab] = useState("overview");

  // Load Projects on startup
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects`);
      const data = await res.json();
      setProjects(data);
    } catch (e) {
      console.error("Failed to load projects", e);
    }
  };

  // Launch Project detail view
  const handleSelectProject = async (projId: number) => {
    setSelectedProjectId(projId);
    
    // Load architectures under this project
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects`);
      const allProjects = await res.json();
      
      // Let's create an architecture record if none exists
      const archRes = await fetch(`${BACKEND_URL}/api/projects/${projId}/architectures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const arch = await archRes.json();
      
      setSelectedArchId(arch.id);
      setCurrentView(`project-${projId}`);
      await fetchArchitectureDetails(arch.id);
    } catch (e) {
      console.error("Failed to init architecture project workspace", e);
    }
  };

  const fetchArchitectureDetails = async (archId: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/architectures/${archId}`);
      const data = await res.json();
      setArchitectureData(data.latest_version);
      setRuns(data.runs || []);
      
      // Load historical versions
      const verRes = await fetch(`${BACKEND_URL}/api/architectures/${archId}/versions`);
      const verData = await verRes.json();
      setVersions(verData);
      
      // Map existing runs into statuses
      if (data.runs && data.runs.length > 0) {
        setAgentStatuses(prev => prev.map(a => {
          const run = data.runs.find((r: any) => r.agent_name === a.name);
          return run ? { ...a, status: run.status as any, info: run.status === "complete" ? "Output validated" : run.error_message } : a;
        }));
      }
    } catch (e) {
      console.error("Failed to load architecture details", e);
    }
  };

  // Create Project Submit Handler
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formDesc) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          description: formDesc,
          industry: formIndustry,
          expected_users: formUsers,
          expected_traffic: formTraffic,
          cloud_preference: formCloud,
          availability_req: formAvailability,
          budget: formBudget,
          security_req: formSecurity,
          compliance_req: formCompliance
        })
      });
      const newProj = await res.json();
      setProjects(prev => [...prev, newProj]);
      
      // Reset form fields
      setFormName("");
      setFormDesc("");
      setIsAdvancedMode(false);
      
      // Go to new project detail
      await handleSelectProject(newProj.id);
    } catch (e) {
      console.error("Project creation failed", e);
    }
  };

  // Launch pipeline generation
  const handleGenerateArchitecture = async () => {
    if (!selectedArchId) return;

    setPipelineLogs([]);
    setAgentStatuses(prev => prev.map(a => ({ ...a, status: "pending", info: "" })));

    try {
      // 1. Trigger generate API
      await fetch(`${BACKEND_URL}/api/architectures/${selectedArchId}/generate`, { method: "POST" });
      
      // 2. Open WebSocket
      const ws = new WebSocket(`${WS_URL}/api/ws/runs/${selectedArchId}`);
      
      ws.onopen = () => {
        setPipelineLogs(prev => [...prev, `[INIT] WebSocket connected. Dispatched task pipeline...`]);
      };
      
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        const { agent, status, payload } = msg;

        // Write console log
        if (status === "running") {
          setPipelineLogs(prev => [...prev, `[RUNNING] ${agent.toUpperCase()} agent dispatched task steps...`]);
        } else if (status === "completed") {
          setPipelineLogs(prev => [...prev, `[COMPLETED] ${agent.toUpperCase()} validated structured envelope outputs.`]);
        } else if (status === "failed") {
          setPipelineLogs(prev => [...prev, `[FAILED] ${agent.toUpperCase()} checkouts blocked by LLM Judge.`]);
        }

        // Update pipeline nodes
        setAgentStatuses(prev => prev.map(a => {
          if (a.name === agent) {
            return { 
              ...a, 
              status: status === "completed" ? "completed" : status === "failed" ? "failed" : "running",
              info: status === "completed" ? "Output envelope matched schemas" : "Working..."
            };
          }
          return a;
        }));

        // If overall pipeline complete, refresh
        if (agent === "pipeline" && status === "completed") {
          setPipelineLogs(prev => [...prev, `[SUCCESS] Complete software architecture compiled and saved.`]);
          ws.close();
          fetchArchitectureDetails(selectedArchId);
          setActiveProjectTab("overview");
        }
      };

      ws.onerror = (err) => {
        setPipelineLogs(prev => [...prev, `[ERROR] Pipeline run timed out or aborted.`]);
      };

      ws.onclose = () => {
        setPipelineLogs(prev => [...prev, `[DISCONNECT] Connection closed.`]);
      };

    } catch (e) {
      console.error("Failed to generate architecture", e);
    }
  };

  // Launch preloaded demo project
  const handleLaunchDemo = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "E-Commerce Enterprise Suite",
          description: "Build an e-commerce platform for 100,000 users with authentication, payments, product search, orders, admin dashboard and mobile support.",
          industry: "Retail / E-Commerce",
          expected_users: "100,000 users",
          expected_traffic: "5,000 orders/day",
          cloud_preference: "AWS",
          availability_req: "99.9% Uptime Multi-AZ",
          budget: "$500/month",
          security_req: "JWT RS256 Auth, TLS 1.3 encryption, database row encryption",
          compliance_req: "GDPR + PCI-DSS"
        })
      });
      const demoProj = await res.json();
      setProjects(prev => [...prev, demoProj]);
      await handleSelectProject(demoProj.id);
    } catch (e) {
      console.error("Demo launch failed", e);
    }
  };

  const handleDeleteProject = async (projectId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project and all its associated architectures and history?")) {
      return;
    }
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects/${projectId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (selectedProjectId === projectId) {
          setSelectedProjectId(null);
          setArchitectureData(null);
          setSelectedArchId(null);
          setCurrentView("dashboard");
        }
      } else {
        alert("Failed to delete project");
      }
    } catch (err) {
      console.error("Failed to delete project", err);
      alert("Error occurred deleting project");
    }
  };

  const handleDeleteVersion = async (versionId: number) => {
    if (!selectedArchId) return;
    if (!confirm("Are you sure you want to delete this version snapshot?")) {
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/architectures/${selectedArchId}/versions/${versionId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await fetchArchitectureDetails(selectedArchId);
        
        // Reset compare state
        const deletedVer = versions.find(v => v.id === versionId);
        if (deletedVer) {
          const verNumStr = deletedVer.version_num.toString();
          if (compareA === verNumStr) setCompareA("");
          if (compareB === verNumStr) setCompareB("");
          if (compareResponse && (compareResponse.version_a === deletedVer.version_num || compareResponse.version_b === deletedVer.version_num)) {
            setCompareResponse(null);
          }
        }
      } else {
        alert("Failed to delete version snapshot");
      }
    } catch (e) {
      console.error("Failed to delete version", e);
      alert("Error deleting version snapshot");
    }
  };

  // What If solver
  const handleWhatIfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatIfQuestion || !selectedArchId) return;

    setIsWhatIfLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/architectures/${selectedArchId}/what-if`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: whatIfQuestion })
      });
      const data = await res.json();
      setWhatIfResponse(data);
    } catch (e) {
      console.error("What-If solver failed", e);
    } finally {
      setIsWhatIfLoading(false);
    }
  };

  // Compare versions
  const handleCompareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compareA || !compareB || !selectedArchId) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/architectures/${selectedArchId}/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version_a: parseInt(compareA),
          version_b: parseInt(compareB)
        })
      });
      const data = await res.json();
      setCompareResponse(data);
    } catch (e) {
      console.error("Comparison failed", e);
    }
  };

  const handleExportZip = () => {
    if (!architectureData) return;
    
    // Create code download mock or triggers ZIP file download endpoint
    const mockFileContent = JSON.stringify(architectureData, null, 2);
    const blob = new Blob([mockFileContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `architecture_spec.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View Router Render Methods
  const renderDashboard = () => {
    const stats = [
      { label: "Active Projects",  value: projects.length, color: "#ff4d6d", icon: Layers },
      { label: "Agent Specialists", value: "12",            color: "#aa001a", icon: Zap },
      { label: "Avg Readiness",    value: "87/100",         color: "#34d399", icon: BarChart2 },
      { label: "RAG Collections",  value: "11 Core",        color: "#ff8c9a", icon: FileCode },
    ];

    return (
      <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8">
        {/* Hero Banner */}
        <motion.div
          variants={fadeUp}
          custom={0}
          className="relative rounded-2xl p-8 overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8"
          style={{
            background: "linear-gradient(135deg, rgba(15,0,5,0.95) 0%, rgba(20,0,5,0.9) 100%)",
            border: "1px solid rgba(255,23,56,0.2)",
          }}
        >
          {/* Glow orbs */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, #cc0022 0%, transparent 70%)" }} />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }} />
          <div className="absolute inset-0 neon-divider" style={{ top: "auto", bottom: 0, height: 1 }} />

          <div className="space-y-4 z-10 flex-1">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">Multi-Agent AI</span>
              <span className="text-[10px] text-slate-600">·</span>
              <span className="text-[10px] text-slate-500">LangGraph Orchestration</span>
            </motion.div>
            <motion.h2
              className="text-3xl md:text-4xl font-extrabold leading-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-white">AI Software </span>
              <span className="gradient-text">Architect 2.0</span>
            </motion.h2>
            <motion.p
              className="text-slate-400 text-sm max-w-lg leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Design, audit, and simulate production-grade systems with specialized AI agents.
              Requirements, databases, APIs, security — generated in seconds.
            </motion.p>
            <motion.div
              className="flex gap-3 pt-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setCurrentView("new-architecture")}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              >
                <PlusCircle size={16} />
                New Architecture
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLaunchDemo}
                className="btn-ghost flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-300"
              >
                <Sparkles size={15} />
                E-Commerce Demo
              </motion.button>
            </motion.div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 z-10 w-full md:w-72 shrink-0">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.08, type: "spring" }}
                  className="rounded-xl p-3 flex flex-col gap-1"
                  style={{
                    background: "rgba(15,0,5,0.8)",
                    border: `1px solid ${s.color}22`,
                  }}
                >
                  <Icon size={14} style={{ color: s.color }} />
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{s.label}</span>
                  <span className="text-lg font-extrabold stat-number" style={{ color: s.color }}>{s.value}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div>
          <motion.h3
            variants={fadeUp}
            custom={1}
            className="text-white font-extrabold text-base mb-5 flex items-center gap-2"
          >
            <Activity size={16} className="text-red-400" />
            Current Software Projects
          </motion.h3>

          {projects.length === 0 ? (
            <motion.div
              variants={fadeUp}
              custom={2}
              className="rounded-2xl p-10 text-center"
              style={{ background: "rgba(15,0,5,0.6)", border: "1px dashed rgba(255,23,56,0.2)" }}
            >
              <Layers size={32} className="text-red-500/30 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No architectures yet.</p>
              <p className="text-slate-600 text-xs mt-1">Click "New Architecture" to design your first system.</p>
            </motion.div>
          ) : (
            <motion.div
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {projects.map((proj, i) => (
                <motion.div
                  key={proj.id}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -3 }}
                  onClick={() => handleSelectProject(proj.id)}
                  className="relative group cursor-pointer rounded-2xl p-6 flex flex-col justify-between overflow-hidden card-hover"
                  style={{
                    background: "rgba(15,0,5,0.8)",
                    border: "1px solid rgba(255,23,56,0.1)",
                  }}
                >
                  {/* Hover glow */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,23,56,0.08) 0%, transparent 70%)" }}
                  />

                  {/* Delete button */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={(e) => handleDeleteProject(proj.id, e)}
                    className="absolute top-4 right-4 z-20 p-1.5 btn-danger rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={13} />
                  </motion.button>

                  <div className="relative z-10">
                    <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center"
                      style={{ background: "rgba(255,23,56,0.15)", border: "1px solid rgba(255,23,56,0.2)" }}
                    >
                      <Layers size={15} className="text-red-400" />
                    </div>
                    <h4 className="font-bold pr-8 text-slate-100 group-hover:text-red-300 transition-colors text-sm leading-tight">
                      {proj.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{proj.description}</p>
                  </div>

                  <div
                    className="mt-5 pt-4 flex items-center justify-between text-[11px] relative z-10"
                    style={{ borderTop: "1px solid rgba(255,23,56,0.1)" }}
                  >
                    <span className="text-slate-600">{proj.industry || "General"}</span>
                    <span className="flex items-center gap-1 text-red-400 font-semibold group-hover:gap-2 transition-all">
                      Open Workspace <ArrowRight size={11} />
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderNewArchitecture = () => {
    return (
      <div className="max-w-2xl bg-black border border-red-900/30 rounded-xl p-8 space-y-6">
        <div>
          <h3 className="text-white font-extrabold text-lg">Create New Software Architecture</h3>
          <p className="text-slate-400 text-xs mt-1">Specify design targets. Generates requirements, databases, APIs, cost structures, and security checks.</p>
        </div>

        <form onSubmit={handleCreateProject} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Project Name</label>
            <input 
              type="text" 
              placeholder="e.g. Fintech Mobile Ledger" 
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full bg-[#0a0003] border border-red-900/30 rounded-lg p-3 text-slate-100 text-sm focus:border-red-600 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Describe your software idea (Simple Mode)</label>
            <textarea 
              rows={4}
              placeholder="e.g. Build an analytics tool tracking orders and sales, using JWT tokens, payments, and product search dashboards..." 
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full bg-[#0a0003] border border-red-900/30 rounded-lg p-3 text-slate-100 text-sm focus:border-red-600 focus:outline-none"
              required
            />
          </div>

          {/* Toggle Advanced mode */}
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="advanced" 
              checked={isAdvancedMode} 
              onChange={() => setIsAdvancedMode(!isAdvancedMode)}
              className="rounded bg-[#0a0003] border-red-900/30 text-red-600 focus:ring-red-600"
            />
            <label htmlFor="advanced" className="text-xs font-bold text-slate-300 uppercase tracking-wider cursor-pointer">
              Enable Advanced Architecture Constraints
            </label>
          </div>

          {isAdvancedMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-red-900/30">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Industry</label>
                <input type="text" value={formIndustry} onChange={(e) => setFormIndustry(e.target.value)} className="w-full bg-[#0a0003] border border-red-900/40 rounded p-2 text-xs text-slate-100 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expected active users</label>
                <input type="text" value={formUsers} onChange={(e) => setFormUsers(e.target.value)} className="w-full bg-[#0a0003] border border-red-900/40 rounded p-2 text-xs text-slate-100 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expected throughput</label>
                <input type="text" value={formTraffic} onChange={(e) => setFormTraffic(e.target.value)} className="w-full bg-[#0a0003] border border-red-900/40 rounded p-2 text-xs text-slate-100 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cloud Hosting</label>
                <input type="text" value={formCloud} onChange={(e) => setFormCloud(e.target.value)} className="w-full bg-[#0a0003] border border-red-900/40 rounded p-2 text-xs text-slate-100 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Availability Target</label>
                <input type="text" value={formAvailability} onChange={(e) => setFormAvailability(e.target.value)} className="w-full bg-[#0a0003] border border-red-900/40 rounded p-2 text-xs text-slate-100 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Budget</label>
                <input type="text" value={formBudget} onChange={(e) => setFormBudget(e.target.value)} className="w-full bg-[#0a0003] border border-red-900/40 rounded p-2 text-xs text-slate-100 focus:outline-none" />
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button 
              type="submit" 
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-red-600/10 transition"
            >
              Configure and Scaffold
            </button>
            <button 
              type="button" 
              onClick={() => setCurrentView("dashboard")}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderProjectWorkspace = () => {
    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return <div>Project not found</div>;

    return (
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {/* Workspace header */}
        <motion.div
          variants={fadeUp}
          custom={0}
          className="rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5"
          style={{
            background: "rgba(15,0,5,0.85)",
            border: "1px solid rgba(255,23,56,0.15)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Layers className="text-red-400" size={18} />
              </motion.div>
              <h2 className="text-lg font-extrabold text-white">{project.name}</h2>
            </div>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed line-clamp-1">{project.description}</p>
          </div>

          <div className="flex gap-2.5 shrink-0">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerateArchitecture}
              className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white"
            >
              <Zap size={13} />
              Run Agent Pipeline
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleExportZip}
              className="btn-ghost flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-300"
            >
              <Download size={13} />
              Export Spec
            </motion.button>
          </div>
        </motion.div>

        {/* Tab Links */}
        <motion.div
          variants={fadeUp}
          custom={1}
          className="flex gap-1 overflow-x-auto pb-1"
          style={{ borderBottom: "1px solid rgba(255,23,56,0.1)" }}
        >
          {["overview", "pipeline", "diagrams", "database", "api", "security", "cost", "scale", "what-if", "versions"].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveProjectTab(tab)}
              whileHover={{ y: -1 }}
              className={`relative px-4 py-2 text-[11px] font-semibold capitalize tracking-wider whitespace-nowrap transition-colors rounded-t-lg ${
                activeProjectTab === tab
                  ? "text-red-300"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.replace("-", " ")}
              {activeProjectTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: "linear-gradient(90deg, #ff1738, #ff4d6d)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Contents */}
        <div className="min-h-[400px]">
          {activeProjectTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Core spec details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-black border border-red-900/30 p-6 rounded-xl">
                  <h3 className="text-white font-bold text-sm mb-4">Requirements & Technical Constraints</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 font-bold uppercase block">Industry Vertical</span>
                      <span className="text-slate-200 mt-1 block font-medium">{project.industry || "General / Technology"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold uppercase block">Expected Scale</span>
                      <span className="text-slate-200 mt-1 block font-medium">{project.expected_users || "10,000 active sessions"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold uppercase block">Target cloud provider</span>
                      <span className="text-slate-200 mt-1 block font-medium">{project.cloud_preference || "AWS / Flexible"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold uppercase block">Budget limits</span>
                      <span className="text-slate-200 mt-1 block font-medium">{project.budget || "$200/month"}</span>
                    </div>
                  </div>
                </div>

                {architectureData?.requirements && (
                  <div className="bg-black border border-red-900/30 p-6 rounded-xl space-y-4">
                    <h3 className="text-white font-bold text-sm">Extracted Requirements Envelope</h3>
                    <div>
                      <h4 className="text-red-400 font-bold text-xs uppercase mb-2">Functional Specs:</h4>
                      <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
                        {architectureData.requirements.functional_requirements?.map((req: string, i: number) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-2">
                      <h4 className="text-red-400 font-bold text-xs uppercase mb-2">Non-Functional Target Constraints:</h4>
                      <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
                        {architectureData.requirements.non_functional_requirements?.map((req: string, i: number) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Score Card */}
              <div className="space-y-6">
                <div className="bg-black border border-red-900/30 p-6 rounded-xl text-center space-y-3 relative overflow-hidden">
                  <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider">Production Readiness Index</h3>
                  <div className="text-4xl font-extrabold text-red-400">
                    {architectureData?.judge_results?.production_readiness || 0}
                    <span className="text-xs text-slate-500 font-normal"> / 100</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Evaluated across security, scaling reliability, and internal consistency parameters.</p>
                </div>

                {architectureData?.judge_results?.scores && (
                  <div className="bg-black border border-red-900/30 p-6 rounded-xl space-y-4">
                    <h3 className="text-white font-bold text-xs uppercase tracking-wider">Evaluation Benchmarks</h3>
                    <div className="space-y-3 text-xs">
                      {Object.entries(architectureData.judge_results.scores).map(([k, score]: any) => (
                        <div key={k} className="flex justify-between items-center border-b border-red-900/40 pb-2">
                          <span className="capitalize text-slate-400">{k.replace("_", " ")}</span>
                          <span className="font-bold text-red-400">{(score * 20).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeProjectTab === "pipeline" && (
            <AgentPipeline statuses={agentStatuses} logs={pipelineLogs} />
          )}

          {activeProjectTab === "diagrams" && (
            <ArchitectureCanvas 
              diagrams={architectureData?.architecture?.diagrams || {
                c4_context: "graph TD\n  Client --> Server",
                c4_container: "graph TD\n  Web --> API\n  API --> DB",
                er_diagram: "erDiagram\n  User ||--o{ Order : places",
                aws_deployment: "graph TD\n  Internet --> LoadBalancer",
                sequence_diagram: "sequenceDiagram\n  User->>API: Click"
              }}
            />
          )}

          {activeProjectTab === "database" && (
            <div className="space-y-6">
              <div className="bg-black border border-red-900/30 p-6 rounded-xl">
                <h3 className="text-white font-bold text-sm mb-2">Relational Schemas configuration</h3>
                <p className="text-xs text-slate-400">Engine Type: {architectureData?.database?.db_type || "PostgreSQL"}</p>
                <p className="text-xs text-slate-400 mt-1">Caching Strategy: {architectureData?.database?.caching_strategy}</p>
              </div>

              {architectureData?.database?.tables && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {architectureData.database.tables.map((table: any, i: number) => (
                    <div key={i} className="bg-black border border-red-900/40 p-4 rounded-lg">
                      <h4 className="font-bold text-xs text-red-400 uppercase mb-2">{table.name}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">{table.description}</p>
                      <ul className="text-xs font-mono space-y-1 bg-[#0a0003] p-2.5 rounded border border-red-900/40">
                        {table.columns.map((col: string, j: number) => (
                          <li key={j} className="text-slate-300">{col}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeProjectTab === "api" && (
            <div className="space-y-6">
              <div className="bg-black border border-red-900/30 p-6 rounded-xl">
                <h3 className="text-white font-bold text-sm mb-2">REST API Schema Interfaces</h3>
                <p className="text-xs text-slate-400">Auth scheme: {architectureData?.api?.authentication}</p>
                <p className="text-xs text-slate-400 mt-1">Rate limit Policy: {architectureData?.api?.rate_limiting}</p>
              </div>

              {architectureData?.api?.endpoints && (
                <div className="space-y-4">
                  {architectureData.api.endpoints.map((ep: any, i: number) => (
                    <div key={i} className="bg-black border border-red-900/40 p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${ep.method === "POST" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-sky-500/10 text-sky-400 border border-sky-500/20"}`}>
                            {ep.method}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-200">{ep.path}</span>
                        </div>
                        <p className="text-xs text-slate-400">{ep.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">Request Body</span>
                          <span className="text-slate-300 mt-0.5 block">{ep.request_body}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">Response Schema</span>
                          <span className="text-slate-300 mt-0.5 block">{ep.response_body}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeProjectTab === "security" && architectureData?.security && (
            <SecurityPanel securityData={{
              authentication_strategy: architectureData.security.authentication_strategy,
              authorization_strategy: architectureData.security.authorization_strategy,
              data_protection: architectureData.security.data_protection,
              threats: architectureData.threat_model?.threats || [],
              disclaimer: architectureData.threat_model?.disclaimer || "Architectural guide notice."
            }} />
          )}

          {activeProjectTab === "cost" && architectureData?.cost && (
            <CostAnalysis costData={architectureData.cost} />
          )}

          {activeProjectTab === "scale" && architectureData?.scale && (
            <ScaleSimulation scaleData={architectureData.scale} />
          )}

          {activeProjectTab === "what-if" && (
            <div className="space-y-6">
              <div className="bg-black border border-red-900/30 p-6 rounded-xl space-y-4">
                <div>
                  <h3 className="text-white font-bold text-sm">What-If Architecture Simulator</h3>
                  <p className="text-xs text-slate-400 mt-1">Ask hypotheticals to run simulations against connection pool sizes, CDN distributions, and compute thresholds.</p>
                </div>

                <form onSubmit={handleWhatIfSubmit} className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="e.g. What happens if active sessions spike to 1 million?"
                    value={whatIfQuestion}
                    onChange={(e) => setWhatIfQuestion(e.target.value)}
                    className="flex-1 bg-[#0a0003] border border-red-900/30 rounded-lg p-3 text-slate-100 text-xs focus:outline-none focus:border-red-600"
                  />
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition shrink-0"
                    disabled={isWhatIfLoading}
                  >
                    {isWhatIfLoading ? "Simulating..." : "Calculate Consequences"}
                  </button>
                </form>
              </div>

              {whatIfResponse && (
                <div className="bg-black border border-red-900/40 p-6 rounded-xl space-y-4">
                  <div>
                    <h4 className="text-[10px] text-slate-500 font-bold uppercase">Simulation Question</h4>
                    <p className="text-xs font-semibold text-red-300 mt-0.5">"{whatIfResponse.question}"</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="bg-[#0a0003] p-4 rounded border border-red-900/40 space-y-1">
                      <span className="text-[10px] text-rose-400 font-extrabold uppercase">Architectural Consequences</span>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1">{whatIfResponse.architectural_consequences}</p>
                    </div>

                    <div className="bg-[#0a0003] p-4 rounded border border-red-900/40 space-y-1">
                      <span className="text-[10px] text-emerald-400 font-extrabold uppercase">Proposed Modifications</span>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1">{whatIfResponse.proposed_modifications}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs font-bold bg-[#0a0003] p-3 rounded border border-red-900/40">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">Estimated hosting cost adjustment</span>
                    <span className="text-red-400 text-sm">{whatIfResponse.estimated_cost_delta}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeProjectTab === "versions" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Version List with Delete Option */}
                  <div className="bg-black border border-red-900/30 p-6 rounded-xl space-y-4">
                    <h3 className="text-white font-bold text-sm">Saved Snapshots History</h3>
                    {versions.length === 0 ? (
                      <p className="text-xs text-slate-400">No version snapshots saved yet. Run the agent pipeline to generate a version.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead className="text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-red-900/40">
                            <tr>
                              <th className="pb-3 font-semibold">Version</th>
                              <th className="pb-3 font-semibold">Created At</th>
                              <th className="pb-3 font-semibold">Readiness Score</th>
                              <th className="pb-3 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850">
                            {versions.map((v) => {
                              const readiness = v.data?.judge_results?.production_readiness ?? "N/A";
                              return (
                                <tr key={v.id} className="hover:bg-slate-850/20 transition-all duration-150">
                                  <td className="py-3 font-bold text-slate-200">Version {v.version_num}</td>
                                  <td className="py-3 text-slate-400">{new Date(v.created_at).toLocaleString()}</td>
                                  <td className="py-3 text-red-400 font-semibold">{readiness} / 100</td>
                                  <td className="py-3 text-right">
                                    <button
                                      onClick={() => handleDeleteVersion(v.id)}
                                      className="inline-flex items-center gap-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/80 hover:border-rose-700/90 text-rose-400 text-xs px-2.5 py-1 rounded transition duration-200"
                                      title="Delete Version Snapshot"
                                    >
                                      <Trash2 size={12} />
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Compare form */}
                  <div className="bg-black border border-red-900/30 p-6 rounded-xl space-y-4">
                    <div>
                      <h3 className="text-white font-bold text-sm">Compare Snapshots</h3>
                      <p className="text-[10px] text-slate-400 mt-1">Select version snapshots to inspect drift changes and score trends side-by-side.</p>
                    </div>

                    <form onSubmit={handleCompareSubmit} className="space-y-4">
                      <div className="flex flex-col gap-3">
                        <select 
                          value={compareA} 
                          onChange={(e) => setCompareA(e.target.value)}
                          className="w-full bg-[#0a0003] border border-red-900/30 rounded p-2.5 text-xs text-slate-200 focus:outline-none"
                        >
                          <option value="">Select version A</option>
                          {versions.map(v => (
                            <option key={v.id} value={v.version_num}>Version {v.version_num}</option>
                          ))}
                        </select>

                        <span className="text-slate-500 font-bold text-center text-xs">VS</span>

                        <select 
                          value={compareB} 
                          onChange={(e) => setCompareB(e.target.value)}
                          className="w-full bg-[#0a0003] border border-red-900/30 rounded p-2.5 text-xs text-slate-200 focus:outline-none"
                        >
                          <option value="">Select version B</option>
                          {versions.map(v => (
                            <option key={v.id} value={v.version_num}>Version {v.version_num}</option>
                          ))}
                        </select>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold transition duration-200"
                      >
                        Compare Snapshots
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {compareResponse && (
                <div className="bg-black border border-red-900/30 p-6 rounded-xl space-y-4">
                  <div className="grid grid-cols-2 gap-6 text-center border-b border-red-900/30 pb-4">
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase">Version {compareResponse.version_a} Readiness</span>
                      <p className="text-2xl font-extrabold text-red-400 mt-1">{compareResponse.a_readiness}/100</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase">Version {compareResponse.version_b} Readiness</span>
                      <p className="text-2xl font-extrabold text-emerald-400 mt-1">{compareResponse.b_readiness}/100</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    <h4 className="text-white font-bold">Drift changes logs:</h4>
                    <div className="grid grid-cols-1 gap-3 font-mono text-[11px] bg-[#0a0003] p-4 rounded border border-red-900/40 leading-relaxed text-slate-300">
                      <div><span className="text-red-400 font-bold">[Requirements]:</span> {compareResponse.differences.requirements}</div>
                      <div><span className="text-red-400 font-bold">[Database]:</span> {compareResponse.differences.database}</div>
                      <div><span className="text-red-400 font-bold">[DevOps]:</span> {compareResponse.differences.devops}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };
  const [observabilityStats, setObservabilityStats] = useState<any>(null);

  const fetchObservability = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/observability/stats`);
      const data = await res.json();
      setObservabilityStats(data);
    } catch (e) {
      console.error("Failed to load observability stats", e);
    }
  };

  useEffect(() => {
    if (currentView === "observability") {
      fetchObservability();
    }
  }, [currentView]);

  const renderKnowledgeBase = () => {
    const collections = [
      { name: "Architecture Patterns", desc: "Common layout templates such as 3-tier, microservices, and CQRS patterns.",          color: "#ff4d6d", docs: 14 },
      { name: "Database Design",       desc: "Connection pooling metrics, replication logs, sharding indices, and query structures.", color: "#34d399", docs: 18 },
      { name: "Security",              desc: "JWT rotation policies, HTTPS TLS constraints, encryption profiles, and key storage.",   color: "#fb7185", docs: 22 },
      { name: "Cloud & DevOps",        desc: "Kubernetes pod autoscaling limits, Helm deployment configurations, Multi-AZ resources.",color: "#ff8c9a", docs: 16 },
      { name: "Scaling Failure Modes", desc: "Root causes of cascade timeouts and PostgreSQL client connection exhaustion.",          color: "#fbbf24", docs: 11 },
    ];

    return (
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={fadeUp} custom={0}>
          <h3 className="text-white font-extrabold text-lg">Hybrid RAG Knowledge Base</h3>
          <p className="text-slate-500 text-xs mt-1">Curated architecture patterns stored in local SQLite vector models — injected into every agent prompt.</p>
        </motion.div>

        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {collections.map((col, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -2, scale: 1.005 }}
              className="rounded-2xl p-5 flex flex-col gap-3 card-hover cursor-default"
              style={{
                background: "rgba(15,0,5,0.8)",
                border: `1px solid ${col.color}18`,
              }}
            >
              {/* Color accent bar */}
              <div className="w-8 h-1 rounded-full" style={{ background: col.color }} />
              <h4 className="font-bold text-slate-100 text-sm">{col.name}</h4>
              <p className="text-xs text-slate-500 leading-relaxed flex-1">{col.desc}</p>
              <div className="flex justify-between items-center pt-1" style={{ borderTop: `1px solid ${col.color}15` }}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: col.color }}>
                  {col.docs} documents
                </span>
                <span
                  className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: `${col.color}12`, color: col.color, border: `1px solid ${col.color}25` }}
                >
                  Vector Edge
                </span>
              </div>

              {/* Animated fill bar */}
              <div className="h-0.5 rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: col.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(col.docs / 25) * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    );
  };

  const renderIntegrations = () => {
    return (
      <div className="space-y-6 max-w-xl">
        <div>
          <h3 className="text-white font-extrabold text-lg">Platform Integrations</h3>
          <p className="text-slate-400 text-xs mt-1">Import external projects, OpenAPI document specs, or database schemas.</p>
        </div>

        {/* GitHub Import */}
        <div className="bg-black border border-red-900/30 p-6 rounded-xl space-y-4">
          <h4 className="text-slate-200 font-bold text-sm flex items-center gap-2">
            <GitBranch size={16} className="text-red-400" />
            GitHub Repository Import
          </h4>
          <p className="text-xs text-slate-400">Scans code file files structure, reads requirements, database migrations, and CI config files.</p>
          <div className="flex gap-4">
            <input type="text" placeholder="https://github.com/org/repo" className="flex-1 bg-[#0a0003] border border-red-900/30 rounded p-2.5 text-xs text-slate-200 focus:outline-none" />
            <button type="button" className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold transition">Import</button>
          </div>
        </div>

        {/* OpenAPI Spec Import */}
        <div className="bg-black border border-red-900/30 p-6 rounded-xl space-y-4">
          <h4 className="text-slate-200 font-bold text-sm flex items-center gap-2">
            <FileCode size={16} className="text-sky-400" />
            OpenAPI Specification Import
          </h4>
          <p className="text-xs text-slate-400">Ingest route endpoints, query models, and validation schemas directly.</p>
          <textarea rows={3} placeholder="Paste OpenAPI JSON/YAML spec here..." className="w-full bg-[#0a0003] border border-red-900/30 rounded p-2.5 text-xs text-slate-200 focus:outline-none" />
          <button type="button" className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold transition">Ingest API spec</button>
        </div>
      </div>
    );
  };

  const renderObservability = () => {
    const stats = observabilityStats || {
      success_rate: 94.5,
      avg_generation_time_sec: 14.2,
      total_llm_cost: 0.32,
      rag_quality_score: 92.0,
      review_failures_count: 1,
      agent_performance: []
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-white font-extrabold text-lg">Observability & Telemetry Dashboards</h3>
          <p className="text-slate-400 text-xs mt-1">Track pipeline latency runs, LLM command usage token costs, and agent success rates.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-black border border-red-900/30 p-6 rounded-xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Pipeline Success Rate</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1">{stats.success_rate}%</span>
          </div>
          <div className="bg-black border border-red-900/30 p-6 rounded-xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Avg Runtime Latency</span>
            <span className="text-2xl font-bold text-white mt-1">{stats.avg_generation_time_sec}s</span>
          </div>
          <div className="bg-black border border-red-900/30 p-6 rounded-xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Total API Billing Cost</span>
            <span className="text-2xl font-bold text-red-400 mt-1">${stats.total_llm_cost.toFixed(4)}</span>
          </div>
          <div className="bg-black border border-red-900/30 p-6 rounded-xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">RAG Retrieval Precision</span>
            <span className="text-2xl font-bold text-sky-400 mt-1">{stats.rag_quality_score}%</span>
          </div>
        </div>

        {/* Telemetry charts */}
        <div className="bg-black border border-red-900/30 p-6 rounded-xl">
          <h4 className="text-white font-bold text-sm mb-4">Agent Run Duration Benchmarks</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.agent_performance && stats.agent_performance.length > 0 ? stats.agent_performance : [
                { name: "Requirements", time: 1.8 },
                { name: "Database", time: 2.4 },
                { name: "API Spec", time: 2.1 },
                { name: "Security", time: 1.5 },
                { name: "DevOps", time: 3.2 },
                { name: "Architect", time: 2.8 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }} />
                <Bar dataKey="time" fill="#ff1738" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#c7d2fe', fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="max-w-xl bg-black border border-red-900/30 rounded-xl p-8 space-y-6">
        <div>
          <h3 className="text-white font-extrabold text-lg">System Configuration & Limits</h3>
          <p className="text-slate-400 text-xs mt-1">Configure security credentials and safety bounds to prevent infinite loops.</p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="bg-[#0a0003] p-4 rounded border border-red-900/40 space-y-2">
            <span className="font-bold text-red-400 uppercase">Provider Models:</span>
            <div className="flex justify-between items-center text-slate-300">
              <span>Primary Engine:</span>
              <span className="font-mono text-slate-100 bg-black px-2 py-0.5 rounded">gpt-4o-mini</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Secondary Evaluator Model:</span>
              <span className="font-mono text-slate-100 bg-black px-2 py-0.5 rounded">gemini-1.5-flash</span>
            </div>
          </div>

          <div className="bg-[#0a0003] p-4 rounded border border-red-900/40 space-y-2">
            <span className="font-bold text-red-400 uppercase">Execution Guardrails:</span>
            <div className="flex justify-between items-center text-slate-300">
              <span>MAX_AGENT_CALLS limit:</span>
              <span className="font-mono text-slate-100">15 calls</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>MAX_REVIEW_ITERATIONS retry limits:</span>
              <span className="font-mono text-slate-100">3 loops</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>MAX_TOKEN_BUDGET allocation:</span>
              <span className="font-mono text-slate-100">500,000 tokens</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex text-slate-100 min-h-screen" style={{ background: "var(--bg-deep)" }}>
      {/* Sidebar navigation */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={(view) => {
          if (view === "dashboard" || view === "new-architecture" || view === "knowledge" || view === "integrations" || view === "observability" || view === "settings") {
            setCurrentView(view);
            setSelectedProjectId(null);
            setSelectedArchId(null);
            setArchitectureData(null);
          } else if (view === "projects") {
            setCurrentView("dashboard");
          } else if (selectedProjectId) {
            if (view === "architectures") setActiveProjectTab("diagrams");
            if (view === "versions") setActiveProjectTab("versions");
            if (view === "agent-runs") setActiveProjectTab("pipeline");
            if (view === "cost-analysis") setActiveProjectTab("cost");
            if (view === "scale-simulation") setActiveProjectTab("scale");
            if (view === "security") setActiveProjectTab("security");
          } else {
            alert("Please select or create an active project context to view specific metrics.");
          }
        }} 
        selectedProjectName={selectedProjectId ? projects.find(p => p.id === selectedProjectId)?.name : undefined}
      />

      {/* Main content area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto relative z-10">
        {/* Breadcrumb header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-6 pb-4"
          style={{ borderBottom: "1px solid rgba(255,23,56,0.08)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Console</span>
            <span className="text-slate-700">/</span>
            <motion.span
              key={currentView}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-slate-300 text-[11px] font-bold uppercase tracking-wider capitalize"
            >
              {currentView.includes("project-") ? "Project Workspace" : currentView.replace("-", " ")}
            </motion.span>
          </div>
          {/* Live status indicator */}
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            />
            <span className="text-[10px] text-slate-600 font-mono">Backend connected</span>
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="max-w-7xl mx-auto"
          >
            {currentView === "dashboard" && renderDashboard()}
            {currentView === "new-architecture" && renderNewArchitecture()}
            {currentView.startsWith("project-") && renderProjectWorkspace()}
            {currentView === "knowledge" && renderKnowledgeBase()}
            {currentView === "integrations" && renderIntegrations()}
            {currentView === "observability" && renderObservability()}
            {currentView === "settings" && renderSettings()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
