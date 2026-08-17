"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  Node, 
  Edge,
  MarkerType
} from "reactflow";
import "reactflow/dist/style.css";
import mermaid from "mermaid";
import Editor from "@monaco-editor/react";
import { Play, Download, Edit3, Image, FileJson, Layers, Minimize2 } from "lucide-react";

// Initialize Mermaid.js
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "var(--font-geist-mono), monospace"
});

interface CanvasProps {
  diagrams: {
    c4_context: string;
    c4_container: string;
    er_diagram: string;
    aws_deployment: string;
    sequence_diagram: string;
  };
  onRegenerate?: () => void;
}

export default function ArchitectureCanvas({ diagrams, onRegenerate }: CanvasProps) {
  const [activeTab, setActiveTab] = useState<keyof typeof diagrams>("c4_container");
  const [mermaidCode, setMermaidCode] = useState("");
  const [renderError, setRenderError] = useState<string | null>(null);
  const [diagramSvg, setDiagramSvg] = useState<string>("");
  const [editMode, setEditMode] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);

  // Sync state with incoming diagrams
  useEffect(() => {
    if (diagrams && diagrams[activeTab]) {
      setMermaidCode(diagrams[activeTab]);
    }
  }, [diagrams, activeTab]);

  // Mermaid Render Loop
  useEffect(() => {
    if (!mermaidCode) return;
    setRenderError(null);

    const renderDiagram = async () => {
      try {
        const id = `mermaid-svg-${Math.floor(Math.random() * 100000)}`;
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = `<div id="${id}">${mermaidCode}</div>`;
          const { svg } = await mermaid.render(id, mermaidCode);
          setDiagramSvg(svg);
        }
      } catch (err: any) {
        console.error("Mermaid parsing failed", err);
        setRenderError(err.message || "Syntax error in Mermaid markup.");
      }
    };

    const timer = setTimeout(renderDiagram, 150);
    return () => clearTimeout(timer);
  }, [mermaidCode]);

  // React Flow conversion (Generate interactive visual graph from database tables & api context)
  const initialNodes: Node[] = [
    { id: "1", type: "input", data: { label: "Client Ingress (ALB)" }, position: { x: 250, y: 0 }, style: { background: "#cc0022", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold" } },
    { id: "2", data: { label: "FastAPI Backend App" }, position: { x: 250, y: 100 }, style: { background: "#1e293b", color: "#38bdf8", border: "1px solid #0284c7", borderRadius: "8px", fontWeight: "semibold" } },
    { id: "3", data: { label: "Redis Caching" }, position: { x: 450, y: 100 }, style: { background: "#1e293b", color: "#ef4444", border: "1px solid #b91c1c", borderRadius: "8px" } },
    { id: "4", type: "output", data: { label: "PostgreSQL Primary" }, position: { x: 150, y: 200 }, style: { background: "#0f172a", color: "#10b981", border: "1px solid #047857", borderRadius: "8px" } },
    { id: "5", type: "output", data: { label: "PostgreSQL Replica" }, position: { x: 350, y: 200 }, style: { background: "#0f172a", color: "#a855f7", border: "1px solid #7e22ce", borderRadius: "8px" } }
  ];

  const initialEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e2-3", source: "2", target: "3", markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e2-4", source: "2", target: "4", label: "Writes", markerEnd: { type: MarkerType.ArrowClosed } },
    { id: "e2-5", source: "2", target: "5", label: "Reads", markerEnd: { type: MarkerType.ArrowClosed } }
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Download utilities
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-[#0a0003] rounded-xl border border-red-900/30 overflow-hidden">
      {/* Topology controls */}
      <div className="flex items-center justify-between px-6 py-4 bg-black border-b border-red-900/30">
        <div className="flex gap-2">
          {(Object.keys(diagrams) as Array<keyof typeof diagrams>).map((key) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                setEditMode(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === key && !editMode
                  ? "bg-red-600 text-white shadow-md shadow-red-600/10"
                  : "text-slate-400 hover:cyber-panel cyber-panel-blue hover:text-slate-200"
              }`}
            >
              {key.replace("_", " ")}
            </button>
          ))}
          <button
            onClick={() => setEditMode(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition ${
              editMode
                ? "bg-red-600 text-white shadow-md"
                : "text-slate-400 hover:cyber-panel cyber-panel-blue hover:text-slate-200"
            }`}
          >
            <Edit3 size={12} />
            Interactive Editor
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => downloadFile(mermaidCode, `${activeTab}.mermaid`, "text/plain")}
            className="flex items-center gap-1.5 px-3 py-1.5 cyber-panel cyber-panel-blue hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
            title="Download Mermaid Source"
          >
            <Download size={14} />
            Mermaid
          </button>
          <button
            onClick={() => downloadFile(diagramSvg, `${activeTab}.svg`, "image/svg+xml")}
            className="flex items-center gap-1.5 px-3 py-1.5 cyber-panel cyber-panel-blue hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
            title="Download SVG Diagram"
          >
            <Image size={14} />
            SVG
          </button>
        </div>
      </div>

      {/* Main interactive panel */}
      <div className="flex-1 flex overflow-hidden">
        {editMode ? (
          <div className="flex-1 flex divide-x divide-slate-800">
            {/* Monaco script block */}
            <div className="w-1/2 h-full">
              <Editor
                height="100%"
                defaultLanguage="markdown"
                theme="vs-dark"
                value={mermaidCode}
                onChange={(value) => setMermaidCode(value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollbar: { vertical: "hidden" }
                }}
              />
            </div>
            {/* Live rendered preview */}
            <div className="w-1/2 h-full bg-[#0a0003] p-6 flex flex-col items-center justify-center relative overflow-auto">
              {renderError ? (
                <div className="bg-red-950/40 border border-red-800 p-4 rounded-lg m-4 max-w-md">
                  <h4 className="text-red-500 glow-text-red font-bold text-sm">Mermaid Compile Error</h4>
                  <p className="text-xs text-red-300 font-mono mt-1 overflow-x-auto">{renderError}</p>
                </div>
              ) : (
                <div 
                  className="w-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: diagramSvg }} 
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 relative w-full h-full">
            {/* Standard React Flow Visualiser for AWS deployment or logical containers */}
            {activeTab === "aws_deployment" ? (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                className="bg-[#0a0003]"
              >
                <MiniMap style={{ background: "#0b0f19", border: "1px solid #1e293b" }} nodeColor={() => "#cc0022"} />
                <Controls />
                <Background color="#334155" gap={16} />
              </ReactFlow>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8 overflow-auto">
                {renderError ? (
                  <div className="bg-red-950/40 border border-red-800 p-4 rounded-lg max-w-md">
                    <h4 className="text-red-500 glow-text-red font-bold text-sm">Diagram Parsing Error</h4>
                    <p className="text-xs text-red-300 font-mono mt-1">{renderError}</p>
                  </div>
                ) : (
                  <div 
                    className="max-w-full max-h-full"
                    dangerouslySetInnerHTML={{ __html: diagramSvg }} 
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden container for initial Mermaid renderings */}
      <div ref={mermaidRef} className="hidden" />
    </div>
  );
}
