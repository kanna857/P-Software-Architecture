"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import {
  LayoutDashboard, PlusCircle, FolderOpen, Layers, GitBranch, Cpu,
  Database, Cable, DollarSign, TrendingUp, Shield, Activity,
  Settings, LogOut, ChevronRight, CloudRain, Bug
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  selectedProjectName?: string;
  hideBrand?: boolean;
}

const navGroups = [
  {
    label: null,
    items: [
      { id: "dashboard",        label: "Dashboard",             icon: LayoutDashboard },
      { id: "new-architecture", label: "New Architecture",      icon: PlusCircle },
      { id: "projects",         label: "Projects",              icon: FolderOpen },
      { id: "architectures",    label: "Architectures",         icon: Layers },
      { id: "versions",         label: "Architecture Versions", icon: GitBranch },
      { id: "agent-runs",       label: "Agent Runs",            icon: Cpu },
    ]
  },
  {
    label: "KNOWLEDGE BASE",
    items: [
      { id: "knowledge",        label: "Knowledge Base",        icon: Database },
      { id: "integrations",     label: "Integrations",          icon: Cable },
      { id: "cost-analysis",    label: "Cost Analysis",         icon: DollarSign },
      { id: "scale-simulation", label: "Scale Simulation",      icon: TrendingUp },
      { id: "security",         label: "Security",              icon: Shield },
      { id: "observability",    label: "Observability",         icon: Activity },
    ]
  },
  {
    label: "SYSTEM",
    items: [
      { id: "settings",         label: "Settings",              icon: Settings },
      { id: "logout",           label: "Log Out",               icon: LogOut },
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
      whileHover={{ x: 4, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.97 }}
      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-extrabold relative overflow-hidden group transition-all duration-150"
      style={{
        color: isActive ? "#ffffff" : "#7b849b",
        background: isActive
          ? "linear-gradient(90deg, rgba(220,0,50,0.25) 0%, rgba(160,0,35,0.12) 100%)"
          : "transparent",
        border: isActive
          ? "1.5px solid rgba(255, 30, 70, 0.45)"
          : "1.5px solid transparent",
      }}
    >
      {/* Active red left bar */}
      {isActive && (
        <div
          className="absolute left-0 top-1.5 bottom-1.5 w-1.5 rounded-full"
          style={{
            background: "linear-gradient(180deg, #ff1744, #d50000)",
            boxShadow: "0 0 12px #ff1744, 0 0 20px rgba(255,23,68,0.7)"
          }}
        />
      )}

      {/* Hover bg */}
      {!isActive && (
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ background: "rgba(255, 0, 40, 0.1)" }}
        />
      )}

      {/* Icon */}
      <Icon
        size={22}
        className="relative z-10 shrink-0"
        style={{
          color: isActive ? "#ff2050" : "#525a72",
          filter: isActive ? "drop-shadow(0 0 6px rgba(255,32,80,0.8))" : "none"
        }}
      />

      {/* Label */}
      <span className="relative z-10 flex-1 text-left tracking-wide leading-none">{item.label}</span>

      {/* Chevron on active */}
      {isActive && (
        <ChevronRight size={16} className="relative z-10 shrink-0" style={{ color: "#ff2050" }} />
      )}
    </motion.button>
  );
}

