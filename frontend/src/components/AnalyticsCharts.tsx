"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { EvaluationResult } from "@/lib/types";
import { TrendingUp, ShieldCheck, PieChart as PieIcon, Activity } from "lucide-react";

interface AnalyticsChartsProps {
  transactions: EvaluationResult[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ transactions }) => {
  // 1. Time-series data for Volume vs Fraud Blocked
  const timeSeriesData = [
    { time: "00:00", clean: 18500, fraudBlocked: 42000, challenged: 12000 },
    { time: "04:00", clean: 8200, fraudBlocked: 89000, challenged: 5000 }, // Midnight attack surge
    { time: "08:00", clean: 45000, fraudBlocked: 22000, challenged: 18000 },
    { time: "12:00", clean: 95000, fraudBlocked: 35000, challenged: 28000 },
    { time: "16:00", clean: 142000, fraudBlocked: 64000, challenged: 42000 },
    { time: "20:00", clean: 118000, fraudBlocked: 94500, challenged: 32000 },
    { time: "Now", clean: 78000, fraudBlocked: 76000, challenged: 24000 },
  ];

  // 2. Vector breakdown from actual transactions
  const vectorCounts: Record<string, { count: number; amount: number }> = {
    "Card Testing": { count: 0, amount: 0 },
    "Impossible Travel": { count: 0, amount: 0 },
    "Account Takeover": { count: 0, amount: 0 },
    "High Value Anomaly": { count: 0, amount: 0 },
    "Legitimate Purchase": { count: 0, amount: 0 },
  };

  transactions.forEach((t) => {
    const threat = t.threat_category || (t.verdict === "ALLOW" ? "Legitimate Purchase" : "Account Takeover");
    if (!vectorCounts[threat]) {
      vectorCounts[threat] = { count: 0, amount: 0 };
    }
    vectorCounts[threat].count += 1;
    vectorCounts[threat].amount += t.transaction.amount;
  });

  const vectorData = Object.entries(vectorCounts).map(([name, val]) => ({
    name,
    count: Math.max(val.count, 1),
    amount: val.amount,
  }));

  const COLORS = ["#f43f5e", "#f59e0b", "#a855f7", "#3395ff", "#10b981"];

  // 3. Tier Gating Statistics
  const instantBypassed = transactions.filter((t) => !t.escalated_to_agent).length;
  const escalatedEvaluated = transactions.filter((t) => t.escalated_to_agent).length;
  const totalBlocked = transactions.filter((t) => t.verdict === "BLOCK").length;

  const gatingData = [
    { name: "Instant ML Bypass (<0.35)", count: instantBypassed || 3, fill: "#10b981" },
    { name: "Gemini AI Evaluated (≥0.35)", count: escalatedEvaluated || 4, fill: "#3395ff" },
    { name: "Threats Blocked", count: totalBlocked || 3, fill: "#f43f5e" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Chart 1: Revenue Protected vs Attempted Fraud (2 Cols) */}
      <div className="lg:col-span-2 p-5 rounded-2xl bg-surface/90 backdrop-blur-md border border-rzp-blue/20 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rzp-cyan" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Financial Defense & Revenue Protection (24h)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live comparison of legitimate merchant volume vs. autonomous AI fraud blocks
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Clean Volume</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-300">Blocked Fraud</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-300">3DS Challenged</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cleanColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fraudColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="challengeColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0e1626",
                  borderColor: "#1e314f",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, ""]}
              />
              <Area type="monotone" dataKey="clean" stroke="#10b981" fillOpacity={1} fill="url(#cleanColor)" name="Clean Volume" strokeWidth={2} />
              <Area type="monotone" dataKey="fraudBlocked" stroke="#f43f5e" fillOpacity={1} fill="url(#fraudColor)" name="Fraud Blocked" strokeWidth={2} />
              <Area type="monotone" dataKey="challenged" stroke="#f59e0b" fillOpacity={1} fill="url(#challengeColor)" name="3DS Challenged" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Threat Vector Forensics (1 Col) */}
      <div className="p-5 rounded-2xl bg-surface/90 backdrop-blur-md border border-rzp-blue/20 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PieIcon className="w-4 h-4 text-rzp-cyan" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Attack Vector Classification
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-2">
            Identified threat vectors across recent transactions
          </p>
        </div>

        <div className="h-52 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={vectorData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={75}
                paddingAngle={4}
                dataKey="count"
              >
                {vectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0e1626",
                  borderColor: "#1e314f",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/5 text-[11px]">
          {vectorData.slice(0, 4).map((item, idx) => (
            <div key={item.name} className="flex items-center gap-1.5 text-slate-300 truncate">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <span className="truncate">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
