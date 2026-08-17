"use client";

import React from "react";
import { AlertTriangle, Zap, Server, Database, GitMerge } from "lucide-react";

interface LoadSpec {
  load_multiplier: string;
  bottleneck: string;
  affected_component: string;
  expected_failure_mode: string;
  why_it_fails: string;
  required_capacity_change: string;
  recommended_architecture_change: string;
  additional_cost_monthly: number;
}

interface ScaleProps {
  scaleData: {
    scale_10x: LoadSpec;
    scale_100x: LoadSpec;
    scale_1000x: LoadSpec;
    roadmap: string[];
  };
}

export default function ScaleSimulation({ scaleData }: ScaleProps) {
  const { scale_10x, scale_100x, scale_1000x, roadmap } = scaleData;
  const metrics = [scale_10x, scale_100x, scale_1000x];

  const getLoadBadge = (multiplier: string) => {
    if (multiplier === "10x") return "bg-red-500/10 text-red-500 glow-text-red border-red-500/20";
    if (multiplier === "100x") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  };

  const getIcon = (multiplier: string) => {
    if (multiplier === "10x") return <Server size={20} className="text-red-500 glow-text-red" />;
    if (multiplier === "100x") return <Database size={20} className="text-amber-400" />;
    return <GitMerge size={20} className="text-rose-400" />;
  };

  return (
    <div className="space-y-8">
      {/* Simulation Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {metrics.map((spec) => (
          <div 
            key={spec.load_multiplier}
            className="cyber-panel cyber-panel-red p-6 rounded-xl flex flex-col justify-between hover:border-slate-700/80 transition-all duration-300 relative group"
          >
            {/* Header */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getLoadBadge(spec.load_multiplier)}`}>
                  {spec.load_multiplier} Multiplier
                </span>
                <span className="p-2 cyber-panel rounded-lg group-hover:scale-110 transition duration-300">
                  {getIcon(spec.load_multiplier)}
                </span>
              </div>

              {/* Details */}
              <h4 className="text-slate-100 font-bold text-sm mb-1">Bottleneck Target:</h4>
              <p className="text-sm font-semibold text-rose-400 mb-3">{spec.bottleneck}</p>
              
              <div className="space-y-3 border-t border-red-900/30 pt-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Component</span>
                  <span className="text-xs text-slate-300 font-medium">{spec.affected_component}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Failure Mode</span>
                  <span className="text-xs text-red-300/90 font-mono block leading-relaxed bg-red-950/20 px-2 py-1 rounded border border-red-900/30">{spec.expected_failure_mode}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Why it fails</span>
                  <span className="text-xs text-slate-400 block leading-relaxed mt-0.5">{spec.why_it_fails}</span>
                </div>
              </div>
            </div>

            {/* Mitigations Footer */}
            <div className="border-t border-red-900/30 pt-4 mt-6">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Architectural Mitigation</span>
              <p className="text-xs text-red-300 leading-relaxed font-semibold mb-3">{spec.recommended_architecture_change}</p>
              <div className="flex justify-between items-center text-xs font-bold cyber-panel p-2 rounded">
                <span className="text-slate-400">Additional Cost</span>
                <span className="text-red-500 glow-text-red">+${spec.additional_cost_monthly}/mo</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scaling Roadmap Card */}
      <div className="cyber-panel cyber-panel-red p-6 rounded-xl">
        <h3 className="text-white font-bold glow-text-white text-sm mb-5 flex items-center gap-2">
          <Zap size={18} className="text-red-500 glow-text-red" />
          Recommended Scaling Operations Roadmap
        </h3>
        <div className="relative border-l border-red-900/40 ml-4 pl-6 space-y-6">
          {roadmap.map((step, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-slate-900 shadow shadow-red-500/20"></div>
              <p className="text-sm font-semibold text-slate-200">{step.split(":")[0]}</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.split(":")[1]?.trim() || step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
