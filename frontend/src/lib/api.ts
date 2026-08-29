import { TransactionPayload, MLScoreBreakdown, EvaluationResult, DashboardStats } from "./types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export async function checkBackendHealth(): Promise<{
  status: string;
  system?: string;
  version?: string;
  gemini_model?: string;
  gemini_key_configured?: boolean;
  timestamp?: string;
}> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/status`, { cache: "no-store" });
    if (!res.ok) throw new Error("Status check failed");
    return await res.json();
  } catch (err) {
    return { status: "offline" };
  }
}

export async function scoreTransaction(payload: TransactionPayload): Promise<{
  success: boolean;
  ml_risk_score: number;
  risk_level: string;
  escalate_to_agent: boolean;
  sub_scores: any;
  calculation_latency_ms: number;
}> {
  const res = await fetch(`${BACKEND_URL}/api/v1/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to score transaction");
  }
  return await res.json();
}

export async function evaluateTransaction(payload: TransactionPayload): Promise<EvaluationResult> {
  const res = await fetch(`${BACKEND_URL}/api/v1/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Evaluation failed");
  }
  const json = await res.json();
  return json.data;
}

export async function fetchTransactions(): Promise<EvaluationResult[]> {
  const res = await fetch(`${BACKEND_URL}/api/v1/transactions`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch transactions");
  const json = await res.json();
  return json.data;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${BACKEND_URL}/api/v1/stats`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  const json = await res.json();
  return json.data;
}

export function getDossierDownloadUrl(transactionId: string): string {
  return `${BACKEND_URL}/api/v1/dossier/${transactionId}`;
}

export async function downloadDossierPdf(transactionId: string): Promise<void> {
  const url = getDossierDownloadUrl(transactionId);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Dossier generation failed");
  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = `Chargeback_Defense_Dossier_${transactionId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

export async function resetDemoStore(): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/v1/reset`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to reset store");
}
