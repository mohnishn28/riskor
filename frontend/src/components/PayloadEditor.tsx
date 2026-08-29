"use client";

import React, { useMemo } from "react";
import { TransactionPayload } from "@/lib/types";
import { Sliders, ShieldAlert, Zap, Globe, Smartphone, CreditCard, Lock } from "lucide-react";

interface PayloadEditorProps {
  payload: TransactionPayload;
  onChange: (updated: TransactionPayload) => void;
}

export const PayloadEditor: React.FC<PayloadEditorProps> = ({ payload, onChange }) => {
  // Pre-calculate live ML score estimate based on formula
  const liveEstimatedScore = useMemo(() => {
    let vel = payload.velocity_1h <= 1 ? 0.05 : payload.velocity_1h <= 3 ? 0.25 : payload.velocity_1h <= 7 ? 0.6 : payload.velocity_1h <= 15 ? 0.85 : 0.98;
    let geo = payload.geo_distance_km < 50 ? 0.05 : payload.geo_distance_km < 350 ? 0.2 : payload.geo_distance_km < 1200 ? 0.45 : payload.geo_distance_km < 4000 ? 0.75 : 0.95;
    let dev = 1.0 - payload.device_trust_score + (payload.is_vpn_or_proxy ? 0.25 : 0);
    dev = Math.min(1.0, Math.max(0, dev));
    let amt = payload.amount < 100 && payload.velocity_1h > 4 ? 0.88 : payload.amount > 50000 ? 0.8 : 0.15;
    let avs = payload.billing_zip_match ? 0.05 : 0.85;

    let comp = vel * 0.28 + geo * 0.24 + dev * 0.22 + amt * 0.14 + avs * 0.12;
    if (payload.velocity_1h >= 6 && payload.geo_distance_km >= 2500 && payload.device_trust_score <= 0.35) {
      comp = Math.max(comp, 0.88);
    }
    return Number(Math.min(1.0, Math.max(0, comp)).toFixed(2));
  }, [payload]);

  const updateField = <K extends keyof TransactionPayload>(key: K, value: TransactionPayload[K]) => {
    onChange({
      ...payload,
      [key]: value,
    });
  };

  const getScoreBadge = (score: number) => {
    if (score >= 0.6) return { color: "text-rose-400 border-rose-500/30 bg-rose-500/10", label: "CRITICAL RISK (BLOCK)" };
    if (score >= 0.35) return { color: "text-amber-400 border-amber-500/30 bg-amber-500/10", label: "ELEVATED RISK (GEMINI 3DS)" };
    return { color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10", label: "CLEAN PROFILE (ALLOW)" };
  };

  const badge = getScoreBadge(liveEstimatedScore);

  return (
    <div className="p-5 rounded-2xl bg-surface/95 backdrop-blur-md border border-rzp-blue/30 space-y-5 animate-in fade-in duration-300">
      {/* Header & Live Prediction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-rzp-cyan" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Custom Attack Parameter Matrix
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Live ML Risk Estimate:</span>
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${badge.color}`}>
            {liveEstimatedScore.toFixed(2)} • {badge.label}
          </span>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
        {/* 1. Transaction Amount */}
        <div className="space-y-2 p-3.5 rounded-xl bg-surface-raised/40 border border-white/5">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              Transaction Amount
            </span>
            <span className="font-mono font-bold text-white text-sm">
              ₹{payload.amount.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="150000"
            step="100"
            value={payload.amount}
            onChange={(e) => updateField("amount", Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rzp-blue"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>₹50 (Bot Micro)</span>
            <span>₹50k (Mid)</span>
            <span>₹1.5L (Whale)</span>
          </div>
        </div>

        {/* 2. 1-Hour Velocity */}
        <div className="space-y-2 p-3.5 rounded-xl bg-surface-raised/40 border border-white/5">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-rzp-cyan" />
              1-Hour Velocity (Frequency)
            </span>
            <span className="font-mono font-bold text-white text-sm">
              {payload.velocity_1h} txns/hr
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="35"
            step="1"
            value={payload.velocity_1h}
            onChange={(e) => updateField("velocity_1h", Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rzp-cyan"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1 (Normal)</span>
            <span>8 (Suspicious)</span>
            <span>35 (Botnet)</span>
          </div>
        </div>

        {/* 3. Geo-Distance Discrepancy */}
        <div className="space-y-2 p-3.5 rounded-xl bg-surface-raised/40 border border-white/5">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-rzp-blue" />
              Geographic Distance
            </span>
            <span className="font-mono font-bold text-white text-sm">
              {payload.geo_distance_km.toLocaleString()} km
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={payload.geo_distance_km}
            onChange={(e) => updateField("geo_distance_km", Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rzp-blue"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0 km (Local)</span>
            <span>3,000 km (Region)</span>
            <span>10,000 km (Global)</span>
          </div>
        </div>

        {/* 4. Device Trust Score */}
        <div className="space-y-2 p-3.5 rounded-xl bg-surface-raised/40 border border-white/5">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              Device Trust Score
            </span>
            <span className="font-mono font-bold text-white text-sm">
              {(payload.device_trust_score * 100).toFixed(0)}% ({payload.device_trust_score.toFixed(2)})
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.02"
            value={payload.device_trust_score}
            onChange={(e) => updateField("device_trust_score", Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0% (Untrusted / Bot)</span>
            <span>50% (Unknown)</span>
            <span>100% (Trusted)</span>
          </div>
        </div>

        {/* 5. AVS / Billing ZIP Match */}
        <div className="space-y-2 p-3.5 rounded-xl bg-surface-raised/40 border border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Billing Postal ZIP Match
            </span>
            <span className={`font-bold ${payload.billing_zip_match ? "text-emerald-400" : "text-rose-400"}`}>
              {payload.billing_zip_match ? "MATCHED" : "MISMATCH"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => updateField("billing_zip_match", true)}
              className={`py-1.5 rounded-lg font-semibold text-xs border transition-all ${
                payload.billing_zip_match
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-surface text-slate-400 border-white/5"
              }`}
            >
              Match (Valid)
            </button>
            <button
              type="button"
              onClick={() => updateField("billing_zip_match", false)}
              className={`py-1.5 rounded-lg font-semibold text-xs border transition-all ${
                !payload.billing_zip_match
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-surface text-slate-400 border-white/5"
              }`}
            >
              Mismatch (Stolen)
            </button>
          </div>
        </div>

        {/* 6. VPN / Proxy Detection */}
        <div className="space-y-2 p-3.5 rounded-xl bg-surface-raised/40 border border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              VPN / TOR / Proxy
            </span>
            <span className={`font-bold ${payload.is_vpn_or_proxy ? "text-rose-400" : "text-emerald-400"}`}>
              {payload.is_vpn_or_proxy ? "DETECTED" : "CLEAN"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => updateField("is_vpn_or_proxy", false)}
              className={`py-1.5 rounded-lg font-semibold text-xs border transition-all ${
                !payload.is_vpn_or_proxy
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-surface text-slate-400 border-white/5"
              }`}
            >
              Direct IP (Clean)
            </button>
            <button
              type="button"
              onClick={() => updateField("is_vpn_or_proxy", true)}
              className={`py-1.5 rounded-lg font-semibold text-xs border transition-all ${
                payload.is_vpn_or_proxy
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-surface text-slate-400 border-white/5"
              }`}
            >
              VPN Masking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
