"use client";

import React from "react";
import { TransactionPayload, AttackPreset } from "@/lib/types";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Flame,
  Globe,
  Bot,
  UserCheck,
  Sliders,
  Sparkles,
} from "lucide-react";

export const PRESETS: AttackPreset[] = [
  {
    id: "legit",
    name: "Legitimate Shopper",
    description: "Standard local purchase, verified device trust (96%), zero velocity spike, valid AVS.",
    tag: "Clean Baseline",
    tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    payload: {
      amount: 2499,
      velocity_1h: 1,
      geo_distance_km: 4,
      device_trust_score: 0.96,
      billing_zip_match: true,
      ip_address: "122.161.48.91",
      ip_location: "Bengaluru, India",
      cardholder_name: "Priya Sundaram",
      card_last4: "9012",
      card_network: "Visa",
      is_vpn_or_proxy: false,
      user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  },
  {
    id: "velocity_bot",
    name: "Card Testing Bot Syndicate",
    description: "High-frequency micro-charges (₹89, 26 attempts/hr) via Headless Chrome proxy in Romania.",
    tag: "High Velocity Bot",
    tagColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    payload: {
      amount: 89,
      velocity_1h: 26,
      geo_distance_km: 7420,
      device_trust_score: 0.08,
      billing_zip_match: false,
      ip_address: "185.220.101.9",
      ip_location: "Bucharest, Romania",
      cardholder_name: "Anita Verma",
      card_last4: "8841",
      card_network: "Visa",
      is_vpn_or_proxy: true,
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) HeadlessChrome/122.0.0.0",
    },
  },
  {
    id: "impossible_travel",
    name: "Impossible Geo-Hopping",
    description: "High-value charge (₹94,500) originating from Lagos, 8,900km away from card issuing city.",
    tag: "Geo Anomaly",
    tagColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    payload: {
      amount: 94500,
      velocity_1h: 6,
      geo_distance_km: 8900,
      device_trust_score: 0.18,
      billing_zip_match: false,
      ip_address: "197.210.226.54",
      ip_location: "Lagos, Nigeria",
      cardholder_name: "Vikram Malhotra",
      card_last4: "2190",
      card_network: "Mastercard",
      is_vpn_or_proxy: true,
      user_agent: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
    },
  },
  {
    id: "stepup_travel",
    name: "Vacation Travel / High Cart",
    description: "Domestic holiday purchase (₹48,000 in Goa, 420km away) with matching ZIP & trusted iPhone.",
    tag: "3DS Challenge",
    tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    payload: {
      amount: 48000,
      velocity_1h: 3,
      geo_distance_km: 420,
      device_trust_score: 0.65,
      billing_zip_match: true,
      ip_address: "103.21.124.8",
      ip_location: "Goa, India",
      cardholder_name: "Siddharth Rao",
      card_last4: "6519",
      card_network: "RuPay",
      is_vpn_or_proxy: false,
      user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X)",
    },
  },
  {
    id: "ato_surge",
    name: "Account Takeover Surge",
    description: "Compounded multi-factor risk: rapid velocity (9/hr), foreign proxy in Russia, failed AVS.",
    tag: "Critical Fraud",
    tagColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    payload: {
      amount: 62000,
      velocity_1h: 9,
      geo_distance_km: 5100,
      device_trust_score: 0.12,
      billing_zip_match: false,
      ip_address: "194.26.29.112",
      ip_location: "Saint Petersburg, Russia",
      cardholder_name: "Sunil Kapoor",
      card_last4: "1098",
      card_network: "Visa",
      is_vpn_or_proxy: true,
      user_agent: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0)",
    },
  },
];

interface AttackToggleProps {
  isAttackMode: boolean;
  onToggleAttackMode: (enabled: boolean) => void;
  selectedPreset: string;
  onSelectPreset: (preset: AttackPreset) => void;
  onOpenCustomEditor: () => void;
  isCustomEditorOpen: boolean;
}

export const AttackToggle: React.FC<AttackToggleProps> = ({
  isAttackMode,
  onToggleAttackMode,
  selectedPreset,
  onSelectPreset,
  onOpenCustomEditor,
  isCustomEditorOpen,
}) => {
  return (
    <div className="space-y-4">
      {/* Master Toggle Banner */}
      <div
        className={`p-5 rounded-2xl border transition-all duration-300 ${
          isAttackMode
            ? "bg-rose-950/40 border-rose-500/40 shadow-lg shadow-rose-950/50 glow-red"
            : "bg-emerald-950/30 border-emerald-500/30 shadow-lg shadow-emerald-950/30 glow-green"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl border ${
                isAttackMode
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              }`}
            >
              {isAttackMode ? <Flame className="w-6 h-6 animate-pulse" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white">
                  {isAttackMode ? "FRAUD ATTACK SIMULATION ACTIVE" : "AUTHENTIC USER MODE"}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isAttackMode
                      ? "bg-rose-500 text-white animate-pulse"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  {isAttackMode ? "Attacking" : "Legit"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isAttackMode
                  ? "Emulating adversarial botnets, impossible travel velocities, and proxy masking."
                  : "Simulating clean consumer checkout with verified biometrics and local IP."}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-xs font-semibold text-slate-400">
              {isAttackMode ? "Attack ON" : "Attack OFF"}
            </span>
            <button
              type="button"
              onClick={() => {
                const nextState = !isAttackMode;
                onToggleAttackMode(nextState);
                if (nextState) {
                  onSelectPreset(PRESETS[1]); // Default to velocity bot
                } else {
                  onSelectPreset(PRESETS[0]); // Default to legit
                }
              }}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isAttackMode ? "bg-rose-600" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isAttackMode ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Preset Buttons Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rzp-cyan" />
            Attack & Behavior Scenarios
          </span>
          <button
            onClick={onOpenCustomEditor}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
              isCustomEditorOpen
                ? "bg-rzp-blue text-white border-rzp-blue"
                : "bg-surface text-slate-300 border-white/10 hover:border-white/20 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isCustomEditorOpen ? "Hide Sliders" : "Custom Sliders"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onSelectPreset(preset);
                  if (preset.id === "legit") {
                    onToggleAttackMode(false);
                  } else {
                    onToggleAttackMode(true);
                  }
                }}
                className={`p-3 rounded-xl text-left border transition-all duration-200 ${
                  isSelected
                    ? "bg-surface-raised border-rzp-blue ring-1 ring-rzp-blue shadow-md shadow-rzp-blue/20"
                    : "bg-surface/80 border-white/5 hover:border-white/20 hover:bg-surface-raised/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-white truncate">{preset.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${preset.tagColor}`}>
                    {preset.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Amt: ₹{preset.payload.amount?.toLocaleString()}</span>
                  <span>Vel: {preset.payload.velocity_1h}/hr</span>
                  <span>Dist: {preset.payload.geo_distance_km}km</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
