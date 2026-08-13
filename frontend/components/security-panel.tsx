"use client";

import React from "react";
import { Shield, ShieldAlert, Key, Lock, HelpCircle } from "lucide-react";

interface Threat {
  stride_category: string;
  threat: string;
  impact: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  likelihood: string;
  mitigation: string;
  residual_risk: string;
}

interface SecurityProps {
  securityData: {
    authentication_strategy: string;
    authorization_strategy: string;
    data_protection: string;
    threats: Threat[];
    disclaimer: string;
  };
}

export default function SecurityPanel({ securityData }: SecurityProps) {
  const { authentication_strategy, authorization_strategy, data_protection, threats, disclaimer } = securityData;

  const getSeverityColor = (sev: Threat["severity"]) => {
    switch (sev) {
      case "Critical":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "High":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Principles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black border border-red-900/30 p-6 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-white font-bold text-sm">Identity Management</h4>
            <Key size={18} className="text-red-400" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{authentication_strategy}</p>
        </div>

        <div className="bg-black border border-red-900/30 p-6 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-white font-bold text-sm">Access Permissions</h4>
            <Shield size={18} className="text-emerald-400" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{authorization_strategy}</p>
        </div>

        <div className="bg-black border border-red-900/30 p-6 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-white font-bold text-sm">Encryption & Storage</h4>
            <Lock size={18} className="text-sky-400" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{data_protection}</p>
        </div>
      </div>

      {/* STRIDE Threat Table */}
      <div className="bg-black border border-red-900/30 rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-850 border-b border-red-900/30 flex items-center gap-2">
          <ShieldAlert className="text-rose-400" size={18} />
          <h3 className="text-white font-bold text-sm">STRIDE Threat Modeling Audit</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a0003] border-b border-red-900/30 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Threat & Impact</th>
                <th className="px-6 py-3 text-center">Severity</th>
                <th className="px-6 py-3">Mitigation Control</th>
                <th className="px-6 py-3 text-center">Residual Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs">
              {threats.map((t, i) => (
                <tr key={i} className="hover:bg-slate-850/30 transition text-slate-300">
                  <td className="px-6 py-4 font-bold text-red-400">{t.stride_category}</td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="font-semibold text-slate-200">{t.threat}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{t.impact}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getSeverityColor(t.severity)}`}>
                      {t.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-sm leading-relaxed text-slate-400">{t.mitigation}</td>
                  <td className="px-6 py-4 text-center font-semibold text-emerald-400">{t.residual_risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Disclaimer alert */}
      <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl flex gap-3 text-xs text-amber-300">
        <HelpCircle size={18} className="shrink-0 text-amber-500" />
        <p className="leading-relaxed">
          <strong>Security Notice:</strong> {disclaimer}
        </p>
      </div>
    </div>
  );
}
