import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  colorScheme?: "blue" | "emerald" | "rose" | "amber" | "purple";
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  colorScheme = "blue",
  badge,
}) => {
  const schemeStyles = {
    blue: {
      border: "border-rzp-blue/20 hover:border-rzp-blue/50",
      iconBg: "bg-rzp-blue/15 text-rzp-cyan border-rzp-blue/30",
      glow: "hover:shadow-[0_0_20px_-5px_rgba(51,149,255,0.25)]",
      valColor: "text-white",
    },
    emerald: {
      border: "border-emerald-500/20 hover:border-emerald-500/50",
      iconBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      glow: "hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.25)]",
      valColor: "text-emerald-300",
    },
    rose: {
      border: "border-rose-500/20 hover:border-rose-500/50",
      iconBg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      glow: "hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.25)]",
      valColor: "text-rose-300",
    },
    amber: {
      border: "border-amber-500/20 hover:border-amber-500/50",
      iconBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      glow: "hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.25)]",
      valColor: "text-amber-300",
    },
    purple: {
      border: "border-purple-500/20 hover:border-purple-500/50",
      iconBg: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      glow: "hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.25)]",
      valColor: "text-purple-300",
    },
  };

  const currentScheme = schemeStyles[colorScheme];

  return (
    <div
      className={`relative p-5 rounded-2xl bg-surface/90 backdrop-blur-md border ${currentScheme.border} ${currentScheme.glow} transition-all duration-300 group overflow-hidden`}
    >
      {/* Decorative top corner sheen */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full blur-xl -mr-8 -mt-8 pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {title}
            </span>
            {badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-slate-300 uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
          <div className={`mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight ${currentScheme.valColor}`}>
            {value}
          </div>
        </div>

        <div className={`p-3 rounded-xl border ${currentScheme.iconBg} shadow-sm group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400 truncate max-w-[200px]">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ml-auto ${
                trendPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
