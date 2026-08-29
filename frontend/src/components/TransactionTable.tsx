"use client";

import React, { useState } from "react";
import { EvaluationResult } from "@/lib/types";
import { downloadDossierPdf } from "@/lib/api";
import {
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  ChevronDown,
  ChevronUp,
  FileDown,
  Cpu,
  Zap,
  Lock,
  Globe,
  Smartphone,
  CreditCard,
  AlertTriangle,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface TransactionTableProps {
  transactions: EvaluationResult[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  isLoading = false,
  onRefresh,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDownload = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDownloadingId(id);
    try {
      await downloadDossierPdf(id);
    } catch (err) {
      console.error("Dossier download failed:", err);
      alert("Failed to generate dossier PDF. Please check backend connection.");
    } finally {
      setDownloadingId(null);
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case "ALLOW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            ALLOW
          </span>
        );
      case "CHALLENGE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <ShieldQuestion className="w-3.5 h-3.5" />
            3DS CHALLENGE
          </span>
        );
      case "BLOCK":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            BLOCK
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return "text-rose-400 bg-rose-500";
    if (score >= 0.35) return "text-amber-400 bg-amber-500";
    return "text-emerald-400 bg-emerald-500";
  };

  return (
    <div className="rounded-2xl bg-surface/90 backdrop-blur-md border border-rzp-blue/20 overflow-hidden shadow-xl">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface-raised/40">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rzp-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rzp-blue"></span>
            </span>
            <h2 className="text-base font-bold text-white tracking-wide">
              Real-Time Security Audit Feed
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
              {transactions.length} Events Logged
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous decision stream with statistical anomaly metrics & Gemini Agent reasoning
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-[11px] text-slate-400 px-3 py-1 rounded-lg bg-surface border border-white/5">
            Auto-Gating: <span className="text-emerald-400 font-semibold">&lt;0.35 Bypass</span> | <span className="text-rzp-cyan font-semibold">≥0.35 Gemini Escalation</span>
          </div>
        </div>
      </div>

      {/* Transaction List / Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-raised/80 text-slate-400 uppercase tracking-wider font-semibold text-[11px] border-b border-white/5">
            <tr>
              <th className="py-3 px-4">Verdict</th>
              <th className="py-3 px-4">Transaction Details</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">ML Risk Score</th>
              <th className="py-3 px-4">Agent Pipeline</th>
              <th className="py-3 px-4">Latency</th>
              <th className="py-3 px-4 text-right">Forensic Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  No transaction events recorded yet. Trigger a payment in the simulator.
                </td>
              </tr>
            ) : (
              transactions.map((t) => {
                const isExpanded = expandedId === t.transaction_id;
                const scoreColor = getScoreColor(t.ml_risk_score);
                const isBlocked = t.verdict === "BLOCK";

                return (
                  <React.Fragment key={t.transaction_id}>
                    <tr
                      onClick={() => toggleExpand(t.transaction_id)}
                      className={`cursor-pointer transition-colors ${
                        isExpanded
                          ? "bg-surface-raised/90 border-l-4 border-l-rzp-blue"
                          : "hover:bg-surface-raised/50"
                      }`}
                    >
                      {/* Verdict */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {getVerdictBadge(t.verdict)}
                      </td>

                      {/* Transaction Details */}
                      <td className="py-4 px-4">
                        <div className="font-mono font-medium text-slate-200">
                          {t.transaction_id}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{t.transaction.cardholder_name || "Unknown"}</span>
                          <span>•</span>
                          <span>{t.transaction.card_network} ****{t.transaction.card_last4}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-100 text-sm">
                          ₹{t.transaction.amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {t.transaction.currency}
                        </div>
                      </td>

                      {/* ML Risk Score */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden border border-white/5">
                            <div
                              className={`h-full rounded-full ${scoreColor.split(" ")[1]}`}
                              style={{ width: `${Math.max(8, t.ml_risk_score * 100)}%` }}
                            />
                          </div>
                          <span className={`font-mono font-bold ${scoreColor.split(" ")[0]}`}>
                            {t.ml_risk_score.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {t.ml_breakdown?.risk_level || "EVALUATED"} RISK
                        </div>
                      </td>

                      {/* Agent Pipeline */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {t.escalated_to_agent ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-rzp-blue/15 text-rzp-cyan border border-rzp-blue/30 font-medium text-[11px]">
                            <Sparkles className="w-3 h-3 text-rzp-cyan" />
                            Gemini 2.5 Flash
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-[11px]">
                            <Zap className="w-3 h-3 text-emerald-400" />
                            ML Direct Bypass
                          </div>
                        )}
                      </td>

                      {/* Latency */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-300">
                        {t.latency_ms} ms
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isBlocked && (
                            <button
                              onClick={(e) => handleDownload(e, t.transaction_id)}
                              disabled={downloadingId === t.transaction_id}
                              title="Download Chargeback Defense Dossier (PDF)"
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all text-xs font-semibold disabled:opacity-50"
                            >
                              <FileDown className={`w-3.5 h-3.5 ${downloadingId === t.transaction_id ? "animate-bounce" : ""}`} />
                              <span className="hidden xl:inline">PDF Dossier</span>
                            </button>
                          )}

                          <button
                            onClick={() => toggleExpand(t.transaction_id)}
                            className="p-1.5 rounded-lg bg-surface hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Forensic Audit Trail */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="p-0 bg-surface-raised/40 border-b border-rzp-blue/20">
                          <div className="p-5 space-y-4">
                            {/* Forensic Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-rzp-cyan" />
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                  Forensic Agent Audit Trail & Decision Rationale
                                </h4>
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                Timestamp: {new Date(t.timestamp).toLocaleTimeString()} • Confidence: {Math.round(t.confidence_score * 100)}%
                              </div>
                            </div>

                            {/* Reasoning Box */}
                            <div className="p-4 rounded-xl bg-surface border border-rzp-blue/20 relative overflow-hidden">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-rzp-blue/15 text-rzp-cyan border border-rzp-blue/30 shrink-0">
                                  <Sparkles className="w-4 h-4" />
                                </div>
                                <div className="space-y-1.5">
                                  <div className="text-xs font-semibold text-rzp-cyan uppercase tracking-wider">
                                    Gemini Sentinel Rationale
                                  </div>
                                  <p className="text-sm text-slate-200 leading-relaxed font-sans italic">
                                    "{t.reasoning_audit_log}"
                                  </p>
                                  <div className="flex items-center gap-2 pt-1">
                                    <span className="text-xs text-slate-400 font-medium">Directive:</span>
                                    <span className="text-xs font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                                      {t.recommended_action}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Sub-Score Breakdown Meters */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                              <div className="p-3 rounded-lg bg-surface border border-white/5">
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                  <Zap className="w-3.5 h-3.5 text-rzp-cyan" />
                                  <span>Velocity ({t.transaction.velocity_1h}/hr)</span>
                                </div>
                                <div className="text-sm font-bold text-white mt-1">
                                  {t.ml_breakdown?.velocity_score ?? "-"}
                                </div>
                              </div>

                              <div className="p-3 rounded-lg bg-surface border border-white/5">
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                  <Globe className="w-3.5 h-3.5 text-rzp-blue" />
                                  <span>Geo-Delta ({t.transaction.geo_distance_km}km)</span>
                                </div>
                                <div className="text-sm font-bold text-white mt-1">
                                  {t.ml_breakdown?.geo_score ?? "-"}
                                </div>
                              </div>

                              <div className="p-3 rounded-lg bg-surface border border-white/5">
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                  <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                                  <span>Device Trust ({(t.transaction.device_trust_score * 100).toFixed(0)}%)</span>
                                </div>
                                <div className="text-sm font-bold text-white mt-1">
                                  {t.ml_breakdown?.device_score ?? "-"}
                                </div>
                              </div>

                              <div className="p-3 rounded-lg bg-surface border border-white/5">
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Amount Deviation</span>
                                </div>
                                <div className="text-sm font-bold text-white mt-1">
                                  {t.ml_breakdown?.amount_score ?? "-"}
                                </div>
                              </div>

                              <div className="p-3 rounded-lg bg-surface border border-white/5">
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>AVS / ZIP Match</span>
                                </div>
                                <div className="text-sm font-bold text-white mt-1">
                                  {t.transaction.billing_zip_match ? "Matched (0.05)" : "Failed (0.85)"}
                                </div>
                              </div>
                            </div>

                            {/* Digital Signature & Dossier Action */}
                            <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs border-t border-white/5">
                              <div className="font-mono text-[11px] text-slate-500 truncate max-w-xl">
                                HMAC Signature: <span className="text-slate-400">{t.digital_signature}</span>
                              </div>

                              {isBlocked && (
                                <button
                                  onClick={(e) => handleDownload(e, t.transaction_id)}
                                  disabled={downloadingId === t.transaction_id}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold shadow-lg shadow-rose-600/30 transition-all self-start sm:self-auto"
                                >
                                  <FileDown className="w-4 h-4" />
                                  <span>Download Chargeback Defense Dossier (PDF)</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
