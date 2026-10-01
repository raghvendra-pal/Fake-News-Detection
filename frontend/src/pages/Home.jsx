import React from 'react';
import { Newspaper, Star, Globe, ShieldCheck, CheckCircle2, Search, ArrowRight, FileText, Database, Cpu, AlertTriangle } from 'lucide-react';

export default function Home({ setActiveTab, onSelectSample }) {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white p-8 sm:p-12 lg:p-16 shadow-lg border border-slate-700/60">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-400 text-xs font-semibold tracking-wide uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI & NLP Credibility Assessment</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Check Before You Believe.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl">
            Analyze news articles and reviews using machine learning, NLP, and source-based verification. Distinguish verified reports from deceptive misinformation and incentivized product reviews.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('news')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition-all shadow-sm hover:shadow"
            >
              <Newspaper className="w-4 h-4" />
              <span>Check News</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => setActiveTab('review')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-sm transition-all"
            >
              <Star className="w-4 h-4 text-amber-400" />
              <span>Check Review</span>
            </button>

            <button
              onClick={() => setActiveTab('latest')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-transparent hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 font-medium text-sm transition-all"
            >
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Explore Latest News</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative background badge */}
        <div className="hidden lg:block absolute right-12 bottom-8 opacity-10 text-white pointer-events-none">
          <ShieldCheck className="w-72 h-72 stroke-[1]" />
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Comprehensive Verification Framework
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            TruthLens unites statistical natural language processing, linguistic anomaly detection, and real-time external cross-sourcing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Newspaper className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Dual News Analysis</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Accepts complete text articles or web URLs. Safely parses article text, extracts publication metadata, checks domain reputation, and verifies claims against external news indices.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => setActiveTab('news')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-800 inline-flex items-center gap-1"
              >
                Analyze an article <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Fake Review Detection</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Identifies deceptive consumer feedback by evaluating promotional hype, extreme sentiment polarity, lack of specific product experience, and unnatural repetition patterns.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => setActiveTab('review')}
                className="text-xs font-semibold text-amber-600 hover:text-amber-800 inline-flex items-center gap-1"
              >
                Test a product review <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Explainable AI & Sources</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Strictly avoids black-box labels. Clearly distinguishes internal linguistic model signals from external evidence corroboration, providing transparent reasons and source links.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => setActiveTab('model')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                View ML benchmark specs <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works pipeline */}
      <section className="bg-slate-100/70 rounded-2xl border border-slate-200/80 p-8 sm:p-10 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">End-to-End Processing Workflow</h2>
          <p className="text-sm text-slate-600">
            How TruthLens systematically processes every submission
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded w-fit">
              Step 01
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">Input & Extraction</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Validates text or URL. Performs SSRF checks and extracts title, body, author, and publisher metadata without bot circumvention.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded w-fit">
              Step 02
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">NLP & Signal Analysis</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cleans text, vectorizes n-grams via TF-IDF, and extracts linguistic indicators: sensationalism, certainty, repetition, and punctuation density.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded w-fit">
              Step 03
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">Claim Corroboration</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Extracts primary claims and searches open news indices to tally supporting, contradicting, or inconclusive reporting.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded w-fit">
              Step 04
            </div>
            <h4 className="font-semibold text-slate-900 text-sm">Calibrated Assessment</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Combines ML probabilities with external evidence to output REAL, SUSPICIOUS, or FAKE with calibrated confidence and transparent rationale.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Test Demo Samples */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Quick Test Samples</h3>
            <p className="text-sm text-slate-500">
              Select a pre-loaded test case to see TruthLens in action immediately
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Viva & Demo Ready</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onSelectSample('real_news')}
            className="text-left p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                Verified News Sample
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-900">
              ISRO NavIC Satellite Launch
            </h4>
            <p className="text-xs text-slate-500 line-clamp-2">
              Objective reporting from space agency with institutional attribution, technical specs, and neutral tone.
            </p>
          </button>

          <button
            onClick={() => onSelectSample('fake_news')}
            className="text-left p-4 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/30 transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded">
                Fake / Hoax Sample
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-rose-900">
              Miracle Himalayan Herb Cure
            </h4>
            <p className="text-xs text-slate-500 line-clamp-2">
              Sensational claim of 48-hour terminal illness cure, suppressed doctors trope, and urgency pressure.
            </p>
          </button>

          <button
            onClick={() => onSelectSample('fake_review')}
            className="text-left p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                Incentivized Review Sample
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-amber-900">
              Hyperbolic 5-Star Promo
            </h4>
            <p className="text-xs text-slate-500 line-clamp-2">
              Exaggerated buzzwords ("best in world", "miracle quality"), punctuation spam, zero functional details.
            </p>
          </button>
        </div>
      </section>
    </div>
  );
}
