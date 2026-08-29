import { z } from "zod";

export const TransactionPayloadSchema = z.object({
  transaction_id: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default("INR"),
  velocity_1h: z.number().nonnegative(),
  geo_distance_km: z.number().nonnegative(),
  device_trust_score: z.number().min(0).max(1),
  billing_zip_match: z.boolean(),
  ip_address: z.string().optional().default("192.168.1.1"),
  ip_location: z.string().optional().default("Mumbai, India"),
  cardholder_name: z.string().optional().default("Rajesh Sharma"),
  card_last4: z.string().optional().default("4312"),
  card_network: z.string().optional().default("Visa"),
  merchant_id: z.string().optional().default("merch_rzp_9921"),
  merchant_name: z.string().optional().default("NexStore Electronics"),
  user_agent: z.string().optional().default("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"),
  is_vpn_or_proxy: z.boolean().optional().default(false),
  timestamp: z.string().optional(),
});

export type TransactionPayload = {
  transaction_id: string;
  amount: number;
  currency?: string;
  velocity_1h: number;
  geo_distance_km: number;
  device_trust_score: number;
  billing_zip_match: boolean;
  ip_address?: string;
  ip_location?: string;
  cardholder_name?: string;
  card_last4?: string;
  card_network?: string;
  merchant_id?: string;
  merchant_name?: string;
  user_agent?: string;
  is_vpn_or_proxy?: boolean;
  timestamp?: string;
};

export interface MLScoreBreakdown {
  velocity_score: number;
  geo_score: number;
  device_score: number;
  amount_score: number;
  avs_score: number;
  ml_risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  escalate_to_agent: boolean;
  calculation_latency_ms: number;
}

export type Verdict = "ALLOW" | "CHALLENGE" | "BLOCK";

export interface GeminiAgentOutput {
  verdict: Verdict;
  confidence_score: number;
  reasoning_audit_log: string;
  recommended_action: string;
  threat_category?: "Card Testing" | "Account Takeover" | "Impossible Travel" | "Stolen Card / AVS Mismatch" | "Velocity Spurt" | "Legitimate Purchase" | "High Value Anomaly";
}

export interface EvaluationResult {
  transaction_id: string;
  timestamp: string;
  ml_risk_score: number;
  ml_breakdown: MLScoreBreakdown;
  escalated_to_agent: boolean;
  verdict: Verdict;
  confidence_score: number;
  reasoning_audit_log: string;
  recommended_action: string;
  threat_category: string;
  latency_ms: number;
  digital_signature: string;
  transaction: TransactionPayload;
}

export interface DashboardStats {
  total_volume_inr: number;
  total_transactions: number;
  total_fraud_blocked_inr: number;
  total_blocked_count: number;
  total_challenged_count: number;
  total_allowed_count: number;
  false_positive_rate_percent: number;
  avg_agent_latency_ms: number;
  chargebacks_defended: number;
}
