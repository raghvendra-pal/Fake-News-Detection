import React from 'react';
import { ExternalLink, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

export default function SourceCard({ source }) {
  const stance = source.stance || 'RELATED_INCONCLUSIVE';

  let stanceBadge = {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: HelpCircle,
    label: 'Related / Inconclusive'
  };

  if (stance === 'SUPPORTING') {
    stanceBadge = {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle,
      label: 'Supporting / Corroborating'
    };
  } else if (stance === 'CONTRADICTING') {
    stanceBadge = {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
      label: 'Contradicting / Debunking'
    };
  }

  const Icon = stanceBadge.icon;

  return (
    <div className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-sky-800">{source.publisher}</span>
            {source.published_date && (
              <span className="text-[11px] text-slate-400">• {source.published_date}</span>
            )}
          </div>
          <h4 className="text-sm font-medium text-slate-900 leading-snug line-clamp-2">
            {source.title}
          </h4>
        </div>

        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border font-medium shrink-0 ${stanceBadge.bg}`}>
          <Icon className="w-3 h-3" />
          <span>{stanceBadge.label}</span>
        </span>
      </div>

      {source.url && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-end">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-600 hover:text-sky-800 inline-flex items-center gap-1 font-medium transition-colors"
          >
            <span>Open Source</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
