"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, ShieldAlert, Zap, BarChart3, RefreshCw, Cpu, CheckCircle2, AlertCircle } from "lucide-react";
import { checkBackendHealth, resetDemoStore } from "@/lib/api";

interface NavbarProps {
  onDataReset?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onDataReset }) => {
  const pathname = usePathname();
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [geminiModel, setGeminiModel] = useState<string>("gemini-2.5-flash");
  const [isResetting, setIsResetting] = useState(false);

  const verifyHealth = async () => {
    const health = await checkBackendHealth();
    if (health.status === "healthy") {
      setBackendStatus("online");
      if (health.gemini_model) setGeminiModel(health.gemini_model);
    } else {
      setBackendStatus("offline");
    }
  };

  useEffect(() => {
    verifyHealth();
    const interval = setInterval(verifyHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetDemoStore();
      if (onDataReset) onDataReset();
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsResetting(false), 600);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-rzp-blue/15 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rzp-blue via-[#0c2340] to-rzp-navy border border-rzp-blue/30 shadow-lg shadow-rzp-blue/20">
            <ShieldCheck className="w-6 h-6 text-rzp-cyan" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#080c14] animate-ping" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#080c14]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-rzp-blue bg-clip-text text-transparent">
                RISKOR
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rzp-blue/20 text-rzp-cyan border border-rzp-blue/30 uppercase tracking-wider">
                AI Sentinel
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium -mt-0.5">
              Razorpay Payment Fraud Defense Engine
            </div>
          </div>
        </div>

        {/* Center: Navigation Switcher */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-surface-raised/70 rounded-xl border border-white/5">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              pathname === "/dashboard" || pathname === "/"
                ? "bg-rzp-blue text-white shadow-md shadow-rzp-blue/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Merchant Defense Dashboard
          </Link>
          <Link
            href="/simulator"
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              pathname === "/simulator"
                ? "bg-rzp-blue text-white shadow-md shadow-rzp-blue/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Zap className="w-4 h-4 text-rzp-cyan" />
            Checkout Attack Simulator
          </Link>
        </nav>

        {/* Right: Engine Status & Demo Tools */}
        <div className="flex items-center gap-3">
          {/* AI Model Tag */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-raised border border-white/10 text-xs text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-rzp-cyan" />
            <span>Agent: <strong className="text-white font-mono text-[11px]">{geminiModel}</strong></span>
          </div>

          {/* Backend Status Indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              backendStatus === "online"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : backendStatus === "checking"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
            }`}
          >
            {backendStatus === "online" ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Engine Active</span>
              </>
            ) : backendStatus === "checking" ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Backend Offline</span>
              </>
            )}
          </div>

          {/* Reset Demo Data */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            title="Reset to fresh demo transaction feed"
            className="flex items-center gap-1.5 p-2 rounded-lg bg-surface-raised hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-rzp-cyan" : ""}`} />
            <span className="hidden sm:inline">Reset Feed</span>
          </button>
        </div>
      </div>
    </header>
  );
};