export default function Sidebar({ currentView, onViewChange, hideBrand }: SidebarProps) {
  const isItemActive = (id: string) => {
    if (currentView === id) return true;
    if (id === "projects" && currentView.startsWith("project-")) return true;
    return false;
  };

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className={`w-80 flex flex-col sticky z-40 relative ${hideBrand ? "h-[calc(100vh-56px)] top-[56px]" : "h-screen top-0"}`}
      style={{
        background: "rgba(3, 0, 8, 0.60)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(200,0,50,0.30)",
        boxShadow: "4px 0 32px rgba(0,0,0,0.55), inset -1px 0 0 rgba(255,0,50,0.12)"
      }}
    >
      {/* Top edge glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(200,0,50,0.7), transparent)" }}
      />

      {/* ── BRAND ── */}
      {!hideBrand && (
        <div
          className="px-5 py-4.5 flex items-center gap-3.5"
          style={{ borderBottom: "1px solid rgba(200,0,50,0.25)" }}
        >
          {/* Spider-Man HUD Emblem — reference image */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center relative shrink-0"
            style={{
              boxShadow: "0 0 0 2px rgba(255,23,56,0.8), 0 0 20px rgba(255,23,56,0.8), 0 0 40px rgba(255,23,56,0.4), 0 0 0 4px rgba(255,215,0,0.2)"
            }}
          >
            {/* Slow spin outer glow ring */}
            <div style={{
              position: "absolute", inset: "-4px", borderRadius: "50%",
              border: "1px solid rgba(255,215,0,0.4)",
              animation: "webEmblemSpin 8s linear infinite",
              boxShadow: "0 0 8px rgba(255,215,0,0.3)"
            }}/>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/spidey_hud_emblem.png"
              alt="Spider-Man HUD"
              style={{
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center",
                borderRadius: "50%",
                filter: "drop-shadow(0 0 12px rgba(255,23,56,0.9))"
              }}
            />
          </div>

          {/* Brand text */}
          <div>
            <div
              className="text-base font-black tracking-wide leading-tight"
              style={{ fontFamily: "var(--font-heading)", color: "#fff", textShadow: "0 0 10px rgba(255,255,255,0.5)" }}
            >
              Spider-Architect{" "}
              <span style={{ color: "#ff2050", textShadow: "0 0 10px rgba(255,32,80,0.8)" }}>2.0</span>
            </div>
            <div
              className="text-[10px] font-bold tracking-[0.2em] uppercase mt-0.5"
              style={{ color: "#ffd700", textShadow: "0 0 6px rgba(255,215,0,0.6)" }}
            >
              🕷 WEB-SLINGER CORE
            </div>
          </div>
        </div>
      )}

      {/* ── NAV GROUPS ── */}
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.03, delayChildren: 0.1 } } }}
        className="flex-1 px-3.5 py-4 space-y-4"
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <motion.p
                variants={itemVariants}
                className="px-4 mb-2 text-[13px] font-black uppercase tracking-[0.25em]"
                style={{ color: "#ff2040", textShadow: "0 0 6px rgba(255,32,64,0.5)" }}
              >
                {group.label}
              </motion.p>
            )}
            <div className="space-y-1.5">
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
              <div
                className="mt-4 mx-3 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(200,0,40,0.35), transparent)" }}
              />
            )}
          </div>
        ))}
      </motion.nav>

      {/* ── BOTTOM STATUS ── */}
      <div
        className="px-4 pb-4 pt-3.5 space-y-3.5"
        style={{ borderTop: "1px solid rgba(200,0,50,0.25)", background: "rgba(8,0,18,0.65)" }}
      >
        {/* Profile row */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative overflow-visible"
            style={{
              background: "radial-gradient(circle, rgba(255,23,56,0.3) 0%, rgba(20,0,5,0.98) 100%)",
              border: "1.5px solid rgba(255,23,56,0.8)",
              boxShadow: "0 0 12px rgba(255,23,56,0.6), 0 0 0 2px rgba(255,215,0,0.2)"
            }}
          >
            {/* HUD mini ring */}
            <svg viewBox="0 0 40 40" style={{ position: "absolute", inset: "-3px", width: "calc(100%+6px)", animation: "webEmblemSpin 8s linear infinite reverse" }}>
              {Array.from({length: 16}).map((_, i) => {
                const angle = (i * 22.5) * Math.PI / 180;
                const r1 = 19, r2 = i % 4 === 0 ? 16 : 17.5;
                return <line key={i}
                  x1={20 + r1*Math.cos(angle)} y1={20 + r1*Math.sin(angle)}
                  x2={20 + r2*Math.cos(angle)} y2={20 + r2*Math.sin(angle)}
                  stroke={i % 4 === 0 ? "rgba(255,215,0,0.8)" : "rgba(255,23,56,0.4)"}
                  strokeWidth="0.8"/>;
              })}
            </svg>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/spidey_hud_emblem.png"
              alt="Spider-Man HUD"
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", position: "relative", zIndex: 2, filter: "drop-shadow(0 0 6px rgba(255,23,56,0.8))" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-black uppercase tracking-widest text-white leading-tight">
              ARCHITECT
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider leading-tight" style={{ color: "#ffd700", textShadow: "0 0 6px rgba(255,215,0,0.6)" }}>
              ✦ SPIDER-SYMBIOTE
            </p>
            <span
              className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mt-1"
              style={{
                background: "rgba(0,180,60,0.15)",
                color: "#00c040",
                border: "1px solid rgba(0,180,60,0.4)",
                boxShadow: "0 0 8px rgba(0,200,80,0.3)"
              }}
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              ONLINE
            </span>
          </div>
        </div>

        {/* Core System progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#ff2050" }}>
              CORE SYSTEM
            </span>
            <span className="text-sm font-bold text-white">72%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,0,40,0.15)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: "72%",
                background: "linear-gradient(90deg, #cc0020, #ff2050)",
                boxShadow: "0 0 12px rgba(255,32,80,0.8)"
              }}
            />
          </div>
        </div>
      </div>
    </motion.aside>
  );
}


