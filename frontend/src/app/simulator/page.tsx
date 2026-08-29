"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { AttackToggle, PRESETS } from "@/components/AttackToggle";
import { PayloadEditor } from "@/components/PayloadEditor";
import { RazorpayModal } from "@/components/RazorpayModal";
import { TransactionPayload, EvaluationResult, AttackPreset } from "@/lib/types";
import {
  ShoppingBag,
  CreditCard,
  Zap,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Laptop,
  Headphones,
  Coffee,
  CheckCircle2,
} from "lucide-react";

export default function SimulatorPage() {
  const [isAttackMode, setIsAttackMode] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState("legit");
  const [isCustomEditorOpen, setIsCustomEditorOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentEvaluations, setRecentEvaluations] = useState<EvaluationResult[]>([]);

  // Active mock merchant item
  const [selectedItem, setSelectedItem] = useState({
    title: "Apple MacBook Pro 16\" (M3 Max, 36GB)",
    price: 94500,
    category: "High-End Electronics",
    icon: Laptop,
  });

  // Current transactional payload state
  const [payload, setPayload] = useState<TransactionPayload>({
    transaction_id: `pay_rzp_live_${Math.random().toString(36).substring(2, 11)}`,
    amount: 2499,
    currency: "INR",
    velocity_1h: 1,
    geo_distance_km: 4,
    device_trust_score: 0.96,
    billing_zip_match: true,
    ip_address: "122.161.48.91",
    ip_location: "Bengaluru, India",
    cardholder_name: "Priya Sundaram",
    card_last4: "9012",
    card_network: "Visa",
    merchant_id: "merch_rzp_9921",
    merchant_name: "NexStore Electronics",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    is_vpn_or_proxy: false,
  });

  const handleSelectPreset = (preset: AttackPreset) => {
    setSelectedPresetId(preset.id);
    const newTxnId = `pay_rzp_live_${Math.random().toString(36).substring(2, 11)}`;
    setPayload((prev) => ({
      ...prev,
      transaction_id: newTxnId,
      ...preset.payload,
    }));
  };

  const handleToggleAttack = (enabled: boolean) => {
    setIsAttackMode(enabled);
  };

  const handleEvaluationComplete = (result: EvaluationResult) => {
    setRecentEvaluations((prev) => [result, ...prev.slice(0, 4)]);
  };

  const items = [
    {
      title: "Apple MacBook Pro 16\" (M3 Max, 36GB)",
      price: 94500,
      category: "High-End Electronics",
      icon: Laptop,
    },
    {
      title: "Sony WH-1000XM5 Wireless Headphones",
      price: 24999,
      category: "Audio Gear",
      icon: Headphones,
    },
    {
      title: "Artisan Coffee Roasters Monthly Plan",
      price: 1499,
      category: "Subscription",
      icon: Coffee,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rzp-blue/15 text-rzp-cyan border border-rzp-blue/30">
                <Zap className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Payment Fraud Attack Simulator
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Simulate legitimate and adversarial checkout attempts against the live Riskor Sentinel Engine in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newTxnId = `pay_rzp_live_${Math.random().toString(36).substring(2, 11)}`;
                setPayload((prev) => ({ ...prev, transaction_id: newTxnId }));
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rzp-blue to-[#0070f3] hover:from-[#2983ea] hover:to-[#0060d0] text-white font-bold text-sm shadow-lg shadow-rzp-blue/30 transition-all flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Launch Razorpay Checkout</span>
            </button>
          </div>
        </div>

        {/* Master Attack Mode & Scenario Switcher */}
        <AttackToggle
          isAttackMode={isAttackMode}
          onToggleAttackMode={handleToggleAttack}
          selectedPreset={selectedPresetId}
          onSelectPreset={handleSelectPreset}
          onOpenCustomEditor={() => setIsCustomEditorOpen(!isCustomEditorOpen)}
          isCustomEditorOpen={isCustomEditorOpen}
        />

        {/* Optional Custom Parameter Matrix */}
        {isCustomEditorOpen && (
          <PayloadEditor payload={payload} onChange={setPayload} />
        )}

        {/* Mock Merchant Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Mock Store Cart & Telemetry */}
          <div className="lg:col-span-2 space-y-6">
            {/* Merchant Card */}
            <div className="p-6 rounded-2xl bg-surface/90 backdrop-blur-md border border-rzp-blue/20 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0c2340] border border-rzp-blue/30 flex items-center justify-center text-rzp-cyan">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">NexStore Electronics</h3>
                    <p className="text-xs text-slate-400">Checkout Cart • Merchant ID: merch_rzp_9921</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-rzp-blue/10 text-rzp-cyan border border-rzp-blue/20 font-medium">
                  Test Storefront
                </span>
              </div>

              {/* Product Selector */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Select Item to Purchase:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {items.map((it) => {
                    const Icon = it.icon;
                    const isSel = selectedItem.title === it.title;
                    return (
                      <button
                        key={it.title}
                        type="button"
                        onClick={() => {
                          setSelectedItem(it);
                          setPayload((prev) => ({ ...prev, amount: it.price }));
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          isSel
                            ? "bg-surface-raised border-rzp-blue shadow-md shadow-rzp-blue/20"
                            : "bg-surface border-white/5 hover:border-white/20"
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${isSel ? "text-rzp-cyan" : "text-slate-400"}`} />
                        <div className="font-bold text-xs text-white line-clamp-1">{it.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{it.category}</div>
                        <div className="text-sm font-extrabold text-rzp-cyan mt-2 font-mono">
                          ₹{it.price.toLocaleString()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="p-4 rounded-xl bg-surface-raised/50 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Cart Subtotal</span>
                  <span className="font-mono">₹{payload.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Express Fraud Shield (Riskor)</span>
                  <span className="text-emerald-400 font-semibold">FREE (Active)</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                  <span>Total Amount Due</span>
                  <span className="text-rzp-cyan font-mono">₹{payload.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  const newTxnId = `pay_rzp_live_${Math.random().toString(36).substring(2, 11)}`;
                  setPayload((prev) => ({ ...prev, transaction_id: newTxnId }));
                  setIsModalOpen(true);
                }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-rzp-blue via-[#1f7ae0] to-[#0070f3] hover:from-[#2983ea] hover:to-[#0060d0] text-white font-extrabold text-base shadow-xl shadow-rzp-blue/30 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Pay with Razorpay (₹{payload.amount.toLocaleString()})</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right 1 Col: Live Device & Threat Telemetry Card */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-surface/90 backdrop-blur-md border border-rzp-blue/20 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <ShieldCheck className="w-4 h-4 text-rzp-cyan" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Outbound Payment Telemetry
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Transaction ID</span>
                  <span className="font-mono text-white font-semibold">{payload.transaction_id}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Origin Location & IP</span>
                  <span className="text-white font-medium">
                    {payload.ip_location} ({payload.ip_address})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-surface-raised border border-white/5">
                    <span className="text-[10px] text-slate-400 block">1h Velocity</span>
                    <span className="font-bold text-white">{payload.velocity_1h} txns/hr</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-raised border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Geo Delta</span>
                    <span className="font-bold text-white">{payload.geo_distance_km} km</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-surface-raised border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Device Trust</span>
                    <span className="font-bold text-white">{(payload.device_trust_score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-raised border border-white/5">
                    <span className="text-[10px] text-slate-400 block">AVS Match</span>
                    <span className={`font-bold ${payload.billing_zip_match ? "text-emerald-400" : "text-rose-400"}`}>
                      {payload.billing_zip_match ? "Matched" : "Failed"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">User Agent</span>
                  <span className="text-[10px] text-slate-300 font-mono line-clamp-2">
                    {payload.user_agent}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0c2340]/60 border border-rzp-blue/20 text-[11px] text-slate-300 space-y-1">
                <div className="font-semibold text-rzp-cyan flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Dual-Tier Sentinel Routing
                </div>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  Transactions with ML Score &lt; 0.35 are passed instantly (~5ms). Scores ≥ 0.35 escalate to Gemini 2.5 Flash for forensic contextual investigation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Razorpay Modal */}
      <RazorpayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payload={payload}
        onEvaluationComplete={handleEvaluationComplete}
      />
    </div>
  );
}
