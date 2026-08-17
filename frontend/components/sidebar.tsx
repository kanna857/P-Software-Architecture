"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import {
  LayoutDashboard, PlusCircle, FolderOpen, Layers, GitBranch, Cpu,
  Database, Cable, DollarSign, TrendingUp, Shield, Activity,
  Settings, LogOut, ChevronRight, Spider, CloudRain, Bug
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  selectedProjectName?: string;
}

const navGroups = [
  {
    label: null,
    items: [
      { id: "dashboard",          label: "Dashboard",             icon: LayoutDashboard },
      { id: "new-architecture",   label: "New Architecture",      icon: PlusCircle },
      { id: "projects",           label: "Projects",              icon: FolderOpen },
      { id: "architectures",      label: "Architectures",         icon: Layers },
      { id: "versions",           label: "Architecture Versions", icon: GitBranch },
      { id: "agent-runs",         label: "Agent Runs",            icon: Cpu },
    ]
  },
  {
    label: "KNOWLEDGE BASE",
    items: [
      { id: "knowledge",          label: "Knowledge Base",        icon: Database },
      { id: "integrations",       label: "Integrations",          icon: Cable },
      { id: "cost-analysis",      label: "Cost Analysis",         icon: DollarSign },
      { id: "scale-simulation",   label: "Scale Simulation",      icon: TrendingUp },
      { id: "security",           label: "Security",              icon: Shield },
      { id: "observability",      label: "Observability",         icon: Activity },
    ]
  },
  {
    label: "SYSTEM",
    items: [
      { id: "settings",           label: "Settings",              icon: Settings },
      { id: "logout",             label: "Log Out",               icon: LogOut },
    ]
  }
];

const itemVariants: Variants = {
  hidden:  { x: -10, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 500, damping: 35 } }
};

