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
  BarChart2,
  Database,
  ShieldAlert,
  Bug,
  CloudRain,
  Clock,
  FolderGit2,
  CheckCircle2
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
  // View Routes
  const renderDashboard = () => {
    const sampleProjects = [
      {
        name: "E-Commerce Platform",
        desc: "Modern, scalable e-commerce system with microservices",
        status: "Active",
        time: "2h ago",
        ver: "v2.1.0",
        tags: ["Architecture", "Database", "API", "Security", "Deployment"],
        color: "#ff1030"
      },
      {
        name: "Real-time Analytics",
        desc: "Event-driven analytics platform with stream processing",
        status: "Running",
        time: "5h ago",
        ver: "v1.3.2",
        tags: ["Data", "Stream", "AI", "Scalability", "Monitoring"],
        color: "#00c0e0"
      },
      {
        name: "Customer Support AI",
        desc: "Multi-agent support system with RAG and memory",
        status: "Active",
        time: "1d ago",
        ver: "v1.0.5",
        tags: ["Agents", "RAG", "LLM", "Security", "Integration"],
        color: "#ff1030"
      },
      {
        name: "DevOps Automation",
        desc: "CI/CD pipeline with automated deployment and monitoring",
        status: "Running",
        time: "2d ago",
        ver: "v0.9.8",
        tags: ["CI/CD", "Kubernetes", "Monitoring", "Security", "Automation"],
        color: "#00c0e0"
      },
    ];

    const displayProjects = projects.length > 0 ? projects : sampleProjects;

    return (
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="flex flex-col min-h-0 relative" style={{ height: "calc(100vh - 80px)" }}>

        <div className="flex gap-5 h-full overflow-hidden">

          {/* ===== LEFT: Hero + Projects ===== */}
          <div className="flex flex-col flex-1 min-w-0 overflow-y-auto pr-1 gap-5" style={{ scrollbarWidth: "none" }}>

            {/* HERO SECTION — actual suit texture background */}
            <div
              className="flex-shrink-0 rounded-xl p-4 relative overflow-hidden"
              style={{
                backgroundImage: "url('/spidey_suit_texture.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center top",
                border: "1px solid rgba(255,23,56,0.5)",
                boxShadow: "0 0 0 1px rgba(255,215,0,0.2), 0 0 40px rgba(255,23,56,0.2), 0 16px 48px rgba(0,0,0,0.9)"
              }}
            >
              {/* Dark overlay so text is readable, but suit shows through */}
              <div style={{
                position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none",
                background: "linear-gradient(135deg, rgba(10,0,5,0.88) 0%, rgba(4,0,10,0.82) 60%, rgba(20,0,2,0.90) 100%)",
                zIndex: 0
              }}/>
              {/* Extra subtle red vignette on edges */}
              <div style={{
                position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none",
                background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)",
                zIndex: 0
              }}/>
              {/* Web lines overlay — top left corner */}
              <svg style={{ position: "absolute", top: 0, left: 0, width: "180px", height: "180px", opacity: 0.12, pointerEvents: "none", zIndex: 1 }} viewBox="0 0 180 180">
                <line x1="0" y1="0" x2="180" y2="180" stroke="#ff1738" strokeWidth="0.8"/>
                <line x1="0" y1="0" x2="0" y2="180" stroke="#ff1738" strokeWidth="0.8"/>
                <line x1="0" y1="0" x2="180" y2="0" stroke="#ff1738" strokeWidth="0.8"/>
                <circle cx="0" cy="0" r="50" fill="none" stroke="#ff1738" strokeWidth="0.8"/>
                <circle cx="0" cy="0" r="100" fill="none" stroke="#ff1738" strokeWidth="0.6"/>
                <circle cx="0" cy="0" r="150" fill="none" stroke="#ff1738" strokeWidth="0.5"/>
                <line x1="0" y1="0" x2="90" y2="180" stroke="#ff1738" strokeWidth="0.5"/>
                <line x1="0" y1="0" x2="180" y2="90" stroke="#ff1738" strokeWidth="0.5"/>
              </svg>
              {/* Gold corner brackets */}
              <div style={{ position: "absolute", top: 6, left: 6, width: 18, height: 18, borderTop: "2px solid rgba(255,215,0,0.9)", borderLeft: "2px solid rgba(255,215,0,0.9)", borderRadius: "2px 0 0 0", zIndex: 2 }}/>
              <div style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, borderTop: "2px solid rgba(255,215,0,0.9)", borderRight: "2px solid rgba(255,215,0,0.9)", borderRadius: "0 2px 0 0", zIndex: 2 }}/>
              <div style={{ position: "absolute", bottom: 6, left: 6, width: 18, height: 18, borderBottom: "2px solid rgba(255,215,0,0.9)", borderLeft: "2px solid rgba(255,215,0,0.9)", borderRadius: "0 0 0 2px", zIndex: 2 }}/>
              <div style={{ position: "absolute", bottom: 6, right: 6, width: 18, height: 18, borderBottom: "2px solid rgba(255,215,0,0.9)", borderRight: "2px solid rgba(255,215,0,0.9)", borderRadius: "0 0 2px 0", zIndex: 2 }}/>
              {/* Laser scan line */}
              <div className="panel-laser" style={{ zIndex: 2 }}/>
              <div style={{ position: "relative", zIndex: 3 }}>
              {/* Tags */}
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full animate-badge-glow"
                  style={{ background: "rgba(255,0,40,0.15)", color: "#ff2050", border: "1px solid rgba(255,0,40,0.35)" }}>
                  🕷 WEB-SLINGER AI
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono tracking-wider">
                  <Layers size={10} className="opacity-60 animate-pulse"/> LangGraph Orchestration
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider" style={{ color: "#ffd700" }}>
                  <Zap size={10} className="opacity-80"/> Stark Protocol v2.0
                </span>
              </div>

              {/* Main Title */}
              <h1 className="text-xl font-extrabold tracking-tight leading-tight mb-0.5 title-gradient neon-flicker" style={{ fontFamily: "var(--font-heading)" }}>
                Spider-Architect 2.0
              </h1>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: "#ffd700", textShadow: "0 0 8px rgba(255,215,0,0.5)" }}>
                ✦ Friendly Neighborhood Software Architect ✦
              </p>

              <p className="text-xs text-slate-400 max-w-lg mb-3 leading-relaxed">
                <span style={{ color: "#ff5070" }}>&ldquo;With great power comes great software architecture.&rdquo;</span> Design, audit, and simulate production-grade systems with specialized Spider-Agents. Requirements, databases, APIs, security &mdash; web-slinging at lightspeed.
              </p>

              {/* CTA Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentView("new-architecture")}
                  className="cyber-btn web-shot-btn flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-md hover:scale-105 transition-transform"
                >
                  <PlusCircle size={13}/> Shoot New Web
                </button>
                <button
                  onClick={handleLaunchDemo}
                  className="cyber-btn cyber-btn-outline web-shot-btn flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-md hover:scale-105 transition-transform"
                  style={{ color: "#aabbcc" }}
                >
                  <Terminal size={13}/> Daily Bugle Demo
                </button>
              </div>
              </div>
            </div>

            {/* CURRENT PROJECTS LIST */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="spider-sense">
                    <Activity size={14} style={{ color: "#ff2050" }} className="animate-pulse" />
                  </div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">🕸 Active Web Missions</h2>
                </div>
              </div>

              <div className="space-y-2.5">
                {displayProjects.map((proj: any, i: number) => {
                    const isActive = proj.status === "Active" || !proj.status;
                    const statusLabel = proj.status || "Active";
                    const tagList = proj.tags || ["Architecture", "API", "Security"];
                    const projectTags: Record<string, string[]> = {
                      "E-Commerce Platform":   ["Architecture", "Database", "API", "Security", "Deployment"],
                      "Real-time Analytics":   ["Data", "Stream", "AI", "Scalability", "Monitoring"],
                      "Customer Support AI":   ["Agents", "RAG", "LLM", "Security", "Integration"],
                      "DevOps Automation":     ["CI/CD", "Kubernetes", "Monitoring", "Security", "Automation"],
                    };
                    const displayTags = tagList.length > 0 && tagList[0] !== "Architecture" ? tagList
                      : (projectTags[proj.name] || tagList);
                  return (
                    <div
                      key={i}
                      onClick={() => proj.id && handleSelectProject(proj.id)}
                      className="cyber-panel cyber-panel-red cyber-card-hover flex items-center gap-4 p-3.5 rounded-lg cursor-pointer group"
                      style={{
                        background: "rgba(6, 0, 12, 0.60)",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
                      }}
                    >
                      {/* Project Icon — matches reference skyline and spider icons */}
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform duration-200"
                        style={{
                          background: "rgba(5,0,10,0.4)",
                          border: "1px solid rgba(255,215,0,0.25)"
                        }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            i === 0 ? "/spider-login/hero_icon_iron.png" :
                            i === 1 ? "/spider-login/multiverse_intro.jpg" :
                            i === 2 ? "/spider-login/hero_icon_iron.png" :
                            "/spider-login/spider_emblem.png"
                          }
                          alt="Project Avatar"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>

                      {/* Project Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1">
                          <h3 className="text-sm font-bold text-white truncate group-hover:text-red-400 transition-colors">{proj.name}</h3>
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isActive ? "badge-active" : "badge-running"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-400" : "bg-cyan-400"} animate-pulse`}/>
                            {statusLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mb-2">{proj.description || proj.desc}</p>
                        <div className="flex flex-wrap gap-1">
                          {displayTags.map((tag: string, ti: number) => (
                            <span key={ti} className="tag-pill hover:border-red-500/50 transition-colors">{tag}</span>
                          ))}
                        </div>
                      </div>

                      {/* Meta: Updated */}
                      <div className="flex flex-col items-end text-right shrink-0 px-4 border-r border-red-900/20">
                        <span className="text-[9px] text-slate-600 uppercase tracking-widest mb-0.5">Updated</span>
                        <span className="text-xs font-semibold text-slate-300">{proj.time || proj.updated_at || "—"}</span>
                      </div>

                      {/* Meta: Version */}
                      <div className="flex flex-col items-end text-right shrink-0 px-3">
                        <span className="text-[9px] text-slate-600 uppercase tracking-widest mb-0.5">Version</span>
                        <span className="text-xs font-semibold text-slate-300 font-mono">{proj.ver || proj.version || "v1.0"}</span>
                      </div>

                      {/* Actions: Arrow & Delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            if (proj.id) {
                              handleDeleteProject(proj.id, e);
                            } else {
                              e.stopPropagation();
                              setProjects(prev => prev.filter((_, idx) => idx !== i));
                            }
                          }}
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 hover:bg-red-600/40 hover:scale-110 group/del"
                          style={{ background: "rgba(255, 0, 40, 0.12)", border: "1px solid rgba(255, 0, 40, 0.3)" }}
                          title="Delete project"
                        >
                          <Trash2 size={13} className="text-red-400 group-hover/del:text-red-200 transition-colors" />
                        </button>

                        {/* Arrow View Details */}
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 group-hover:translate-x-1 group-hover:bg-red-600/30"
                          style={{ background: "rgba(200,0,40,0.15)", border: "1px solid rgba(200,0,40,0.3)" }}>
                          <ArrowRight size={13} style={{ color: "#ff2050" }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ===== RIGHT: Metrics Panel ===== */}
          <div className="flex flex-col gap-3 shrink-0 overflow-y-auto relative" style={{ width: "310px", scrollbarWidth: "none" }}>

            {/* HUD Emblem watermark background */}
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "260px", height: "260px",
              opacity: 0.06,
              pointerEvents: "none",
              zIndex: 0,
              borderRadius: "50%",
              overflow: "hidden"
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/spidey_hud_emblem.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
            </div>

            {/* TOP STATS 2x2 */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Active Projects */}
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                className="cyber-panel cyber-panel-red p-3.5 rounded-lg transition-all duration-200" style={{ background: "rgba(6,0,12,0.8)" }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Layers size={11} style={{ color: "#ff2050" }} className="animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Web Missions</span>
                </div>
                <div className="text-3xl font-extrabold font-mono mb-0.5" style={{ color: "#ff2050", textShadow: "0 0 12px rgba(255,32,80,0.5)" }}>
                  {projects.length || 8}
                </div>
                <div className="text-[9px] text-slate-600">+2 this week</div>
                <div className="mt-2 h-6 flex items-end gap-px">
                  {[3,5,2,7,4,6,8].map((v,i) => (
                    <div key={i} className="flex-1 rounded-sm transition-all duration-300 hover:bg-red-500" style={{ height: `${v * 10}%`, background: i === 6 ? "#ff2050" : "rgba(255,32,80,0.25)" }}/>
                  ))}
                </div>
              </motion.div>

              {/* Agent Specialists */}
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                className="cyber-panel cyber-panel-red p-3.5 rounded-lg transition-all duration-200" style={{ background: "rgba(6,0,12,0.8)" }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Cpu size={11} style={{ color: "#ff2050" }} className="animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Spider-Agents</span>
                </div>
                <div className="text-3xl font-extrabold font-mono mb-0.5" style={{ color: "#ff2050", textShadow: "0 0 12px rgba(255,32,80,0.5)" }}>12</div>
                <div className="text-[9px] text-green-500 font-bold">Web-Slingers Online</div>
                <div className="mt-2 h-6 flex items-end gap-px">
                  {[6,4,8,3,7,5,9].map((v,i) => (
                    <div key={i} className="flex-1 rounded-sm transition-all duration-300 hover:bg-red-500" style={{ height: `${v * 10}%`, background: i === 6 ? "#ff2050" : "rgba(255,32,80,0.25)" }}/>
                  ))}
                </div>
              </motion.div>

              {/* Avg Readiness */}
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                className="cyber-panel cyber-panel-blue p-3.5 rounded-lg transition-all duration-200" style={{ background: "rgba(6,0,12,0.8)" }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={11} style={{ color: "#00c0e0" }} className="animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Avg Readiness</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-extrabold font-mono" style={{ color: "#00c0e0", textShadow: "0 0 10px rgba(0,192,224,0.5)" }}>
                    87<span className="text-sm text-slate-500">/100</span>
                  </div>
                  <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90 ml-auto">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(0,192,224,0.1)" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#00c0e0" strokeWidth="3"
                      strokeDasharray="87 100" strokeLinecap="round"
                      style={{ filter: "drop-shadow(0 0 4px rgba(0,192,224,0.6))" }}/>
                  </svg>
                </div>
                <div className="text-[9px] text-slate-600 mt-1">↑ 12% from last run</div>
              </motion.div>

              {/* RAG Collections */}
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                className="cyber-panel cyber-panel-red p-3.5 rounded-lg transition-all duration-200" style={{ background: "rgba(6,0,12,0.8)" }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Database size={11} style={{ color: "#ff2050" }} className="animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Web Archives</span>
                </div>
                <div className="text-3xl font-extrabold font-mono mb-0.5" style={{ color: "#ff2050", textShadow: "0 0 12px rgba(255,32,80,0.5)" }}>
                  11 <span className="text-base text-slate-500 font-medium">Core</span>
                </div>
                <div className="text-[9px] text-slate-600">Updated</div>
                <Database size={28} className="mt-1 ml-auto opacity-10" style={{ color: "#ff2050" }}/>
              </motion.div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="cyber-panel cyber-panel-red p-4 rounded-lg flex-1 relative overflow-hidden"
              style={{
                backgroundImage: "url('/spidey_suit_texture.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center center",
              }}
            >
              {/* Dark overlay */}
              <div style={{ position: "absolute", inset: 0, background: "rgba(3,0,8,0.88)", borderRadius: "inherit", zIndex: 0 }}/>
              <div style={{ position: "relative", zIndex: 1 }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock size={13} style={{ color: "#ff2050" }} className="animate-pulse" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Activity</h3>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:text-white transition-colors" style={{ color: "#00a0c0" }}>
                  View All
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { action: "Architecture generated", sub: "E-Commerce Platform",  time: "2h ago",  IconC: CheckCircle2,  color: "#00c050" },
                  { action: "Agent run completed",    sub: "Security Analysis",    time: "3h ago",  IconC: Activity,      color: "#00a0c0" },
                  { action: "New project created",    sub: "Real-time Analytics",  time: "5h ago",  IconC: PlusCircle,    color: "#8040c0" },
                  { action: "Database synced",        sub: "Knowledge Base",       time: "1d ago",  IconC: Database,      color: "#c07020" },
                  { action: "Agent run completed",    sub: "Cost Analysis",        time: "1d ago",  IconC: CheckCircle2,  color: "#00c050" },
                ].map((act, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 3, transition: { duration: 0.15 } }}
                    className="flex items-center gap-3 p-1 rounded-md transition-colors hover:bg-white/5 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: `${act.color}18`, border: `1px solid ${act.color}40` }}>
                      <act.IconC size={11} style={{ color: act.color }}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-white truncate">{act.action}</p>
                      <p className="text-[10px] text-slate-600 truncate">{act.sub}</p>
                    </div>
                    <span className="text-[9px] text-slate-600 font-mono shrink-0">{act.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      </motion.div>
    );
  };

  const renderNewArchitecture = () => {
    return (
      <div className="max-w-2xl cyber-panel cyber-panel-red rounded-xl p-8 space-y-6">
        <div>
          <h3 className="text-white font-extrabold glow-text-white text-lg">Create New Software Architecture</h3>
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
              className="w-full cyber-panel cyber-panel-blue rounded-lg p-3 text-slate-100 text-sm focus:border-red-600 focus:outline-none"
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
              className="w-full cyber-panel cyber-panel-blue rounded-lg p-3 text-slate-100 text-sm focus:border-red-600 focus:outline-none"
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
                <input type="text" value={formIndustry} onChange={(e) => setFormIndustry(e.target.value)} className="w-full cyber-panel cyber-panel-blue rounded p-2 text-xs text-slate-100 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expected active users</label>
                <input type="text" value={formUsers} onChange={(e) => setFormUsers(e.target.value)} className="w-full cyber-panel cyber-panel-blue rounded p-2 text-xs text-slate-100 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expected throughput</label>
                <input type="text" value={formTraffic} onChange={(e) => setFormTraffic(e.target.value)} className="w-full cyber-panel cyber-panel-blue rounded p-2 text-xs text-slate-100 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cloud Hosting</label>
                <input type="text" value={formCloud} onChange={(e) => setFormCloud(e.target.value)} className="w-full cyber-panel cyber-panel-blue rounded p-2 text-xs text-slate-100 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Availability Target</label>
                <input type="text" value={formAvailability} onChange={(e) => setFormAvailability(e.target.value)} className="w-full cyber-panel cyber-panel-blue rounded p-2 text-xs text-slate-100 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Budget</label>
                <input type="text" value={formBudget} onChange={(e) => setFormBudget(e.target.value)} className="w-full cyber-panel cyber-panel-blue rounded p-2 text-xs text-slate-100 focus:outline-none" />
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
              className="px-6 py-2.5 cyber-panel cyber-panel-blue hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition"
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
                <Layers className="text-red-500 glow-text-red" size={18} />
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
                <div className="cyber-panel cyber-panel-red p-6 rounded-xl">
                  <h3 className="text-white font-bold glow-text-white text-sm mb-4">Requirements & Technical Constraints</h3>
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
                  <div className="cyber-panel cyber-panel-red p-6 rounded-xl space-y-4">
                    <h3 className="text-white font-bold glow-text-white text-sm">Extracted Requirements Envelope</h3>
                    <div>
                      <h4 className="text-red-500 glow-text-red font-bold text-xs uppercase mb-2">Functional Specs:</h4>
                      <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
                        {architectureData.requirements.functional_requirements?.map((req: string, i: number) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-2">
                      <h4 className="text-red-500 glow-text-red font-bold text-xs uppercase mb-2">Non-Functional Target Constraints:</h4>
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
                <div className="cyber-panel cyber-panel-red p-6 rounded-xl text-center space-y-3 relative overflow-hidden">
                  <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider">Production Readiness Index</h3>
                  <div className="text-4xl font-extrabold text-red-500 glow-text-red">
                    {architectureData?.judge_results?.production_readiness || 0}
                    <span className="text-xs text-slate-500 font-normal"> / 100</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Evaluated across security, scaling reliability, and internal consistency parameters.</p>
                </div>

                {architectureData?.judge_results?.scores && (
                  <div className="cyber-panel cyber-panel-red p-6 rounded-xl space-y-4">
                    <h3 className="text-white font-bold glow-text-white text-xs uppercase tracking-wider">Evaluation Benchmarks</h3>
                    <div className="space-y-3 text-xs">
                      {Object.entries(architectureData.judge_results.scores).map(([k, score]: any) => (
                        <div key={k} className="flex justify-between items-center border-b border-red-900/40 pb-2">
                          <span className="capitalize text-slate-400">{k.replace("_", " ")}</span>
                          <span className="font-bold text-red-500 glow-text-red">{(score * 20).toFixed(0)}%</span>
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
              <div className="cyber-panel cyber-panel-red p-6 rounded-xl">
                <h3 className="text-white font-bold glow-text-white text-sm mb-2">Relational Schemas configuration</h3>
                <p className="text-xs text-slate-400">Engine Type: {architectureData?.database?.db_type || "PostgreSQL"}</p>
                <p className="text-xs text-slate-400 mt-1">Caching Strategy: {architectureData?.database?.caching_strategy}</p>
              </div>

              {architectureData?.database?.tables && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {architectureData.database.tables.map((table: any, i: number) => (
                    <div key={i} className="cyber-panel cyber-panel-red p-4 rounded-lg">
                      <h4 className="font-bold text-xs text-red-500 glow-text-red uppercase mb-2">{table.name}</h4>
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
              <div className="cyber-panel cyber-panel-red p-6 rounded-xl">
                <h3 className="text-white font-bold glow-text-white text-sm mb-2">REST API Schema Interfaces</h3>
                <p className="text-xs text-slate-400">Auth scheme: {architectureData?.api?.authentication}</p>
                <p className="text-xs text-slate-400 mt-1">Rate limit Policy: {architectureData?.api?.rate_limiting}</p>
              </div>

              {architectureData?.api?.endpoints && (
                <div className="space-y-4">
                  {architectureData.api.endpoints.map((ep: any, i: number) => (
                    <div key={i} className="cyber-panel cyber-panel-red p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${ep.method === "POST" ? "cyber-panel cyber-panel-blue text-emerald-400" : "cyber-panel cyber-panel-blue text-sky-400"}`}>
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
              <div className="cyber-panel cyber-panel-red p-6 rounded-xl space-y-4">
                <div>
                  <h3 className="text-white font-bold glow-text-white text-sm">What-If Architecture Simulator</h3>
                  <p className="text-xs text-slate-400 mt-1">Ask hypotheticals to run simulations against connection pool sizes, CDN distributions, and compute thresholds.</p>
                </div>

                <form onSubmit={handleWhatIfSubmit} className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="e.g. What happens if active sessions spike to 1 million?"
                    value={whatIfQuestion}
                    onChange={(e) => setWhatIfQuestion(e.target.value)}
                    className="flex-1 cyber-panel cyber-panel-blue rounded-lg p-3 text-slate-100 text-xs focus:outline-none focus:border-red-600"
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
                <div className="cyber-panel cyber-panel-red p-6 rounded-xl space-y-4">
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
                    <span className="text-red-500 glow-text-red text-sm">{whatIfResponse.estimated_cost_delta}</span>
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
                  <div className="cyber-panel cyber-panel-red p-6 rounded-xl space-y-4">
                    <h3 className="text-white font-bold glow-text-white text-sm">Saved Snapshots History</h3>
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
                                <tr key={v.id} className="hover:cyber-panel/20 transition-all duration-150">
                                  <td className="py-3 font-bold text-slate-200">Version {v.version_num}</td>
                                  <td className="py-3 text-slate-400">{new Date(v.created_at).toLocaleString()}</td>
                                  <td className="py-3 text-red-500 glow-text-red font-semibold">{readiness} / 100</td>
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
                  <div className="cyber-panel cyber-panel-red p-6 rounded-xl space-y-4">
                    <div>
                      <h3 className="text-white font-bold glow-text-white text-sm">Compare Snapshots</h3>
                      <p className="text-[10px] text-slate-400 mt-1">Select version snapshots to inspect drift changes and score trends side-by-side.</p>
                    </div>

                    <form onSubmit={handleCompareSubmit} className="space-y-4">
                      <div className="flex flex-col gap-3">
                        <select 
                          value={compareA} 
                          onChange={(e) => setCompareA(e.target.value)}
                          className="w-full cyber-panel cyber-panel-blue rounded p-2.5 text-xs text-slate-200 focus:outline-none"
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
                          className="w-full cyber-panel cyber-panel-blue rounded p-2.5 text-xs text-slate-200 focus:outline-none"
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
                <div className="cyber-panel cyber-panel-red p-6 rounded-xl space-y-4">
                  <div className="grid grid-cols-2 gap-6 text-center border-b border-red-900/30 pb-4">
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase">Version {compareResponse.version_a} Readiness</span>
                      <p className="text-2xl font-extrabold text-red-500 glow-text-red mt-1">{compareResponse.a_readiness}/100</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase">Version {compareResponse.version_b} Readiness</span>
                      <p className="text-2xl font-extrabold text-emerald-400 mt-1">{compareResponse.b_readiness}/100</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    <h4 className="text-white font-bold glow-text-white">Drift changes logs:</h4>
                    <div className="grid grid-cols-1 gap-3 font-mono text-[11px] bg-[#0a0003] p-4 rounded border border-red-900/40 leading-relaxed text-slate-300">
                      <div><span className="text-red-500 glow-text-red font-bold">[Requirements]:</span> {compareResponse.differences.requirements}</div>
                      <div><span className="text-red-500 glow-text-red font-bold">[Database]:</span> {compareResponse.differences.database}</div>
                      <div><span className="text-red-500 glow-text-red font-bold">[DevOps]:</span> {compareResponse.differences.devops}</div>
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
          <h3 className="text-white font-extrabold glow-text-white text-lg">Hybrid RAG Knowledge Base</h3>
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
          <h3 className="text-white font-extrabold glow-text-white text-lg">Platform Integrations</h3>
          <p className="text-slate-400 text-xs mt-1">Import external projects, OpenAPI document specs, or database schemas.</p>
        </div>

        {/* GitHub Import */}
        <div className="cyber-panel cyber-panel-red p-6 rounded-xl space-y-4">
          <h4 className="text-slate-200 font-bold text-sm flex items-center gap-2">
            <GitBranch size={16} className="text-red-500 glow-text-red" />
            GitHub Repository Import
          </h4>
          <p className="text-xs text-slate-400">Scans code file files structure, reads requirements, database migrations, and CI config files.</p>
          <div className="flex gap-4">
            <input type="text" placeholder="https://github.com/org/repo" className="flex-1 cyber-panel cyber-panel-blue rounded p-2.5 text-xs text-slate-200 focus:outline-none" />
            <button type="button" className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold transition">Import</button>
          </div>
        </div>

        {/* OpenAPI Spec Import */}
        <div className="cyber-panel cyber-panel-red p-6 rounded-xl space-y-4">
          <h4 className="text-slate-200 font-bold text-sm flex items-center gap-2">
            <FileCode size={16} className="text-sky-400" />
            OpenAPI Specification Import
          </h4>
          <p className="text-xs text-slate-400">Ingest route endpoints, query models, and validation schemas directly.</p>
          <textarea rows={3} placeholder="Paste OpenAPI JSON/YAML spec here..." className="w-full cyber-panel cyber-panel-blue rounded p-2.5 text-xs text-slate-200 focus:outline-none" />
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
          <h3 className="text-white font-extrabold glow-text-white text-lg">Observability & Telemetry Dashboards</h3>
          <p className="text-slate-400 text-xs mt-1">Track pipeline latency runs, LLM command usage token costs, and agent success rates.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="cyber-panel cyber-panel-red p-6 rounded-xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Pipeline Success Rate</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1">{stats.success_rate}%</span>
          </div>
          <div className="cyber-panel cyber-panel-red p-6 rounded-xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Avg Runtime Latency</span>
            <span className="text-2xl font-bold text-white mt-1">{stats.avg_generation_time_sec}s</span>
          </div>
          <div className="cyber-panel cyber-panel-red p-6 rounded-xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Total API Billing Cost</span>
            <span className="text-2xl font-bold text-red-500 glow-text-red mt-1">${stats.total_llm_cost.toFixed(4)}</span>
          </div>
          <div className="cyber-panel cyber-panel-red p-6 rounded-xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">RAG Retrieval Precision</span>
            <span className="text-2xl font-bold text-sky-400 mt-1">{stats.rag_quality_score}%</span>
          </div>
        </div>

        {/* Telemetry charts */}
        <div className="cyber-panel cyber-panel-red p-6 rounded-xl">
          <h4 className="text-white font-bold glow-text-white text-sm mb-4">Agent Run Duration Benchmarks</h4>
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
      <div className="max-w-xl cyber-panel cyber-panel-red rounded-xl p-8 space-y-6">
        <div>
          <h3 className="text-white font-extrabold glow-text-white text-lg">System Configuration & Limits</h3>
          <p className="text-slate-400 text-xs mt-1">Configure security credentials and safety bounds to prevent infinite loops.</p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="bg-[#0a0003] p-4 rounded border border-red-900/40 space-y-2">
            <span className="font-bold text-red-500 glow-text-red uppercase">Provider Models:</span>
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
            <span className="font-bold text-red-500 glow-text-red uppercase">Execution Guardrails:</span>
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
    <div className="flex flex-col text-slate-100 h-screen overflow-hidden" style={{ background: "transparent", position: "relative", zIndex: 1 }}>
      {/* ── Middle container (Sidebar + Content Workspace) ── */}
      <div className="flex-1 flex overflow-hidden relative z-10">
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
          hideBrand={false}
        />

        {/* Content workspace area */}
        <main className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Sub Header / Breadcrumb inside main content */}
          <div className="flex items-center justify-between px-6 py-2.5 shrink-0 border-b border-red-950/20"
            style={{ background: "rgba(2,0,5,0.25)", backdropFilter: "blur(4px)" }}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Console</span>
              <span className="text-slate-700">/</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 glow-text-red">
                {currentView.includes("project-") ? "Project Workspace" : currentView.replace(/-/g, " ")}
              </span>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-hidden px-6 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="h-full"
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
          </div>
        </main>
      </div>
    </div>
  );
}
