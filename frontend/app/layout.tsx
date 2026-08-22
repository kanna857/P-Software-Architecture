import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spider-Architect 2.0 — Web-Slinger AI",
  description: "With great power comes great software architecture. Build production-grade systems with multi-agent AI pipelines.",
  keywords: ["AI architect", "spider-man", "multi-agent", "LangGraph", "software design"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <style>{`
          /* Spider-Man hero entrance + swing — exact copy from login.html */
          @keyframes heroEntrance {
            0%   { transform: translateY(-110vh) rotate(-18deg); opacity: 0; }
            65%  { transform: translateY(12px) rotate(6deg); opacity: 1; }
            82%  { transform: translateY(-6px) rotate(-3deg); }
            100% { transform: translateY(0) rotate(0deg); opacity: 1; }
          }
          @keyframes heroSwing {
            0%   { transform: rotate(-3.5deg) translateY(0px); }
            50%  { transform: rotate(3.5deg)  translateY(14px); }
            100% { transform: rotate(-3.5deg) translateY(0px); }
          }
          @keyframes ambientPulse {
            0%   { opacity: 0.5; transform: translateX(-50%) scale(0.92); }
            100% { opacity: 0.9; transform: translateX(-50%) scale(1.14); }
          }
          .hero-swing-inner {
            position: relative; width: 100%; height: 100%;
            transform-origin: top center;
            animation: heroEntrance 1.4s cubic-bezier(0.175,0.885,0.32,1.2) forwards,
                       heroSwing 5.5s ease-in-out 1.4s infinite alternate;
          }
          .hero-wrapper {
            position: absolute; top: 0; left: 50%;
            transform: translateX(-50%);
            width: 100%; display: flex;
            justify-content: center; align-items: flex-start;
          }
          .spiderman-img {
            width: 100%; max-width: 300px; height: auto;
            object-fit: contain; object-position: top center; display: block;
            filter: drop-shadow(0 0 22px rgba(255,23,56,0.55)) drop-shadow(0 15px 35px rgba(0,0,0,0.95));
            user-select: none; -webkit-user-drag: none;
          }
          .hero-red-ambient {
            position: absolute; width: 280px; height: 400px;
            top: 30px; left: 50%; transform: translateX(-50%);
            background: radial-gradient(circle, rgba(255,23,56,0.42) 0%, rgba(139,0,21,0.22) 50%, transparent 75%);
            border-radius: 50%; filter: blur(38px); z-index: -1;
            animation: ambientPulse 4s ease-in-out infinite alternate;
          }
        `}</style>
      </head>
      <body className="min-h-full" style={{ fontFamily: "'Poppins', 'Inter', system-ui, sans-serif" }}>
        {/* ── Layer 1-7: Cinematic Spider-Man Background ── */}
        <div id="app-bg-city" />
        <div id="app-bg-overlay" />
        <div id="app-bg-grid" />
        <div id="app-bg-spiderweb" />
        <div id="app-bg-rain" />
        <div id="app-bg-web" />
        <div id="app-bg-redlight" />
        <div id="app-bg-miles" />

        {/* ── Spider-Man hanging figure — positioned at sidebar right edge ── */}
        <div style={{
          position: "fixed",
          left: "260px",
          top: 0,
          width: "220px",
          height: "100vh",
          zIndex: 8,
          pointerEvents: "none",
          opacity: 0.85,
        }}>
          <div className="hero-swing-inner">
            <div className="hero-wrapper">
              <div className="hero-red-ambient" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/spider-login/spiderman.png"
                alt="Spider-Man"
                className="spiderman-img"
              />
            </div>
          </div>
        </div>

        {/* ── Spider ticker bar at very top ── */}
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "20px",
          zIndex: 50,
          background: "rgba(180,0,20,0.85)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255,23,56,0.5)",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}>
          <div className="spidey-ticker" style={{ flex: 1 }}>
            <span className="spidey-ticker-inner" style={{
              fontSize: "9px",
              fontWeight: "800",
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.9)",
              fontFamily: "var(--font-heading)",
            }}>
              ⦸ WITH GREAT POWER COMES GREAT SOFTWARE ARCHITECTURE      ⦸ SPIDER-ARCHITECT 2.0 ONLINE      ⦸ MULTI-AGENT AI PIPELINE ACTIVE      ⦸ WEB-SLINGER CORE: OPERATIONAL      ⦸ DAILY BUGLE HEADLINE: AI GENERATES ENTIRE SYSTEM ARCHITECTURE IN SECONDS      ⦸ STARK INDUSTRIES PROTOCOLS ENGAGED      ⦸ FRIENDLY NEIGHBORHOOD ARCHITECT AT YOUR SERVICE
            </span>
          </div>
        </div>

        {/* ── App Content (above all backgrounds) ── */}
        <div style={{ position: "relative", zIndex: 10, paddingTop: "20px" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
