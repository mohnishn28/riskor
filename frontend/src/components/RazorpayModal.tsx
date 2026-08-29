"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { TransactionPayload, EvaluationResult } from "@/lib/types";
import { evaluateTransaction, downloadDossierPdf } from "@/lib/api";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  CreditCard,
  QrCode,
  Building2,
  Lock,
  Sparkles,
  Zap,
  CheckCircle2,
  FileDown,
  ArrowRight,
  RefreshCw,
  X,
  Smartphone,
} from "lucide-react";

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: TransactionPayload;
  onEvaluationComplete: (result: EvaluationResult) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  payload,
  onEvaluationComplete,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"checkout" | "evaluating" | "challenge_otp" | "approved" | "blocked">("checkout");
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [isDownloadingDossier, setIsDownloadingDossier] = useState(false);

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    setStep("evaluating");

    try {
      // Execute live backend evaluation
      const result = await evaluateTransaction(payload);
      setEvaluationResult(result);
      onEvaluationComplete(result);

      setTimeout(() => {
        if (result.verdict === "ALLOW") {
          setStep("approved");
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
            });
          } catch (e) {}
        } else if (result.verdict === "CHALLENGE") {
          setStep("challenge_otp");
        } else {
          setStep("blocked");
        }
        setIsProcessing(false);
      }, 700);
    } catch (err: any) {
      console.error("Evaluation error:", err);
      alert("Error contacting fraud backend: " + (err.message || "Unknown error"));
      setIsProcessing(false);
      setStep("checkout");
    }
  };

  const handleVerifyOtp = () => {
    if (otpValue.length === 6 || otpValue === "482910") {
      setStep("approved");
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    } else {
      setOtpError(true);
    }
  };

  const handleDownloadDossier = async () => {
    if (!evaluationResult) return;
    setIsDownloadingDossier(true);
    try {
      await downloadDossierPdf(evaluationResult.transaction_id);
    } catch (e) {
      alert("Failed to download dossier");
    } finally {
      setIsDownloadingDossier(false);
    }
  };

  const resetModal = () => {
    setStep("checkout");
    setEvaluationResult(null);
    setOtpValue("");
    setOtpError(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0c192c] border border-rzp-blue/30 shadow-2xl shadow-rzp-blue/20 overflow-hidden text-slate-100 font-sans">
        {/* Top Header - Razorpay Dark Blue Style */}
        <div className="bg-[#072654] px-6 py-4 border-b border-rzp-blue/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rzp-blue/20 border border-rzp-blue/40 text-rzp-cyan">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>{payload.merchant_name || "NexStore Electronics"}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                  Verified
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-mono">
                Order #{payload.transaction_id.slice(-8).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-300 uppercase tracking-wider">Amount Due</div>
              <div className="text-base font-extrabold text-white font-mono">
                ₹{payload.amount.toLocaleString()}
              </div>
            </div>
            <button
              onClick={resetModal}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1: CHECKOUT VIEW */}
          {step === "checkout" && (
            <div className="space-y-5">
              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-surface-raised/80 border border-white/5 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
                    paymentMethod === "card"
                      ? "bg-rzp-blue text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
                    paymentMethod === "upi"
                      ? "bg-rzp-blue text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
                    paymentMethod === "netbanking"
                      ? "bg-rzp-blue text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Netbanking
                </button>
              </div>

              {/* Card Form Mockup */}
              <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Card Number
                  </label>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-raised border border-white/10 font-mono text-slate-100">
                    <span>
                      {payload.card_network === "Mastercard" ? "5412" : "4312"} •••• •••• {payload.card_last4}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rzp-blue/20 text-rzp-cyan">
                      {payload.card_network}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                      Cardholder Name
                    </label>
                    <div className="p-2.5 rounded-lg bg-surface-raised border border-white/10 font-medium text-slate-200 truncate">
                      {payload.cardholder_name || "Anita Verma"}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                      Expiry & CVV
                    </label>
                    <div className="p-2.5 rounded-lg bg-surface-raised border border-white/10 font-mono text-slate-200">
                      08/29 • •••
                    </div>
                  </div>
                </div>

                {/* Telemetry Indicator */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    256-bit TLS Encrypted
                  </span>
                  <span>Origin: {payload.ip_location || "Mumbai, India"}</span>
                </div>
              </div>

              {/* Submit Pay Button */}
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rzp-blue to-[#0070f3] hover:from-[#2983ea] hover:to-[#0060d0] text-white font-bold text-sm shadow-lg shadow-rzp-blue/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <span>Pay ₹{payload.amount.toLocaleString()}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rzp-cyan" />
                <span>Protected in real-time by <strong>Riskor Autonomous Sentinel</strong></span>
              </div>
            </div>
          )}

          {/* STEP 2: EVALUATING STATE */}
          {step === "evaluating" && (
            <div className="py-10 text-center space-y-4 animate-in fade-in">
              <div className="relative mx-auto w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-rzp-blue/20 animate-ping" />
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-surface-raised border-2 border-rzp-blue shadow-lg shadow-rzp-blue/30">
                  <RefreshCw className="w-7 h-7 text-rzp-cyan animate-spin" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  Executing Riskor Sentinel Defense...
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Calculating multi-factor anomaly z-scores and evaluating against Gemini 2.5 Flash agent reasoning pipeline.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rzp-blue/10 border border-rzp-blue/20 text-xs text-rzp-cyan font-mono">
                <Zap className="w-3.5 h-3.5 animate-bounce" />
                <span>Real-Time Gating Pipeline Active</span>
              </div>
            </div>
          )}

          {/* STEP 3: CHALLENGE / 3DS STEP-UP OTP */}
          {step === "challenge_otp" && evaluationResult && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <ShieldQuestion className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-300 text-sm">
                    3DS Step-Up Authentication Required
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {evaluationResult.reasoning_audit_log}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-surface border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Enter 6-digit SMS OTP</span>
                  <span className="text-[11px] text-slate-400 font-mono">Sent to +91 98*** 12345</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="••••••"
                    value={otpValue}
                    onChange={(e) => {
                      setOtpValue(e.target.value);
                      setOtpError(false);
                    }}
                    className="w-full text-center tracking-widest text-lg font-mono font-bold py-2.5 rounded-lg bg-surface-raised border border-white/15 focus:border-amber-400 focus:outline-none text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setOtpValue("482910");
                      setOtpError(false);
                    }}
                    className="px-3 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 text-xs font-semibold whitespace-nowrap transition-colors"
                  >
                    ⚡ Autofill (482910)
                  </button>
                </div>

                {otpError && (
                  <div className="text-[11px] text-rose-400">
                    Please enter the 6-digit code or click Autofill to verify.
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
              >
                Verify & Authorize Payment
              </button>
            </div>
          )}

          {/* STEP 4: APPROVED / ALLOW VIEW */}
          {step === "approved" && (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-white">
                  Payment Authorized Successfully
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                  Transaction cleared by Riskor Sentinel. Statistical anomaly score was within safe operational parameters.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-emerald-500/20 font-mono text-xs text-slate-300 space-y-1 text-left max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-400">Txn ID:</span>
                  <span className="text-white font-bold">{payload.transaction_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount:</span>
                  <span className="text-emerald-400 font-bold">₹{payload.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verdict:</span>
                  <span className="text-emerald-400 font-bold">ALLOW (Clean)</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetModal}
                  className="w-full py-2.5 rounded-xl bg-surface-raised hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-colors"
                >
                  Done / Close
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: BLOCKED BY SENTINEL VIEW */}
          {step === "blocked" && evaluationResult && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-3">
                <ShieldAlert className="w-7 h-7 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <div className="font-extrabold text-rose-300 text-sm flex items-center gap-2">
                    <span>TRANSACTION BLOCKED BY RISKOR AI</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500 text-white">
                      {evaluationResult.threat_category || "FRAUD"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed italic">
                    "{evaluationResult.reasoning_audit_log}"
                  </p>
                </div>
              </div>

              {/* Forensic Details */}
              <div className="p-3.5 rounded-xl bg-surface border border-white/5 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>ML Risk Score:</span>
                  <span className="text-rose-400 font-bold">{evaluationResult.ml_risk_score} / 1.00</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>AI Agent Confidence:</span>
                  <span className="text-white font-bold">{Math.round(evaluationResult.confidence_score * 100)}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Directive:</span>
                  <span className="text-rose-300 font-bold">{evaluationResult.recommended_action}</span>
                </div>
              </div>

              {/* Download Dossier Action */}
              <button
                type="button"
                onClick={handleDownloadDossier}
                disabled={isDownloadingDossier}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
              >
                <FileDown className={`w-4 h-4 ${isDownloadingDossier ? "animate-bounce" : ""}`} />
                <span>{isDownloadingDossier ? "Generating PDF..." : "Download Chargeback Defense Dossier (PDF)"}</span>
              </button>

              <button
                type="button"
                onClick={resetModal}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-white transition-colors"
              >
                Dismiss & Back to Simulator
              </button>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="bg-[#07172c] px-6 py-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Razorpay Payment Gateway</span>
          </div>
          <span>Riskor Buildathon 2026</span>
        </div>
      </div>
    </div>
  );
};
