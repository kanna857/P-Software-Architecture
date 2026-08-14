"use client";

import React from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  LayoutDashboard, PlusCircle, FolderGit2, Compass, Layers,
  Settings, Database, ShieldCheck, Cpu, TrendingUp, FileCode,
  GitBranch, DollarSign, Activity, Zap, ChevronRight, LogOut
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  selectedProjectName?: string;
}

const workspaceItems = [
  { id: "dashboard",        label: "Dashboard",           icon: LayoutDashboard,  color: "text-slate-400" },
  { id: "new-architecture", label: "New Architecture",    icon: PlusCircle,       color: "text-slate-400" },
  { id: "projects",         label: "Projects",            icon: FolderGit2,       color: "text-slate-400" },
  { id: "architectures",    label: "Architectures",       icon: Layers,           color: "text-slate-400" },
  { id: "versions",         label: "Architecture Versions", icon: GitBranch,      color: "text-slate-400" },
  { id: "agent-runs",       label: "Agent Runs",          icon: Cpu,              color: "text-slate-400" },
];

const knowledgeItems = [
  { id: "knowledge",        label: "Knowledge Base",      icon: Database,         color: "text-slate-400" },
  { id: "integrations",     label: "Integrations",        icon: Compass,          color: "text-slate-400" },
  { id: "cost-analysis",    label: "Cost Analysis",       icon: DollarSign,       color: "text-slate-400" },
  { id: "scale-simulation", label: "Scale Simulation",    icon: TrendingUp,       color: "text-slate-400" },
  { id: "security",         label: "Security",            icon: ShieldCheck,      color: "text-slate-400" },
  { id: "observability",    label: "Observability",       icon: Activity,         color: "text-slate-400" },
  { id: "settings",         label: "Settings",            icon: Settings,         color: "text-slate-400" },
];

const sidebarVariants: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0, opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden:  { x: -12, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

function NavItem({
  item, isActive, onClick
}: {
  item: typeof workspaceItems[0];
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <motion.button
      variants={itemVariants}
      onClick={onClick}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.97 }}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
        relative overflow-hidden transition-colors duration-200
        ${isActive
          ? "text-white"
          : "text-slate-400 hover:text-slate-200"
        }
      `}
    >
      {/* Active background */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute inset-0 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(79, 70, 229, 0.15) 100%)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              boxShadow: "0 0 15px rgba(56, 189, 248, 0.15)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
          />
        )}
      </AnimatePresence>

      {/* Hover background */}
      {!isActive && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-white/[0.03] opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        />
      )}

      <Icon size={16} className={`relative z-10 shrink-0 ${isActive ? "text-sky-400" : item.color} transition-colors`} />
      <span className="relative z-10 truncate font-semibold tracking-wide">{item.label}</span>

      {isActive && (
        <motion.div
          className="absolute right-3 top-1/2 -translate-y-1/2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <ChevronRight size={14} className="text-sky-400" />
        </motion.div>
      )}
    </motion.button>
  );
}

export default function Sidebar({ currentView, onViewChange, selectedProjectName }: SidebarProps) {
  const handleLogout = () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
      className="w-64 flex flex-col h-screen sticky top-0 z-40"
      style={{
        background: "rgba(5, 11, 20, 0.92)",
        backdropFilter: "blur(24px) saturate(1.5)",
        borderRight: "1px solid rgba(255,23,56,0.1)",
      }}
    >
      {/* Brand */}
      <div className="p-5 border-b border-red-500/10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          {/* Logo mark */}
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%)",
                boxShadow: "0 0 25px rgba(14, 165, 233, 0.5)",
              }}
            >
              <Layers size={20} className="text-white" />
            </motion.div>
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-xl animate-ping opacity-30"
              style={{ background: "rgba(14, 165, 233, 0.4)" }} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight leading-none" style={{ fontFamily: "var(--font-heading)" }}>
              Architect <span className="text-sky-400">2.0</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">
                DeepMind Core
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Active project banner */}
      <AnimatePresence>
        {selectedProjectName && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="mx-3 mt-3 overflow-hidden"
          >
            <div
              className="p-3 rounded-xl"
              style={{
                background: "linear-gradient(135deg, rgba(255,23,56,0.12) 0%, rgba(204,0,34,0.08) 100%)",
                border: "1px solid rgba(255,23,56,0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap size={10} className="text-red-400" />
                <p className="text-[9px] text-red-400 uppercase tracking-widest font-bold">Active Project</p>
              </div>
              <p className="text-xs font-semibold text-slate-200 truncate">{selectedProjectName}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <motion.nav
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-3 py-4 overflow-y-auto space-y-6"
      >
        {/* Workspace Section */}
        <div>
          <motion.p
            variants={itemVariants}
            className="px-3 mb-2 text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em]"
          >
            Workspace
          </motion.p>
          <div className="space-y-0.5">
            {workspaceItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={
                  currentView === item.id ||
                  (item.id === "projects" && currentView.startsWith("project-"))
                }
                onClick={() => onViewChange(item.id)}
              />
            ))}
          </div>
        </div>

        {/* Neon divider */}
        <div className="neon-divider mx-3" />

        {/* Systems & Knowledge Section */}
        <div>
          <motion.p
            variants={itemVariants}
            className="px-3 mb-2 text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em]"
          >
            Systems &amp; Knowledge
          </motion.p>
          <div className="space-y-0.5">
            {knowledgeItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={currentView === item.id}
                onClick={() => onViewChange(item.id)}
              />
            ))}
          </div>
        </div>

        {/* Log Out */}
        <div className="mt-6 pt-4 border-t border-slate-800/50">
          <motion.button
            variants={itemVariants}
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
          >
            <LogOut size={16} className="shrink-0" />
            <span className="font-semibold tracking-wide">Log Out</span>
          </motion.button>
        </div>
      </motion.nav>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-4 border-t border-red-500/10"
      >
        <div className="flex items-center justify-between text-[10px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Local · Ready</span>
          </div>
          <span className="font-mono text-slate-700">v2.0.4</span>
        </div>
        {/* CPU meter decorative */}
        <div className="mt-2 progress-bar h-0.5">
          <motion.div
            className="progress-fill h-full"
            initial={{ width: "0%" }}
            animate={{ width: "72%" }}
            transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
          />
        </div>
        <p className="text-[9px] text-slate-700 mt-1">Engine load: 72%</p>
      </motion.div>
    </motion.aside>
  );
}
