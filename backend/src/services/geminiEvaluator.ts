import { GoogleGenAI } from "@google/genai";
import { TransactionPayload, MLScoreBreakdown, GeminiAgentOutput } from "../types/fraud.js";

/**
 * Gemini Agentic Fraud Evaluator
 * Leverages Google Gen AI SDK (@google/genai) with Gemini 2.5 Flash for deep contextual payment fraud reasoning.
 */
export class GeminiEvaluator {
  private static aiClient: GoogleGenAI | null = null;

  private static getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
      return null;
    }
    if (!GeminiEvaluator.aiClient) {
      GeminiEvaluator.aiClient = new GoogleGenAI({ apiKey });
    }
    return GeminiEvaluator.aiClient;
  }

  /**
   * Evaluate transaction using Gemini 2.5 Flash with structured JSON output
   */
  public static async evaluate(
    payload: TransactionPayload,
    mlBreakdown: MLScoreBreakdown
  ): Promise<GeminiAgentOutput> {
    const client = GeminiEvaluator.getClient();
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const prompt = `
You are "Riskor Sentinel", the Chief Risk & Autonomous Fraud Prevention AI for Razorpay.
Analyze the following elevated-risk payment transaction and determine the definitive security verdict.

=== TRANSACTION METADATA ===
- Transaction ID: ${payload.transaction_id}
- Amount: ₹${payload.amount.toLocaleString()} ${payload.currency}
- Velocity (1-Hour): ${payload.velocity_1h} transactions/hr
- Geographical Discrepancy: ${payload.geo_distance_km} km between billing address and IP geolocation
- Device Trust Score: ${payload.device_trust_score.toFixed(2)} / 1.00 (Lower means emulator/bot/proxy)
- Billing ZIP / AVS Match: ${payload.billing_zip_match ? "MATCHED (VALID)" : "MISMATCH (INVALID)"}
- IP Geolocation: ${payload.ip_location || "Unknown"} (IP: ${payload.ip_address})
- Card Network & Last 4: ${payload.card_network} **** ${payload.card_last4}
- VPN / Proxy Flag: ${payload.is_vpn_or_proxy ? "DETECTED (High Risk)" : "CLEAN"}
- User Agent: ${payload.user_agent}

=== ML ENGINE FORENSIC SUB-SCORES ===
- Overall ML Risk Score: ${mlBreakdown.ml_risk_score} (0.0 to 1.0)
- Velocity Anomaly Sub-Score: ${mlBreakdown.velocity_score}
- Geo-Distance Sub-Score: ${mlBreakdown.geo_score}
- Device Anomaly Sub-Score: ${mlBreakdown.device_score}
- Amount Anomaly Sub-Score: ${mlBreakdown.amount_score}
- AVS Mismatch Sub-Score: ${mlBreakdown.avs_score}

=== DECISION GUIDELINES ===
1. "BLOCK": Unmistakable fraud signals (e.g. impossible travel >3000km + low trust <0.3, rapid bot testing >10 velocity, high amount + multiple red flags).
2. "CHALLENGE": Moderate/ambiguous risk where user might be genuine (e.g. vacation travel 300-1500km, slightly higher velocity, first-time large purchase with verified device). Step-up 3DS OTP recommended.
3. "ALLOW": Legitimate user anomaly (e.g. known merchant, high trust device, clean AVS with justifiable context).

=== REQUIRED OUTPUT FORMAT ===
Provide your assessment strictly as a JSON object with:
- "verdict": "ALLOW" | "CHALLENGE" | "BLOCK"
- "confidence_score": float between 0.50 and 0.99
- "reasoning_audit_log": 1-2 sentence concise forensic justification explaining WHY (e.g., "High velocity attack (18 txns/hr) detected from unregistered device in Bucharest with AVS mismatch.").
- "recommended_action": clear actionable security directive (e.g., "Trigger 3DS OTP Step-Up Authentication", "Reject Transaction & Blacklist Device Fingerprint", "Hold Payout for 24h Review").
- "threat_category": "Card Testing" | "Account Takeover" | "Impossible Travel" | "Stolen Card / AVS Mismatch" | "Velocity Spurt" | "Legitimate Purchase" | "High Value Anomaly"
`;

    if (client) {
      try {
        const response = await client.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim()) as GeminiAgentOutput;
          if (parsed.verdict && parsed.confidence_score && parsed.reasoning_audit_log && parsed.recommended_action) {
            return {
              verdict: parsed.verdict,
              confidence_score: Number(parsed.confidence_score.toFixed(2)),
              reasoning_audit_log: parsed.reasoning_audit_log,
              recommended_action: parsed.recommended_action,
              threat_category: parsed.threat_category || "Velocity Spurt",
            };
          }
        }
      } catch (err) {
        console.warn("Gemini API call encountered error, engaging high-fidelity heuristic fallback:", err);
      }
    }

    // High-Fidelity Forensic Fallback Evaluator (ensures demo stability if API key is not configured)
    return GeminiEvaluator.fallbackEvaluation(payload, mlBreakdown);
  }

  /**
   * Resilient heuristic fallback that mirrors Gemini's forensic analytical structure
   */
  private static fallbackEvaluation(payload: TransactionPayload, ml: MLScoreBreakdown): GeminiAgentOutput {
    // 1. Extreme velocity / Card testing
    if (payload.velocity_1h >= 10 || (payload.velocity_1h >= 6 && payload.device_trust_score < 0.3)) {
      return {
        verdict: "BLOCK",
        confidence_score: 0.96,
        reasoning_audit_log: `High-frequency velocity burst (${payload.velocity_1h} attempts/hr) originating from an untrusted device fingerprint in ${payload.ip_location || "remote IP"}. Indicates automated bot testing syndicate.`,
        recommended_action: "Reject Transaction Immediately & Blacklist Device Fingerprint",
        threat_category: "Card Testing",
      };
    }

    // 2. Impossible Travel
    if (payload.geo_distance_km >= 3500) {
      if (!payload.billing_zip_match || payload.device_trust_score < 0.4) {
        return {
          verdict: "BLOCK",
          confidence_score: 0.94,
          reasoning_audit_log: `Impossible travel anomaly detected: IP located in ${payload.ip_location || "distant region"} (${payload.geo_distance_km} km from card billing origin) combined with AVS mismatch.`,
          recommended_action: "Block Transaction & Flag Card for Compromise Notification",
          threat_category: "Impossible Travel",
        };
      }
      return {
        verdict: "CHALLENGE",
        confidence_score: 0.86,
        reasoning_audit_log: `Geographic distance (${payload.geo_distance_km} km) exceeds baseline; verified device trust suggests user might be traveling internationally.`,
        recommended_action: "Trigger 3DS OTP Step-Up Challenge via SMS/App",
        threat_category: "Impossible Travel",
      };
    }

    // 3. High Value Anomaly
    if (payload.amount > 50000) {
      if (payload.device_trust_score > 0.8 && payload.billing_zip_match) {
        return {
          verdict: "CHALLENGE",
          confidence_score: 0.88,
          reasoning_audit_log: `High-value purchase of ₹${payload.amount.toLocaleString()} deviates from standard average, but strong device trust (${payload.device_trust_score.toFixed(2)}) indicates authentic cardholder intent.`,
          recommended_action: "Require Biometric or 3DS OTP Step-Up Authorization",
          threat_category: "High Value Anomaly",
        };
      }
      return {
        verdict: "BLOCK",
        confidence_score: 0.91,
        reasoning_audit_log: `High-value anomalous charge (₹${payload.amount.toLocaleString()}) with sub-optimal device trust (${payload.device_trust_score.toFixed(2)}) and AVS mismatch.`,
        recommended_action: "Freeze Transaction & Require Manual Merchant Approval",
        threat_category: "Account Takeover",
      };
    }

    // 4. Moderate Risk Default
    if (ml.ml_risk_score >= 0.65) {
      return {
        verdict: "BLOCK",
        confidence_score: 0.89,
        reasoning_audit_log: `Multiple compounded risk factors (Device Risk: ${(1 - payload.device_trust_score).toFixed(2)}, Geo Delta: ${payload.geo_distance_km}km, Velocity: ${payload.velocity_1h}/hr) exceed safety threshold.`,
        recommended_action: "Decline Payment and Log Security Telemetry",
        threat_category: "Stolen Card / AVS Mismatch",
      };
    }

    return {
      verdict: "CHALLENGE",
      confidence_score: 0.82,
      reasoning_audit_log: `Moderate risk score (${ml.ml_risk_score}) detected. Transaction exceeds automated bypass thresholds but requires identity verification.`,
      recommended_action: "Execute 3DS Step-Up Verification",
      threat_category: "Velocity Spurt",
    };
  }
}
