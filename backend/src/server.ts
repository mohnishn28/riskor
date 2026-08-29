import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import fraudRoutes from "./routes/fraudRoutes.js";
import { TransactionStore } from "./services/transactionStore.js";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4000;
// Root health check endpoint for Render & Vercel polling
app.get('/', (req, res) => {
  res.status(200).json({ status: 'active', service: 'Riskor Backend Engine' });
});
app.get('/api/v1/status', (req, res) => {
  res.status(200).json({ status: 'active', timestamp: new Date() });
});
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Enable CORS for Next.js frontend
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON request bodies
app.use(express.json());

// Initialize store with rich demonstration dataset
TransactionStore.initializeWithSeedData();

// Root health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    system: "Riskor - Razorpay Payment Fraud Defense Engine",
    version: "1.0.0",
    gemini_model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    gemini_key_configured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here"),
    timestamp: new Date().toISOString(),
  });
});

// Mount API v1 routes
app.use("/api/v1", fraudRoutes);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🛡️  RISKOR DEFENSE ENGINE IS ONLINE`);
  console.log(`⚡  Port: http://localhost:${PORT}`);
  console.log(`🤖  Model: ${process.env.GEMINI_MODEL || "gemini-2.5-flash"}`);
  console.log(`💳  Razorpay AI Buildathon 2026`);
  console.log(`====================================================`);
});

export default app;
