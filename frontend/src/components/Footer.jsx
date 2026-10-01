import React from 'react';
import { ShieldCheck, Info, BookOpen, ExternalLink, Code2 } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-sky-500 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Truth<span className="text-sky-400">Lens</span></span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              AI-Powered Fake News & Review Detection System. Designed as an academic software engineering and NLP project to inspect textual credibility, linguistic markers, and external source corroboration.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Built with FastAPI, Scikit-Learn & React</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Features</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => setActiveTab('news')} className="hover:text-sky-400 transition-colors">
                  News Verification
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('review')} className="hover:text-sky-400 transition-colors">
                  Fake Review Detector
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('latest')} className="hover:text-sky-400 transition-colors">
                  Live News Explorer
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('history')} className="hover:text-sky-400 transition-colors">
                  Verification Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Academic Transparency & Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Evaluation & Viva</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => setActiveTab('model')} className="hover:text-sky-400 transition-colors flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Model Metrics & Benchmarks</span>
                </button>
              </li>
              <li className="text-xs text-slate-500 leading-normal pt-2">
                Probabilistic NLP assessment tool. Not intended as an absolute arbiter of objective truth.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} TruthLens — Final Year Engineering & AIML Project.</p>
          <div className="flex items-center gap-4">
            <span className="bg-slate-800 text-slate-400 px-2.5 py-1 rounded font-mono text-[11px]">
              TF-IDF + Logistic Regression / Naive Bayes
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
