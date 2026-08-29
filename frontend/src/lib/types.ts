export type Verdict = "ALLOW" | "CHALLENGE" | "BLOCK";

export interface TransactionPayload {
  transaction_id: string;
  amount: number;
  currency: string;
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
}

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

export interface AttackPreset {
  id: string;
  name: string;
  description: string;
  tag: string;
  tagColor: string;
  payload: Partial<TransactionPayload>;
}
