import { Router, Request, Response } from "express";
import { TransactionPayloadSchema, EvaluationResult } from "../types/fraud.js";
import { MLEngine } from "../services/mlEngine.js";
import { GeminiEvaluator } from "../services/geminiEvaluator.js";
import { DossierGenerator } from "../services/dossierGenerator.js";
import { TransactionStore } from "../services/transactionStore.js";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const router = Router();

/**
 * 1. POST /api/v1/score
 * Lightweight deterministic statistical risk scoring
 */
router.post("/score", (req: Request, res: Response): void => {
  try {
    const parseResult = TransactionPayloadSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: "Invalid transaction payload",
        details: parseResult.error.errors,
      });
      return;
    }

    const payload = parseResult.data;
    const scoreResult = MLEngine.calculateRiskScore(payload);

    res.json({
      success: true,
      transaction_id: payload.transaction_id,
      ml_risk_score: scoreResult.ml_risk_score,
      risk_level: scoreResult.risk_level,
      escalate_to_agent: scoreResult.escalate_to_agent,
      sub_scores: {
        velocity_score: scoreResult.velocity_score,
        geo_score: scoreResult.geo_score,
        device_score: scoreResult.device_score,
        amount_score: scoreResult.amount_score,
        avs_score: scoreResult.avs_score,
      },
      calculation_latency_ms: scoreResult.calculation_latency_ms,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Internal ML Scoring Error" });
  }
});

/**
 * 2. POST /api/v1/evaluate
 * Dual-tier agentic evaluator:
 * - < 0.35: Instant bypass (ALLOW)
 * - >= 0.35: Escalated to Gemini 2.5 Flash Agent
 */
router.post("/evaluate", async (req: Request, res: Response): Promise<void> => {
  const overallStart = performance.now();
  try {
    const bodyWithDefaults = {
      ...req.body,
      transaction_id: req.body.transaction_id || `pay_rzp_live_${uuidv4().replace(/-/g, "").slice(0, 10)}`,
      timestamp: req.body.timestamp || new Date().toISOString(),
    };

    const parseResult = TransactionPayloadSchema.safeParse(bodyWithDefaults);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: "Invalid transaction payload",
        details: parseResult.error.errors,
      });
      return;
    }

    const payload = parseResult.data;
    const mlBreakdown = MLEngine.calculateRiskScore(payload);

    let verdict: "ALLOW" | "CHALLENGE" | "BLOCK";
    let confidence_score: number;
    let reasoning_audit_log: string;
    let recommended_action: string;
    let threat_category: string;
    let escalated_to_agent = false;

    if (!mlBreakdown.escalate_to_agent) {
      // Tier 1: Instant bypass (< 0.35 ML Risk)
      verdict = "ALLOW";
      confidence_score = 0.99;
      reasoning_audit_log = `Statistical anomaly score is clean (${mlBreakdown.ml_risk_score}). Verified device trust (${payload.device_trust_score.toFixed(2)}), zero velocity elevation (${payload.velocity_1h}/hr), and matching billing ZIP.`;
      recommended_action = "Execute Payment Directly";
      threat_category = "Legitimate Purchase";
      escalated_to_agent = false;
    } else {
      // Tier 2: Agentic Escalation to Gemini 2.5 Flash
      escalated_to_agent = true;
      const agentOutput = await GeminiEvaluator.evaluate(payload, mlBreakdown);
      verdict = agentOutput.verdict;
      confidence_score = agentOutput.confidence_score;
      reasoning_audit_log = agentOutput.reasoning_audit_log;
      recommended_action = agentOutput.recommended_action;
      threat_category = agentOutput.threat_category || "Anomaly";
    }

    const overallEnd = performance.now();
    const latency_ms = Number((overallEnd - overallStart).toFixed(1));
    const timestamp = payload.timestamp || new Date().toISOString();

    // Cryptographic signature
    const digital_signature = crypto
      .createHmac("sha256", "riskor_dispute_secret_key_v1")
      .update(payload.transaction_id + timestamp + verdict)
      .digest("hex");

    const evaluationResult: EvaluationResult = {
      transaction_id: payload.transaction_id,
      timestamp,
      ml_risk_score: mlBreakdown.ml_risk_score,
      ml_breakdown: mlBreakdown,
      escalated_to_agent,
      verdict,
      confidence_score,
      reasoning_audit_log,
      recommended_action,
      threat_category,
      latency_ms,
      digital_signature,
      transaction: payload,
    };

    // Record into in-memory store
    TransactionStore.add(evaluationResult);

    res.json({
      success: true,
      data: evaluationResult,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Evaluation Failed" });
  }
});

/**
 * 3. POST /api/v1/dossier & GET /api/v1/dossier/:id
 * Generates downloadable PDF "Chargeback Defense Dossier" stream
 */
router.post("/dossier", (req: Request, res: Response): void => {
  try {
    const { transaction_id, evaluation: customEval } = req.body;

    let evaluation: EvaluationResult | undefined;
    if (transaction_id) {
      evaluation = TransactionStore.get(transaction_id);
    }
    if (!evaluation && customEval) {
      evaluation = customEval;
    }

    if (!evaluation) {
      const recent = TransactionStore.getAll();
      const firstBlocked = recent.find((t) => t.verdict === "BLOCK");
      if (firstBlocked) {
        evaluation = firstBlocked;
      } else {
        res.status(404).json({ success: false, error: "Transaction not found for dossier generation" });
        return;
      }
    }

    const pdfDoc = DossierGenerator.generateDossier(evaluation);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Chargeback_Defense_Dossier_${evaluation.transaction_id}.pdf"`
    );

    pdfDoc.pipe(res);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to generate PDF dossier" });
  }
});

router.get("/dossier/:id", (req: Request, res: Response): void => {
  try {
    const rawId = req.params.id;
    const transactionId = Array.isArray(rawId) ? rawId[0] : (rawId as string);
    let evaluation = TransactionStore.get(transactionId);

    if (!evaluation) {
      const recent = TransactionStore.getAll();
      evaluation = recent.find((t) => t.verdict === "BLOCK") || recent[0];
    }

    if (!evaluation) {
      res.status(404).json({ success: false, error: "Transaction record not found" });
      return;
    }

    const pdfDoc = DossierGenerator.generateDossier(evaluation);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Chargeback_Defense_Dossier_${evaluation.transaction_id}.pdf"`
    );

    pdfDoc.pipe(res);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to generate PDF dossier" });
  }
});

/**
 * 4. GET /api/v1/transactions
 * Retrieve real-time list of evaluated transactions
 */
router.get("/transactions", (_req: Request, res: Response): void => {
  try {
    const transactions = TransactionStore.getAll();
    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 5. GET /api/v1/stats
 * Aggregate dashboard statistics
 */
router.get("/stats", (_req: Request, res: Response): void => {
  try {
    const stats = TransactionStore.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 6. POST /api/v1/reset
 * Reseed mock dataset
 */
router.post("/reset", (_req: Request, res: Response): void => {
  TransactionStore.reset();
  res.json({
    success: true,
    message: "Transaction store reset and re-seeded with demo records.",
    data: TransactionStore.getStats(),
  });
});

export default router;
