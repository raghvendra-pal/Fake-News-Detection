import React from 'react';
import { AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

export default function SignalList({ signals = [] }) {
  if (!signals || signals.length === 0) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 italic">
        No anomalous stylistic or linguistic signals detected.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {signals.map((sig, idx) => {
        const isWarning = sig.type === 'warning';
        return (
          <div
            key={idx}
            className={`flex items-start gap-3 p-3 rounded-lg border text-sm transition-all ${
              isWarning
                ? 'bg-amber-50/70 border-amber-200/80 text-amber-900'
                : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
            }`}
          >
            {isWarning ? (
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            )}
            <div className="flex-1">
              <div className="font-semibold flex items-center justify-between">
                <span>{sig.name}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider ${
                    isWarning ? 'bg-amber-200/70 text-amber-800' : 'bg-emerald-200/70 text-emerald-800'
                  }`}
                >
                  {isWarning ? 'Suspicious Signal' : 'Credibility Marker'}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{sig.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
