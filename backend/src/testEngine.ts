import { MLEngine } from "./services/mlEngine.js";
import { GeminiEvaluator } from "./services/geminiEvaluator.js";
import { DossierGenerator } from "./services/dossierGenerator.js";
import { TransactionPayload, EvaluationResult } from "./types/fraud.js";

async function runTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING RISKOR TEST SUITE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // TEST 1: Clean Legitimate User
  const legitPayload: TransactionPayload = {
    transaction_id: "test_legit_001",
    amount: 1499,
    currency: "INR",
    velocity_1h: 1,
    geo_distance_km: 3,
    device_trust_score: 0.98,
    billing_zip_match: true,
    ip_location: "Bengaluru, India",
    card_network: "Visa",
    card_last4: "1234",
  };
  const legitScore = MLEngine.calculateRiskScore(legitPayload);
  assert(legitScore.ml_risk_score < 0.35, `Legit score should be < 0.35 (Got: ${legitScore.ml_risk_score})`);
  assert(!legitScore.escalate_to_agent, "Legit transaction should bypass LLM escalation");

  // TEST 2: High Velocity Bot Attack
  const botPayload: TransactionPayload = {
    transaction_id: "test_bot_002",
    amount: 89,
    currency: "INR",
    velocity_1h: 28,
    geo_distance_km: 7500,
    device_trust_score: 0.05,
    billing_zip_match: false,
    ip_location: "Bucharest, Romania",
    card_network: "Visa",
    card_last4: "8841",
    is_vpn_or_proxy: true,
  };
  const botScore = MLEngine.calculateRiskScore(botPayload);
  assert(botScore.ml_risk_score >= 0.80, `Bot attack score should be >= 0.80 (Got: ${botScore.ml_risk_score})`);
  assert(botScore.escalate_to_agent, "Bot attack must escalate to agent");

  // TEST 3: Impossible Travel
  const travelPayload: TransactionPayload = {
    transaction_id: "test_travel_003",
    amount: 89000,
    currency: "INR",
    velocity_1h: 5,
    geo_distance_km: 9200,
    device_trust_score: 0.15,
    billing_zip_match: false,
    ip_location: "Lagos, Nigeria",
    card_network: "Mastercard",
    card_last4: "9901",
    is_vpn_or_proxy: true,
  };
  const travelScore = MLEngine.calculateRiskScore(travelPayload);
  assert(travelScore.ml_risk_score >= 0.80, `Impossible travel score should be >= 0.80 (Got: ${travelScore.ml_risk_score})`);

  // TEST 4: Gemini Evaluator Response
  console.log("\nTesting Agentic Evaluator...");
  const evalResult = await GeminiEvaluator.evaluate(botPayload, botScore);
  assert(evalResult.verdict === "BLOCK", `Agent verdict for bot attack should be BLOCK (Got: ${evalResult.verdict})`);
  assert(evalResult.confidence_score >= 0.85, `Confidence score should be >= 0.85 (Got: ${evalResult.confidence_score})`);
  assert(evalResult.reasoning_audit_log.length > 20, "Reasoning audit log should be descriptive");
  assert(evalResult.recommended_action.length > 10, "Recommended action should be present");

  // TEST 5: PDF Dossier Generation
  console.log("\nTesting PDF Chargeback Defense Dossier Generation...");
  const fullEval: EvaluationResult = {
    transaction_id: botPayload.transaction_id,
    timestamp: new Date().toISOString(),
    ml_risk_score: botScore.ml_risk_score,
    ml_breakdown: botScore,
    escalated_to_agent: true,
    verdict: evalResult.verdict,
    confidence_score: evalResult.confidence_score,
    reasoning_audit_log: evalResult.reasoning_audit_log,
    recommended_action: evalResult.recommended_action,
    threat_category: evalResult.threat_category || "Card Testing",
    latency_ms: 350,
    digital_signature: "mock_signature_abc123456789",
    transaction: botPayload,
  };

  const pdfDoc = DossierGenerator.generateDossier(fullEval);
  const chunks: Buffer[] = [];
  pdfDoc.on("data", (chunk: Buffer) => chunks.push(chunk));

  await new Promise<void>((resolve) => {
    pdfDoc.on("end", () => {
      const buffer = Buffer.concat(chunks);
      assert(buffer.length > 3000, `PDF Dossier size should be > 3KB (Generated: ${buffer.length} bytes)`);
      resolve();
    });
  });

  console.log("==================================================");
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test runner failed:", e);
  process.exit(1);
});
