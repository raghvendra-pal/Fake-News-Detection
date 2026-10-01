import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export default function ConfidenceMeter({ confidence = 0, level = "Medium", prediction = "" }) {
  const percentage = Math.min(100, Math.max(0, Number(confidence) || 0));

  let barColor = "bg-sky-600";
  let tierBadge = "bg-sky-100 text-sky-800 border-sky-200";

  const pred = (prediction || "").toUpperCase();
  if (pred === "REAL" || pred === "GENUINE") {
    barColor = "bg-emerald-600";
    tierBadge = "bg-emerald-100 text-emerald-800 border-emerald-200";
  } else if (pred === "SUSPICIOUS") {
    barColor = "bg-amber-500";
    tierBadge = "bg-amber-100 text-amber-800 border-amber-200";
  } else if (pred === "FAKE") {
    barColor = "bg-rose-600";
    tierBadge = "bg-rose-100 text-rose-800 border-rose-200";
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Model Confidence</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${tierBadge}`}>
            {level} Confidence
          </span>
          <span className="text-base font-bold text-slate-900">{percentage}%</span>
        </div>
      </div>

      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-700 ease-out rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-start gap-1.5 mt-2 text-xs text-slate-500">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
        <span>
          Calibrated probabilistic scoring. Reflects NLP feature weights combined with heuristic signals.
        </span>
      </div>
    </div>
  );
}
