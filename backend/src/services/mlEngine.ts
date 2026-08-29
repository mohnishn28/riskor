import { TransactionPayload, MLScoreBreakdown } from "../types/fraud.js";

/**
 * Statistical Anomaly & Risk Scoring ML Engine for Payment Defense
 * Uses multi-factor anomaly scoring, statistical z-scores, and non-linear fraud interaction trees.
 */
export class MLEngine {
  // Baseline parameters for statistical z-score normalization
  private static readonly AMOUNT_MEAN = 3500; // Mean INR transaction amount
  private static readonly AMOUNT_STD = 4200;  // Standard deviation

  /**
   * Calculate deterministic multi-factor risk score
   */
  public static calculateRiskScore(payload: TransactionPayload): MLScoreBreakdown {
    const startTime = performance.now();

    // 1. Velocity Anomaly Score (0.0 to 1.0)
    // 1 txn/hr -> ~0.05, 3-5 txns/hr -> ~0.45, 10+ txns/hr -> ~0.95
    let velocityScore = 0.05;
    if (payload.velocity_1h <= 1) {
      velocityScore = 0.05;
    } else if (payload.velocity_1h <= 3) {
      velocityScore = 0.25;
    } else if (payload.velocity_1h <= 7) {
      velocityScore = 0.60;
    } else if (payload.velocity_1h <= 15) {
      velocityScore = 0.85;
    } else {
      velocityScore = 0.98; // Extreme bot velocity
    }

    // 2. Geo-Distance Anomaly Score (0.0 to 1.0)
    // Distance between registered billing home/card and current transaction IP
    let geoScore = 0.05;
    if (payload.geo_distance_km < 50) {
      geoScore = 0.05; // Local vicinity
    } else if (payload.geo_distance_km < 350) {
      geoScore = 0.20; // Regional travel
    } else if (payload.geo_distance_km < 1200) {
      geoScore = 0.45; // Domestic flight distance
    } else if (payload.geo_distance_km < 4000) {
      geoScore = 0.75; // Continental jump
    } else {
      geoScore = 0.95; // Impossible travel / overseas proxy
    }

    // 3. Device Trust & Integrity Score (Inverted: low trust = high risk score)
    const rawDeviceRisk = 1.0 - Math.min(1, Math.max(0, payload.device_trust_score));
    let deviceScore = rawDeviceRisk;
    if (payload.is_vpn_or_proxy) {
      deviceScore = Math.min(1.0, deviceScore + 0.25);
    }

    // 4. Amount Anomaly Score (Z-Score + micro-transaction bot detection)
    let amountScore = 0.1;
    if (payload.amount < 100 && payload.velocity_1h > 4) {
      // Micro-amount card testing attack signature
      amountScore = 0.88;
    } else {
      const zScore = (payload.amount - MLEngine.AMOUNT_MEAN) / MLEngine.AMOUNT_STD;
      if (zScore < 0) {
        amountScore = 0.08;
      } else if (zScore < 1.0) {
        amountScore = 0.20;
      } else if (zScore < 3.0) {
        amountScore = 0.55;
      } else if (zScore < 8.0) {
        amountScore = 0.80; // High value luxury purchase
      } else {
        amountScore = 0.95; // Extreme whale transaction
      }
    }

    // 5. Billing ZIP & AVS Match Score
    const avsScore = payload.billing_zip_match ? 0.05 : 0.85;

    // Linear Weighted Aggregation
    const weights = {
      velocity: 0.28,
      geo: 0.24,
      device: 0.22,
      amount: 0.14,
      avs: 0.12,
    };

    let compositeScore =
      velocityScore * weights.velocity +
      geoScore * weights.geo +
      deviceScore * weights.device +
      amountScore * weights.amount +
      avsScore * weights.avs;

    // Non-linear Fraud Synergies & Attack Signatures:
    // Pattern A: High velocity + Large distance + Low device trust -> Critical Fraud (>0.85)
    if (payload.velocity_1h >= 6 && payload.geo_distance_km >= 2500 && payload.device_trust_score <= 0.35) {
      compositeScore = Math.max(compositeScore, 0.88);
    }

    // Pattern B: Extreme Card Testing (velocity > 12, untrusted device)
    if (payload.velocity_1h >= 12 && payload.device_trust_score <= 0.4) {
      compositeScore = Math.max(compositeScore, 0.92);
    }

    // Pattern C: Impossible Geo-hop (> 6000km) + AVS Mismatch
    if (payload.geo_distance_km > 6000 && !payload.billing_zip_match) {
      compositeScore = Math.max(compositeScore, 0.84);
    }

    // Pattern D: Clean User Whitelist (Low velocity, close geo, high trust, zip match)
    if (payload.velocity_1h <= 2 && payload.geo_distance_km <= 50 && payload.device_trust_score >= 0.85 && payload.billing_zip_match) {
      compositeScore = Math.min(compositeScore, 0.18);
    }

    // Normalize to 2 decimal precision [0.00 - 1.00]
    const ml_risk_score = Number(Math.min(1.0, Math.max(0.0, compositeScore)).toFixed(3));

    // Determine Risk Level
    let risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
    if (ml_risk_score >= 0.80) {
      risk_level = "CRITICAL";
    } else if (ml_risk_score >= 0.60) {
      risk_level = "HIGH";
    } else if (ml_risk_score >= 0.35) {
      risk_level = "MEDIUM";
    } else {
      risk_level = "LOW";
    }

    const endTime = performance.now();
    const calculation_latency_ms = Number((endTime - startTime).toFixed(2));

    return {
      velocity_score: Number(velocityScore.toFixed(3)),
      geo_score: Number(geoScore.toFixed(3)),
      device_score: Number(deviceScore.toFixed(3)),
      amount_score: Number(amountScore.toFixed(3)),
      avs_score: Number(avsScore.toFixed(3)),
      ml_risk_score,
      risk_level,
      escalate_to_agent: ml_risk_score >= 0.35,
      calculation_latency_ms,
    };
  }
}