function NavItem({ item, isActive, onClick }: { item: any; isActive: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <motion.button
      variants={itemVariants}
      onClick={onClick}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.97 }}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold relative overflow-hidden group transition-colors duration-150"
      style={{
        color: isActive ? "#ffffff" : "#6b7280",
        background: isActive ? "rgba(180, 0, 40, 0.15)" : "transparent",
        border: isActive ? "1px solid rgba(200, 0, 50, 0.3)" : "1px solid transparent",
      }}
    >
      {/* Active left bar */}
      {isActive && (
        <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
          style={{ background: "linear-gradient(180deg, transparent, #ff0040, transparent)", boxShadow: "0 0 6px #ff0040" }} />
      )}

      {/* Hover bg */}
      {!isActive && (
        <div className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(255, 0, 40, 0.06)" }} />
      )}

      <Icon size={14} className="relative z-10 shrink-0" style={{ color: isActive ? "#ff2050" : "inherit" }} />
      <span className="relative z-10 flex-1 text-left tracking-wide">{item.label}</span>
      {isActive && <ChevronRight size={12} className="relative z-10 text-red-500 shrink-0" />}
    </motion.button>
  );
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const isItemActive = (id: string) => {
    if (currentView === id) return true;
    if (id === "projects" && currentView.startsWith("project-")) return true;
    return false;
  };

  return (
    <motion.aside
      initial={{ x: -270, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-56 flex flex-col h-screen sticky top-0 z-40 relative"
      style={{
        background: "rgba(2, 0, 8, 0.55)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,215,0,0.2)",
        boxShadow: "4px 0 30px rgba(0, 0, 0, 0.6), inset -1px 0 0 rgba(255,215,0,0.08)"
      }}
    >
      {/* Subtle top edge glow */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(200,0,50,0.5), transparent)" }} />

      {/* BRAND */}
      <div className="px-4 py-4 flex items-center gap-3 border-b" style={{ borderColor: "rgba(255,215,0,0.2)" }}>
        {/* Rotating Iron Spider emblem — matches login page logo */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden shrink-0 animate-emblem-rotate"
          style={{
            background: "radial-gradient(circle, rgba(255,23,56,0.35) 0%, rgba(15,5,10,0.9) 100%)",
            border: "2px solid rgba(255,215,0,0.85)",
            boxShadow: "0 0 18px rgba(255,23,56,0.6), 0 0 35px rgba(255,215,0,0.35), inset 0 0 12px rgba(255,23,56,0.35)",
            padding: "2px"
          }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/spider-login/spider_emblem.png"
            alt="Spider Emblem"
            style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%", filter: "drop-shadow(0 0 4px rgba(255,215,0,0.5))" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <Bug size={20} style={{ color: "#ff1030", filter: "drop-shadow(0 0 6px rgba(255,0,40,0.8))", position: "absolute" }} />
        </div>
        <div>
          <div className="text-sm font-bold tracking-widest leading-tight" style={{ fontFamily: "var(--font-heading)", color: "#fff", textShadow: "0 0 10px rgba(255,255,255,0.5)" }}>
            AI Architect <span style={{ color: "#ffd700", textShadow: "0 0 8px rgba(255,215,0,0.8)" }}>2.0</span>
          </div>
          <div className="text-[9px] font-bold tracking-widest uppercase mt-0.5" style={{ color: "#ff3050", textShadow: "0 0 6px rgba(255,23,56,0.6)" }}>
            + DEEPMIND CORE
          </div>
        </div>
      </div>

      {/* NAV GROUPS */}
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
        className="flex-1 px-2 py-3 overflow-y-auto space-y-4 scrollbar-hide"
        style={{ overflowY: "auto" }}
      >
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <motion.p variants={itemVariants}
                className="px-3 mb-1.5 text-[9px] font-bold uppercase tracking-widest"
                style={{ color: "#ff2040", opacity: 0.7 }}>
                {group.label}
              </motion.p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={isItemActive(item.id)}
                  onClick={() => onViewChange(item.id)}
                />
              ))}
            </div>
            {gi < navGroups.length - 1 && (
              <div className="mt-3 mx-3 neon-divider-h opacity-30" />
            )}
          </div>
        ))}
      </motion.nav>

      {/* BOTTOM PROFILE + STATUS */}
      <div className="px-3 pb-3 pt-2 space-y-3"
        style={{ borderTop: "1px solid rgba(255,215,0,0.2)", background: "rgba(10,0,20,0.6)" }}>

        {/* Profile */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 relative overflow-hidden"
            style={{
              background: "radial-gradient(circle, rgba(255,23,56,0.35) 0%, rgba(50,0,10,0.9) 100%)",
              border: "1.5px solid rgba(255,215,0,0.7)",
              boxShadow: "0 0 14px rgba(255,23,56,0.4), 0 0 20px rgba(255,215,0,0.2)"
            }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/spider-login/hero_icon_iron.png"
              alt="Architect"
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <Bug size={16} style={{ color: "#ff1030", position: "absolute" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white leading-tight" style={{ textShadow: "0 0 8px rgba(255,255,255,0.4)" }}>ARCHITECT</p>
            <p className="text-[9px] uppercase tracking-widest leading-tight" style={{ color: "#ffd700", textShadow: "0 0 6px rgba(255,215,0,0.6)" }}>SPIDER-SYMBIOTE</p>
            <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full mt-0.5"
              style={{ background: "rgba(0,180,60,0.1)", color: "#00c040", border: "1px solid rgba(0,180,60,0.25)", boxShadow: "0 0 8px rgba(0,200,80,0.2)" }}>
              <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse-green" />
              ONLINE
            </span>
          </div>
        </div>

        {/* Core System Load */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#ffd700", textShadow: "0 0 6px rgba(255,215,0,0.6)" }}>CORE SYSTEM</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Load: Ready</span>
            <span className="text-white font-bold">72%</span>
          </div>
          <div className="progress-bar h-1 rounded-full">
            <div className="progress-fill h-full rounded-full" style={{ width: "72%" }} />
          </div>
        </div>

        {/* Weather */}
        <div className="flex items-center gap-2 pt-1">
          <CloudRain size={14} style={{ color: "#00a0c0", filter: "drop-shadow(0 0 4px rgba(0,160,192,0.6))" }} />
          <span className="text-[10px] text-white font-semibold">29°C</span>
          <span className="text-[9px] text-slate-500 uppercase tracking-wider">Partly Cloudy</span>
        </div>
      </div>
    </motion.aside>
  );
}
