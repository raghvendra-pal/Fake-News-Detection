import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

export default function PredictionBadge({ prediction, size = "md" }) {
  const pred = (prediction || "").toUpperCase();

  let config = {
    bg: "bg-slate-100 text-slate-800 border-slate-300",
    icon: HelpCircle,
    label: pred || "UNKNOWN",
    textColor: "text-slate-700"
  };

  if (pred === "REAL" || pred === "GENUINE") {
    config = {
      bg: "bg-emerald-50 text-emerald-800 border-emerald-300",
      icon: CheckCircle2,
      label: pred === "REAL" ? "REAL NEWS" : "GENUINE REVIEW",
      textColor: "text-emerald-700"
    };
  } else if (pred === "SUSPICIOUS") {
    config = {
      bg: "bg-amber-50 text-amber-800 border-amber-300",
      icon: AlertTriangle,
      label: "SUSPICIOUS / UNCERTAIN",
      textColor: "text-amber-700"
    };
  } else if (pred === "FAKE") {
    config = {
      bg: "bg-rose-50 text-rose-800 border-rose-300",
      icon: AlertOctagon,
      label: "FAKE / DECEPTIVE",
      textColor: "text-rose-700"
    };
  }

  const Icon = config.icon;
  const sizeClasses = size === "lg" 
    ? "px-4 py-2 text-base font-semibold" 
    : (size === "sm" ? "px-2 py-0.5 text-xs font-medium" : "px-3 py-1.5 text-sm font-semibold");

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border ${config.bg} ${sizeClasses} tracking-wide transition-all shadow-sm`}>
      <Icon className={size === "lg" ? "w-5 h-5" : (size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4")} />
      <span>{config.label}</span>
    </span>
  );
}
