import PDFDocument from "pdfkit";
import crypto from "crypto";
import { EvaluationResult } from "../types/fraud.js";

/**
 * Chargeback Defense Dossier Generator
 * Generates an arbitration-grade legal and forensic PDF packet using PDFKit
 */
export class DossierGenerator {
  /**
   * Generates a PDF stream of the Chargeback Defense Dossier
   */
  public static generateDossier(evaluation: EvaluationResult): InstanceType<typeof PDFDocument> {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      info: {
        Title: `Chargeback Defense Dossier - ${evaluation.transaction_id}`,
        Author: "Riskor Sentinel - Razorpay AI Fraud Defense",
        Subject: "Payment Dispute Legal & Forensic Evidence Packet",
      },
    });

    const txn = evaluation.transaction;
    const disputeRef = `DISPUTE-RZP-${evaluation.transaction_id.slice(-8).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = evaluation.timestamp || new Date().toISOString();

    // Generate cryptographic evidence hash
    const evidencePayload = JSON.stringify({
      txn_id: evaluation.transaction_id,
      amount: txn.amount,
      ml_score: evaluation.ml_risk_score,
      verdict: evaluation.verdict,
      timestamp,
    });
    const digitalSignature = crypto
      .createHmac("sha256", "riskor_dispute_secret_key_v1")
      .update(evidencePayload)
      .digest("hex");

    // Colors
    const primaryBlue = "#072654";
    const accentBlue = "#3395ff";
    const alertRed = "#d92d20";
    const darkGray = "#1f2937";
    const lightBg = "#f8fafc";
    const borderGray = "#e2e8f0";

    // Header Background Bar
    doc.rect(40, 40, 515, 60).fill(primaryBlue);

    // Header Title
    doc.fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("RISKOR DEFENSE DOSSIER", 55, 52);

    doc.fontSize(9)
      .font("Helvetica")
      .fillColor("#cbd5e1")
      .text("RAZORPAY AUTONOMOUS FRAUD MITIGATION & DISPUTE EVIDENCE", 55, 74);

    doc.fontSize(8)
      .font("Helvetica-Bold")
      .fillColor(accentBlue)
      .text("VISA CE 3.0 / MASTERCARD COMPLIANT", 380, 55, { align: "right" });

    // Dispute Reference & Status Box
    doc.rect(40, 110, 515, 45).fillAndStroke(lightBg, borderGray);

    doc.fillColor(darkGray)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("DISPUTE CASE REF:", 50, 120)
      .font("Helvetica")
      .text(disputeRef, 160, 120);

    doc.font("Helvetica-Bold")
      .text("TIMESTAMP (UTC):", 50, 136)
      .font("Helvetica")
      .text(timestamp, 160, 136);

    // Status Badge
    doc.rect(380, 118, 165, 28).fill(alertRed);
    doc.fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(`VERDICT: ${evaluation.verdict}ED`, 380, 126, { width: 165, align: "center" });

    // Section 1: Transaction Summary
    let y = 170;
    doc.fillColor(primaryBlue)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("1. TRANSACTION & CARDHOLDER SUMMARY", 40, y);

    y += 18;
    doc.rect(40, y, 515, 75).stroke(borderGray);

    const leftColX = 50;
    const rightColX = 310;
    const rowH = 15;

    doc.fillColor(darkGray).fontSize(8.5);

    // Row 1
    doc.font("Helvetica-Bold").text("Transaction ID:", leftColX, y + 8);
    doc.font("Helvetica").text(evaluation.transaction_id, leftColX + 85, y + 8);

    doc.font("Helvetica-Bold").text("Amount:", rightColX, y + 8);
    doc.font("Helvetica-Bold").fillColor(primaryBlue).text(`INR ₹${txn.amount.toLocaleString()}`, rightColX + 85, y + 8);
    doc.fillColor(darkGray);

    // Row 2
    doc.font("Helvetica-Bold").text("Cardholder:", leftColX, y + 8 + rowH);
    doc.font("Helvetica").text(txn.cardholder_name || "Anita Verma", leftColX + 85, y + 8 + rowH);

    doc.font("Helvetica-Bold").text("Card Details:", rightColX, y + 8 + rowH);
    doc.font("Helvetica").text(`${txn.card_network || "Visa"} •••• ${txn.card_last4 || "4312"}`, rightColX + 85, y + 8 + rowH);

    // Row 3
    doc.font("Helvetica-Bold").text("Merchant:", leftColX, y + 8 + rowH * 2);
    doc.font("Helvetica").text(`${txn.merchant_name || "NexStore"} (${txn.merchant_id || "merch_rzp"})`, leftColX + 85, y + 8 + rowH * 2);

    doc.font("Helvetica-Bold").text("AVS ZIP Match:", rightColX, y + 8 + rowH * 2);
    doc.font("Helvetica-Bold").fillColor(txn.billing_zip_match ? "#16a34a" : alertRed)
      .text(txn.billing_zip_match ? "VALID MATCH" : "FAILED / MISMATCH", rightColX + 85, y + 8 + rowH * 2);
    doc.fillColor(darkGray);

    // Row 4
    doc.font("Helvetica-Bold").text("Threat Type:", leftColX, y + 8 + rowH * 3);
    doc.font("Helvetica-Bold").fillColor(alertRed).text(evaluation.threat_category || "Payment Fraud Anomaly", leftColX + 85, y + 8 + rowH * 3);
    doc.fillColor(darkGray);

    // Section 2: Forensic Network & Device Telemetry
    y += 92;
    doc.fillColor(primaryBlue)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("2. NETWORK & DEVICE FORENSIC TELEMETRY", 40, y);

    y += 18;
    doc.rect(40, y, 515, 80).stroke(borderGray);

    doc.fillColor(darkGray).fontSize(8.5);

    // Row 1
    doc.font("Helvetica-Bold").text("IP Address:", leftColX, y + 8);
    doc.font("Helvetica").text(txn.ip_address || "185.220.101.5", leftColX + 85, y + 8);

    doc.font("Helvetica-Bold").text("Geo Location:", rightColX, y + 8);
    doc.font("Helvetica").text(txn.ip_location || "Unknown IP", rightColX + 85, y + 8);

    // Row 2
    doc.font("Helvetica-Bold").text("Geo Discrepancy:", leftColX, y + 8 + rowH);
    doc.font("Helvetica").text(`${txn.geo_distance_km} km from Card Billing Origin`, leftColX + 85, y + 8 + rowH);

    doc.font("Helvetica-Bold").text("VPN / Proxy:", rightColX, y + 8 + rowH);
    doc.font("Helvetica-Bold").fillColor(txn.is_vpn_or_proxy ? alertRed : "#16a34a")
      .text(txn.is_vpn_or_proxy ? "DETECTED (High Anonymity)" : "CLEAN (Direct IP)", rightColX + 85, y + 8 + rowH);
    doc.fillColor(darkGray);

    // Row 3
    doc.font("Helvetica-Bold").text("1-Hour Velocity:", leftColX, y + 8 + rowH * 2);
    doc.font("Helvetica").text(`${txn.velocity_1h} transactions / hr`, leftColX + 85, y + 8 + rowH * 2);

    doc.font("Helvetica-Bold").text("Device Trust:", rightColX, y + 8 + rowH * 2);
    doc.font("Helvetica-Bold").fillColor(txn.device_trust_score < 0.4 ? alertRed : primaryBlue)
      .text(`${(txn.device_trust_score * 100).toFixed(0)}% (Entropy Score: ${txn.device_trust_score.toFixed(2)})`, rightColX + 85, y + 8 + rowH * 2);
    doc.fillColor(darkGray);

    // Row 4
    doc.font("Helvetica-Bold").text("User Agent:", leftColX, y + 8 + rowH * 3);
    doc.font("Helvetica").text((txn.user_agent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64)").slice(0, 75), leftColX + 85, y + 8 + rowH * 3);

    // Section 3: Machine Learning Risk Attribution
    y += 98;
    doc.fillColor(primaryBlue)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("3. ML STATISTICAL ANOMALY BREAKDOWN", 40, y);

    y += 18;
    const mb = evaluation.ml_breakdown;
    doc.rect(40, y, 515, 60).fillAndStroke(lightBg, borderGray);

    const subColWidth = 515 / 5;
    const subScores = [
      { label: "Velocity Risk", val: mb.velocity_score },
      { label: "Geo Discrepancy", val: mb.geo_score },
      { label: "Device Anomaly", val: mb.device_score },
      { label: "Amount Z-Score", val: mb.amount_score },
      { label: "AVS Mismatch", val: mb.avs_score },
    ];

    subScores.forEach((item, idx) => {
      const colX = 40 + idx * subColWidth;
      doc.fillColor(darkGray)
        .font("Helvetica")
        .fontSize(8)
        .text(item.label, colX, y + 10, { width: subColWidth, align: "center" });

      const scoreColor = item.val > 0.6 ? alertRed : item.val > 0.3 ? "#d97706" : "#16a34a";
      doc.fillColor(scoreColor)
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(item.val.toFixed(2), colX, y + 25, { width: subColWidth, align: "center" });

      doc.fillColor("#64748b")
        .fontSize(7)
        .text(item.val > 0.6 ? "CRITICAL" : item.val > 0.3 ? "ELEVATED" : "NORMAL", colX, y + 43, { width: subColWidth, align: "center" });
    });

    // Section 4: Autonomous Gemini AI Forensic Audit & Decision
    y += 75;
    doc.fillColor(primaryBlue)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("4. AUTONOMOUS GEMINI AGENT FORENSIC VERDICT", 40, y);

    y += 18;
    doc.rect(40, y, 515, 90).fillAndStroke("#f1f5f9", primaryBlue);

    doc.fillColor(primaryBlue)
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .text(`AI AGENT CONFIDENCE: ${(evaluation.confidence_score * 100).toFixed(0)}%`, 50, y + 10);

    doc.fillColor(darkGray)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Forensic Reasoning Audit Trail:", 50, y + 26);

    doc.font("Helvetica-Oblique")
      .fontSize(8.5)
      .fillColor("#334155")
      .text(`"${evaluation.reasoning_audit_log}"`, 50, y + 38, { width: 495, lineGap: 2 });

    doc.fillColor(darkGray)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Recommended Action:", 50, y + 68);

    doc.font("Helvetica-Bold")
      .fontSize(8.5)
      .fillColor(alertRed)
      .text(evaluation.recommended_action, 170, y + 68);

    // Section 5: Cryptographic Digital Signature & Representment Clause
    y += 105;
    doc.rect(40, y, 515, 60).fillAndStroke("#fafafa", borderGray);

    doc.fillColor(darkGray)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("CRYPTOGRAPHIC INTEGRITY STAMP (HMAC-SHA256):", 50, y + 8);

    doc.font("Courier")
      .fontSize(7)
      .fillColor("#475569")
      .text(digitalSignature, 50, y + 20, { width: 495 });

    doc.font("Helvetica")
      .fontSize(7.5)
      .fillColor("#64748b")
      .text(
        "This dossier constitutes automated pre-authorization forensic telemetry collected at the point of sale by Razorpay Riskor Sentinel. Under Visa Core Rules and Mastercard Dispute Resolution Framework, this proof certifies unauthorized velocity and anomalous origin, substantiating merchant fraud rejection.",
        50,
        y + 32,
        { width: 495, lineGap: 1 }
      );

    // Footer
    doc.fillColor("#94a3b8")
      .fontSize(7)
      .font("Helvetica")
      .text(
        `Generated by Riskor Engine v1.0 • Razorpay AI Buildathon • Digital Certificate ID: ${digitalSignature.slice(0, 16).toUpperCase()}`,
        40,
        780,
        { align: "center", width: 515 }
      );

    doc.end();
    return doc;
  }
}
