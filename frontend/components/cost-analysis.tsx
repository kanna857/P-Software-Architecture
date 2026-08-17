"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingDown, Cloud, ShieldCheck, DollarSign } from "lucide-react";

interface CostProps {
  costData: {
    aws_cost: { total: number; compute: number; database: number; storage: number; cache: number; network: number };
    gcp_cost: { total: number; compute: number; database: number; storage: number; cache: number; network: number };
    recommendations: string[];
    monthly_saving_estimate: number;
    current_cost_profile: string;
    optimized_cost_estimate: number;
  };
}

export default function CostAnalysis({ costData }: CostProps) {
  const { aws_cost, gcp_cost, recommendations, monthly_saving_estimate, optimized_cost_estimate } = costData;

  // Chart data formatting
  const comparisonData = [
    { name: "Compute", AWS: aws_cost.compute, GCP: gcp_cost.compute },
    { name: "Database", AWS: aws_cost.database, GCP: gcp_cost.database },
    { name: "Storage", AWS: aws_cost.storage, GCP: gcp_cost.storage },
    { name: "Cache", AWS: aws_cost.cache, GCP: gcp_cost.cache },
    { name: "Network", AWS: aws_cost.network, GCP: gcp_cost.network }
  ];

  const profileData = [
    { name: "Cost Optimized (A)", MonthlyCost: 80 },
    { name: "Balanced Baseline (B)", MonthlyCost: aws_cost.total },
    { name: "High Scale (C)", MonthlyCost: 1850 }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cyber-panel cyber-panel-red p-6 rounded-xl flex items-center gap-4">
          <div className="bg-red-600/10 p-3 rounded-lg text-red-500 glow-text-red">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Estimated AWS Cost</p>
            <p className="text-2xl font-bold text-white">${aws_cost.total.toFixed(2)}/mo</p>
          </div>
        </div>

        <div className="cyber-panel cyber-panel-red p-6 rounded-xl flex items-center gap-4">
          <div className="bg-sky-600/10 p-3 rounded-lg text-sky-400">
            <Cloud size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Estimated GCP Cost</p>
            <p className="text-2xl font-bold text-white">${gcp_cost.total.toFixed(2)}/mo</p>
          </div>
        </div>

        <div className="bg-black border border-emerald-800/60 p-6 rounded-xl flex items-center gap-4">
          <div className="bg-emerald-600/10 p-3 rounded-lg text-emerald-400">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Optimized Cost Savings</p>
            <p className="text-2xl font-bold text-emerald-400">Save ${monthly_saving_estimate.toFixed(2)}/mo</p>
          </div>
        </div>
      </div>

      {/* Pricing Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cyber-panel cyber-panel-red p-6 rounded-xl">
          <h3 className="text-white font-bold glow-text-white text-sm mb-4">Cloud Provider Resource Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }} />
                <Legend />
                <Bar dataKey="AWS" fill="#cc0022" radius={[4, 4, 0, 0]} />
                <Bar dataKey="GCP" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="cyber-panel cyber-panel-red p-6 rounded-xl">
          <h3 className="text-white font-bold glow-text-white text-sm mb-4">Architectural Options Price Matrix</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profileData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }} />
                <Bar dataKey="MonthlyCost" fill="#ff4d6d" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#c7d2fe', fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cost-Optimizations list */}
      <div className="cyber-panel cyber-panel-red p-6 rounded-xl">
        <h3 className="text-white font-bold glow-text-white text-sm mb-4 flex items-center gap-2">
          <ShieldCheck className="text-emerald-500" size={18} />
          Cost-Optimization Advisor Recommendations
        </h3>
        <ul className="space-y-3">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-300">
              <span className="text-red-500 glow-text-red font-bold">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
