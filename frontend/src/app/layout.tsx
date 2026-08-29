import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Riskor | Razorpay Autonomous AI Payment Fraud Defense",
  description: "Production-Grade AI Fraud Prevention, Real-Time Statistical Gating & Gemini Agentic Defense",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080c14] text-slate-100 antialiased selection:bg-rzp-blue selection:text-white bg-cyber-grid">
        {children}
      </body>
    </html>
  );
}
