import React from 'react';
import { Building2, Globe, Calendar, User, ShieldAlert, Award, ExternalLink } from 'lucide-react';

export default function SourceCredibilityCard({ 
  sourceInfo = {}, 
  articleMetadata = {}, 
  supportingCount = 0, 
  contradictingCount = 0 
}) {
  const hasVerifiedData = sourceInfo?.has_data;
  const publisher = articleMetadata?.publisher || sourceInfo?.publisher_name || 'Unknown Publisher';
  const domain = articleMetadata?.domain || sourceInfo?.domain || 'Unknown Domain';
  const author = articleMetadata?.author;
  const publishedDate = articleMetadata?.published_date;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-sky-600" />
          <h3 className="font-semibold text-slate-900 text-base">Source Information</h3>
        </div>
        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {domain}
        </span>
      </div>

      {/* Basic Article Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Publisher: <strong className="text-slate-800">{publisher}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Domain: <strong className="text-slate-800">{domain}</strong></span>
        </div>
        {publishedDate && (
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Published: <strong className="text-slate-800">{publishedDate}</strong></span>
          </div>
        )}
        {author && (
          <div className="flex items-center gap-2 text-slate-600">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Author: <strong className="text-slate-800">{author}</strong></span>
          </div>
        )}
      </div>

      {/* Corroborating / Conflicting metrics */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <div className="p-2.5 rounded bg-emerald-50/60 border border-emerald-100 text-center">
          <div className="text-xs text-emerald-700 font-medium">Corroborating Sources</div>
          <div className="text-lg font-bold text-emerald-900 mt-0.5">{supportingCount}</div>
        </div>
        <div className="p-2.5 rounded bg-rose-50/60 border border-rose-100 text-center">
          <div className="text-xs text-rose-700 font-medium">Conflicting Sources</div>
          <div className="text-lg font-bold text-rose-900 mt-0.5">{contradictingCount}</div>
        </div>
      </div>

      {/* Verified Registry Record or Explicitly Unavailable Notice */}
      <div className="pt-2 border-t border-slate-100">
        {hasVerifiedData ? (
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-sky-800 font-medium text-xs">
              <Award className="w-4 h-4 text-sky-600" />
              <span>{sourceInfo.reputation_status}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Category:</strong> {sourceInfo.category} (Est. {sourceInfo.established_year})
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Editorial Standards:</strong> {sourceInfo.editorial_standards}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Fact-Checking Record:</strong> {sourceInfo.fact_checking_record}
            </p>
          </div>
        ) : (
          <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200/70 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-amber-900">
                Source credibility information unavailable
              </div>
              <p className="text-xs text-amber-800/80 mt-0.5 leading-relaxed">
                This domain is not currently cataloged in the verified registry. No arbitrary trust score is generated. Independent cross-verification is recommended.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
