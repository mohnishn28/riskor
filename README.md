# 🛡️ Riskor — Autonomous AI Payment Fraud Defense Engine
> **Razorpay AI Buildathon 2026** • Production-Grade Autonomous Fraud Prevention, Real-Time Statistical Gating & Gemini Agentic Defense

---

## ⚡ Overview

**Riskor** is an enterprise-ready payment fraud defense architecture built to protect high-throughput payment processors like Razorpay. It solves the classic trade-off between **payment latency** and **deep fraud detection**:

1. **Sub-10ms Statistical ML Gating**: Every transaction is first processed by a multi-factor statistical anomaly engine (velocity Z-scores, geo-distance delta, device fingerprint trust entropy, amount distributions, and AVS postal matching).
2. **Instant Low-Risk Bypass**: 90%+ of clean consumer transactions (`ML Score < 0.35`) bypass heavy models and are authorized in `< 10ms` with zero friction.
3. **Autonomous Gemini 2.5 Agent Escalation**: Anomalous or suspicious transactions (`ML Score >= 0.35`) are dynamically escalated to **Google Gemini 2.5 Flash** using the official `@google/genai` SDK, which performs forensic reasoning, classifies threat vectors, and issues structured security verdicts (`ALLOW`, `CHALLENGE (3DS OTP)`, or `BLOCK`).
4. **Automated Chargeback Defense Dossiers (PDF)**: For blocked fraudulent attempts, Riskor automatically synthesizes a bank-compliant PDF legal dossier (Visa Compelling Evidence 3.0 / Mastercard Dispute Framework) with cryptographic HMAC-SHA256 integrity signatures and full AI reasoning transcripts for instant dispute representment.
5. **Interactive Razorpay Checkout Simulator & Defense Dashboard**: A mock e-commerce storefront with live "Fraud Attack Mode" toggles, attack presets (bot syndicate, impossible travel, account takeover), and a real-time merchant security dashboard with Recharts analytics and live streaming audit trails.

---

## 🏗️ Architecture & Dual-Tier Workflow

```
[ Customer Checkout / API ]
          │
          ▼
[ POST /api/v1/score ] ──────► [ Statistical ML Scoring Engine ]
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
              [ ML Score < 0.35 ]            [ ML Score >= 0.35 ]
                         │                             │
                         ▼                             ▼
                 ⚡ Instant Bypass             🤖 Escalate to Gemini Agent
                    (~5ms ALLOW)                 (@google/genai SDK)
                         │                             │
                         │                   ┌─────────┴─────────┐
                         │                   ▼                   ▼
                         │           ⚠️ 3DS Challenge       🚫 Hard Block
                         │           (OTP Step-Up)       (Compiles PDF Dossier)
                         │                   │                   │
                         └───────────────────┼───────────────────┘
                                             │
                                             ▼
                             [ Real-Time Audit Feed & Stats ]
```

---

## 📁 Repository Structure

```
/RazorPay
├── backend/                        # Node.js + Express + TypeScript (ESM)
│   ├── src/
│   │   ├── server.ts               # Express app, CORS, error handling
│   │   ├── types/
│   │   │   └── fraud.ts            # TypeScript interfaces & Zod validation schemas
│   │   ├── services/
│   │   │   ├── mlEngine.ts         # Deterministic multi-factor statistical anomaly engine
│   │   │   ├── geminiEvaluator.ts  # Gemini 2.5 Flash structured agent evaluator (@google/genai)
│   │   │   ├── dossierGenerator.ts # PDFKit bank-grade legal dispute packet generator
│   │   │   └── transactionStore.ts # In-memory transactional repository & live aggregations
│   │   └── routes/
│   │       └── fraudRoutes.ts      # /score, /evaluate, /dossier, /transactions, /stats
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
│
└── frontend/                       # Next.js 14+ App Router + Tailwind CSS + Recharts
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx          # Dark fintech theme layout
    │   │   ├── page.tsx            # Home view (Default Dashboard)
    │   │   ├── dashboard/          # Merchant Defense Dashboard
    │   │   └── simulator/          # Razorpay Checkout Simulator & Attack Matrix
    │   ├── components/
    │   │   ├── Navbar.tsx          # Navigation with live engine health & reset controls
    │   │   ├── StatCard.tsx        # Animated KPI Cards (Fraud Blocked, FPR, Latency)
    │   │   ├── AnalyticsCharts.tsx # 24h Revenue Defended & Threat Vector Recharts
    │   │   ├── TransactionTable.tsx# Real-Time Audit Feed with expandable Gemini reasoning
    │   │   ├── AttackToggle.tsx    # Attack Switch & 5 Real-World Fraud Presets
    │   │   ├── PayloadEditor.tsx   # Interactive parameter sliders with live ML scoring
    │   │   └── RazorpayModal.tsx   # Authentic Razorpay modal with OTP Challenge & PDF Download
    │   └── lib/
    │       ├── api.ts              # Type-safe API client
    │       └── types.ts            # Shared frontend definitions
    ├── tailwind.config.ts
    ├── package.json
    └── .env.example
```

---

## 🚀 Quickstart Guide

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# (Optional) Add your GEMINI_API_KEY in .env. If left blank, the resilient heuristic evaluator engages.
npm run dev
```
*Backend runs on `http://localhost:4000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 🧪 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/score` | Calculates deterministic ML risk score & sub-scores (0.0 to 1.0) |
| `POST` | `/api/v1/evaluate` | Executes dual-tier gating: Instant bypass vs. Gemini 2.5 Flash agent evaluation |
| `POST` | `/api/v1/dossier` | Generates streaming downloadable PDF "Chargeback Defense Dossier" |
| `GET` | `/api/v1/dossier/:id` | Direct link download of dispute PDF for transaction ID |
| `GET` | `/api/v1/transactions` | Real-time list of evaluated transaction events |
| `GET` | `/api/v1/stats` | Aggregated dashboard KPI metrics (Fraud blocked, FPR, latency) |
| `POST` | `/api/v1/reset` | Reseeds mock dataset with clean and adversary transactions |
| `GET` | `/health` | Live service health check & Gemini model configuration state |

---

## 🛡️ Attack Simulation Presets

1. **Legitimate Shopper**: ₹2,499 local purchase, 1 txn/hr, 4km geo-delta, 96% device trust -> **Instant ALLOW (~5ms)**
2. **Card Testing Bot Syndicate**: ₹89 micro-charge, 26 txns/hr, 7,420km distance, 8% trust, Headless Chrome -> **BLOCK + Dossier**
3. **Impossible Geo-Hopping**: ₹94,500 whale charge, 8,900km distance (Lagos proxy vs Pune cardholder), AVS fail -> **BLOCK + Dossier**
4. **Vacation Travel / Large Cart**: ₹48,000 in Goa (420km away) with matching ZIP & trusted iPhone -> **3DS CHALLENGE (Step-Up OTP)**
5. **Account Takeover Surge**: ₹62,000 charge with 9 txns/hr burst, Russian VPN proxy, failed AVS -> **BLOCK + Dossier**
6. **Custom Slider Matrix**: Fine-tune amount, velocity, geo-delta, and device trust with live score calculation.
