"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Loader2, AlertCircle, Terminal,
  Zap, Clock, Activity
} from "lucide-react";

export interface AgentStatus {
  name: string;
  label: string;
  status: "pending" | "running" | "completed" | "needs_input" | "conflict" | "failed";
  info?: string;
}

interface PipelineProps {
  statuses: AgentStatus[];
  logs: string[];
}

const STATUS_CONFIG = {
  completed:   { bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.25)",  text: "#34d399", badgeBg: "rgba(52,211,153,0.12)",  icon: CheckCircle2,  iconColor: "#34d399",  label: "Completed" },
  running:     { bg: "rgba(255,23,56,0.1)",   border: "rgba(255,23,56,0.4)",   text: "#ff4d6d", badgeBg: "rgba(255,23,56,0.15)",  icon: Loader2,       iconColor: "#ff4d6d",  label: "Running"   },
  failed:      { bg: "rgba(251,113,133,0.08)", border: "rgba(251,113,133,0.3)",  text: "#fb7185", badgeBg: "rgba(251,113,133,0.12)", icon: AlertCircle,   iconColor: "#fb7185",  label: "Failed"    },
  conflict:    { bg: "rgba(251,113,133,0.08)", border: "rgba(251,113,133,0.3)",  text: "#fb7185", badgeBg: "rgba(251,113,133,0.12)", icon: AlertCircle,   iconColor: "#fb7185",  label: "Conflict"  },
  needs_input: { bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.3)",   text: "#fbbf24", badgeBg: "rgba(251,191,36,0.12)",  icon: Clock,         iconColor: "#fbbf24",  label: "Waiting"   },
  pending:     { bg: "rgba(30,41,59,0.6)",     border: "rgba(51,65,85,0.5)",     text: "#475569", badgeBg: "rgba(30,41,59,0.5)",     icon: Activity,      iconColor: "#334155",  label: "Pending"   },
};

const LOG_COLORS: Record<string, string> = {
  "[COMPLETED]": "#34d399",
  "[RUNNING]":   "#ff4d6d",
  "[JUDGE]":     "#aa001a",
  "[HEALING]":   "#fbbf24",
  "[FAILED]":    "#fb7185",
  "[SUCCESS]":   "#ff8c9a",
  "[INIT]":      "#94a3b8",
  "[ERROR]":     "#fb7185",
  "[DISCONNECT]":"#64748b",
};

function getLogColor(log: string): string {
  for (const [key, color] of Object.entries(LOG_COLORS)) {
    if (log.includes(key)) return color;
  }
  return "#64748b";
}

function AgentCard({ agent, index }: { agent: AgentStatus; index: number }) {
  const cfg = STATUS_CONFIG[agent.status];
  const Icon = cfg.icon;
  const isRunning = agent.status === "running";
  const isCompleted = agent.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 400, damping: 30 }}
      className="relative overflow-hidden rounded-xl p-4 cursor-default"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: isRunning
          ? `0 0 25px ${cfg.border}, inset 0 1px 0 rgba(255,255,255,0.04)`
          : "inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* Running glow pulse */}
      {isRunning && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: `radial-gradient(ellipse at center, ${cfg.border} 0%, transparent 70%)` }}
        />
      )}

      {/* Completed shimmer */}
      {isCompleted && (
        <motion.div
          className="absolute inset-0"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 0.6, delay: index * 0.06 + 0.3 }}
          style={{
            background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.1), transparent)",
          }}
        />
      )}

      <div className="relative z-10">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <motion.span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest"
            style={{ background: cfg.badgeBg, color: cfg.text, border: `1px solid ${cfg.border}` }}
            animate={isRunning ? { opacity: [1, 0.6, 1] } : {}}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            {cfg.label}
          </motion.span>

          <motion.div
            animate={isRunning ? { rotate: 360 } : {}}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          >
            <Icon size={15} style={{ color: cfg.iconColor }} />
          </motion.div>
        </div>

        {/* Agent name */}
        <h4 className="font-bold text-xs text-slate-100 leading-tight">{agent.label}</h4>

        {/* Info / progress */}
        <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: cfg.text, opacity: 0.75 }}>
          {agent.info || "Awaiting dispatch..."}
        </p>

        {/* Progress line */}
        {isRunning && (
          <div className="mt-2.5 progress-bar h-0.5">
            <motion.div
              className="progress-fill h-full"
              animate={{ width: ["20%", "85%", "20%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        )}
        {isCompleted && (
          <div className="mt-2.5 progress-bar h-0.5">
            <div className="progress-fill h-full w-full" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function AgentPipeline({ statuses, logs }: PipelineProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const completedCount = statuses.filter(s => s.status === "completed").length;
  const totalCount = statuses.length;
  const progress = Math.round((completedCount / totalCount) * 100);
  const hasRunning = statuses.some(s => s.status === "running");

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-5 py-4 rounded-2xl"
        style={{
          background: "rgba(15,0,5,0.7)",
          border: "1px solid rgba(255,23,56,0.15)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={hasRunning ? { rotate: 360 } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Zap size={18} className="text-red-400" />
          </motion.div>
          <div>
            <h3 className="text-sm font-bold text-white">Multi-Agent Execution Pipeline</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">LangGraph orchestrator · WebSocket stream</p>
          </div>
        </div>

        {/* Progress ring */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-200">{completedCount}/{totalCount} agents</p>
            <p className="text-[10px] text-slate-500">{progress}% complete</p>
          </div>
          <svg width="40" height="40" className="-rotate-90">
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,23,56,0.15)" strokeWidth="3" />
            <motion.circle
              cx="20" cy="20" r="16"
              fill="none"
              stroke="url(#progressGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 16}`}
              animate={{ strokeDashoffset: 2 * Math.PI * 16 * (1 - progress / 100) }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#cc0022" />
                <stop offset="100%" stopColor="#ff8c9a" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.div>

      {/* Pipeline cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statuses.map((agent, i) => (
          <AgentCard key={agent.name} agent={agent} index={i} />
        ))}
      </div>

      {/* Log terminal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex-1 flex flex-col rounded-2xl overflow-hidden scanlines"
        style={{
          background: "rgba(2, 4, 8, 0.95)",
          border: "1px solid rgba(255,23,56,0.12)",
          minHeight: "220px",
        }}
      >
        {/* Terminal header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid rgba(255,23,56,0.1)" }}
        >
          <div className="flex items-center gap-3">
            {/* macOS-style dots */}
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/70" />
              <span className="w-3 h-3 rounded-full bg-amber-400/70" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
            </div>
            <div className="flex items-center gap-2">
              <Terminal size={12} className="text-red-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Live Execution Console
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            />
            <span className="text-[9px] text-slate-600 uppercase tracking-wider font-mono">ws://active</span>
          </div>
        </div>

        {/* Log lines */}
        <div
          ref={logRef}
          className="flex-1 p-4 overflow-y-auto space-y-1 log-console"
        >
          {logs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-slate-600 text-xs"
            >
              <span className="typing-cursor">Awaiting pipeline launch</span>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-pre-wrap leading-relaxed"
                  style={{ color: getLogColor(log), fontSize: "11px" }}
                >
                  <span className="text-slate-700 mr-2 select-none">›</span>
                  {log}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
}
