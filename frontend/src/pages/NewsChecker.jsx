import React, { useState } from 'react';
import { Newspaper, Link as LinkIcon, AlertCircle, ArrowRight, Loader2, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Copy, Check, ShieldCheck, FileText, Info } from 'lucide-react';
import { api } from '../services/api';
import PredictionBadge from '../components/PredictionBadge';
import ConfidenceMeter from '../components/ConfidenceMeter';
import SignalList from '../components/SignalList';
import SourceCredibilityCard from '../components/SourceCredibilityCard';
import SourceCard from '../components/SourceCard';

export default function NewsChecker({ initialUrl = '', initialText = '' }) {
  const [mode, setMode] = useState(initialUrl ? 'url' : 'text'); // 'text' | 'url'
  const [newsText, setNewsText] = useState(initialText || '');
  const [newsTitle, setNewsTitle] = useState('');
  const [articleUrl, setArticleUrl] = useState(initialUrl || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [blockedNotice, setBlockedNotice] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Quick Test Samples for Viva and Demo
  const sampleRealNews = {
    title: "ISRO successfully launches navigation satellite with advanced indigenous atomic clock",
    text: "The Indian Space Research Organisation (ISRO) on Monday launched a next-generation navigation satellite into geostationary transfer orbit from Sriharikota. Officials confirmed that the satellite will augment the NavIC regional navigation constellation and is equipped with a domestically engineered rubidium atomic clock. Tracking stations in Bengaluru reported nominal telemetry following payload separation. Further orbital trim maneuvers are scheduled over the next forty-eight hours."
  };

  const sampleFakeNews = {
    title: "SHOCKING: Miracle Himalayan leaf cures all terminal diseases in 48 hours say suppressed doctors",
    text: "Big Pharma is completely terrified of this one simple discovery! An ancient Himalayan herb known as Sanjeevani-9 has been proven to cure cancer, diabetes, arthritis, and heart disease in less than 48 hours without any surgery or medicine. Greed-driven hospital corporations have paid millions to keep this miracle leaf hidden from the public. Click here to claim your supply before it is permanently banned and censored forever!"
  };

  const sampleBorderlineNews = {
    title: "NASA intentionally crashes spacecraft into distant asteroid in planetary defense test",
    text: "In an unprecedented demonstration of planetary defense capability, NASA ground control guided the DART spacecraft into a direct kinetic collision with the asteroid Dimorphos. Telemetry from the Italian Space Agency cube satellite confirmed deflection of the orbital trajectory. Peer-reviewed post-impact orbital radar data confirmed the test succeeded beyond initial target parameters."
  };

  const loadSample = (sample) => {
    setMode('text');
    setNewsTitle(sample.title);
    setNewsText(sample.text);
    setError(null);
    setBlockedNotice(null);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);
    setBlockedNotice(null);
    setResult(null);

    if (mode === 'text') {
      if (!newsText.trim() || newsText.trim().length < 15) {
        setError("Please provide an article or news excerpt before continuing (at least 15 characters).");
        return;
      }
      try {
        setLoading(true);
        const data = await api.analyzeNewsText(newsText.trim(), newsTitle.trim());
        setResult(data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to analyze news text. Please check server connection.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!articleUrl.trim()) {
        setError("Please enter a valid article URL.");
        return;
      }
      try {
        setLoading(true);
        const data = await api.analyzeNewsUrl(articleUrl.trim());
        if (data.success === false) {
          // Blocked or failed extraction
          setBlockedNotice({
            message: data.message,
            canPasteManually: data.can_paste_manually
          });
        } else {
          setResult(data);
        }
      } catch (err) {
        setError(err.response?.data?.detail || "Could not retrieve the article. Try pasting the article text manually.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const reportText = `[TruthLens News Credibility Report]
Prediction: ${result.prediction} (${result.confidence}% ${result.confidence_level} Confidence)
Title: ${result.title || result.article_info?.title || 'N/A'}
Primary Claim: ${result.primary_claim || 'N/A'}
Key Signals: ${result.signals?.map(s => s.name).join(', ') || 'None detected'}
Model Signals: ${result.why_this_result?.model_signals?.join('; ') || 'N/A'}
External Evidence: ${result.why_this_result?.external_evidence?.join('; ') || 'N/A'}
Disclaimer: Probabilistic model prediction. Not absolute fact.`;
    
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setNewsText('');
    setNewsTitle('');
    setArticleUrl('');
    setResult(null);
    setError(null);
    setBlockedNotice(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold uppercase tracking-wider">
          <Newspaper className="w-3.5 h-3.5" />
          <span>News Credibility & Claim Verification</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Verify News Articles & Claims
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
          Paste an article's text or submit a direct URL. TruthLens extracts claims, checks source reputation, examines linguistic markers, and cross-references external news indices.
        </p>
      </div>

      {/* Input Mode Selector */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex border-b border-slate-200 pb-3 justify-between items-center flex-wrap gap-2">
          <div className="flex space-x-2">
            <button
              onClick={() => { setMode('text'); setError(null); setBlockedNotice(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'text'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Paste Article Text
            </button>
            <button
              onClick={() => { setMode('url'); setError(null); setBlockedNotice(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'url'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Article URL
            </button>
          </div>

          {/* Quick Sample Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Quick Test:</span>
            <button
              type="button"
              onClick={() => loadSample(sampleRealNews)}
              className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 font-medium transition-colors"
            >
              Real News
            </button>
            <button
              type="button"
              onClick={() => loadSample(sampleFakeNews)}
              className="text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded border border-rose-200 font-medium transition-colors"
            >
              Fake News
            </button>
            <button
              type="button"
              onClick={() => loadSample(sampleBorderlineNews)}
              className="text-sky-700 bg-sky-50 hover:bg-sky-100 px-2 py-1 rounded border border-sky-200 font-medium transition-colors"
            >
              Borderline Case
            </button>
          </div>
        </div>

        {/* Input Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'text' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Headline / Title <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ISRO launches next-generation navigation satellite"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Article Body or Excerpt <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={6}
                  placeholder="Paste the complete news article text or major paragraphs here..."
                  value={newsText}
                  onChange={(e) => setNewsText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all leading-relaxed"
                />
                <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                  <span>Minimum 15 characters</span>
                  <span>{newsText.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  News Article URL <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://www.bbc.com/news/article-example"
                    value={articleUrl}
                    onChange={(e) => setArticleUrl(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  SSRF protected. TruthLens safely extracts article text, author, and publisher metadata without bypassing anti-bot measures.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Verification Signals...</span>
                </>
              ) : (
                <>
                  <span>Analyze News</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {(newsText || articleUrl || result) && (
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Website Blocked Graceful Notice (Per Section 1.B) */}
        {blockedNotice && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="font-semibold text-sm">Automated Extraction Unavailable</div>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {blockedNotice.message}
            </p>
            {blockedNotice.canPasteManually && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('text');
                    setBlockedNotice(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors"
                >
                  <Newspaper className="w-3.5 h-3.5" />
                  <span>Switch to Paste Text Mode</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analysis Results View */}
      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-3 duration-300">
          {/* Top Prediction & Confidence Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Verification Assessment
                </div>
                <div className="flex items-center gap-3">
                  <PredictionBadge prediction={result.prediction} size="lg" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyReport}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Report'}</span>
                </button>
              </div>
            </div>

            {/* Confidence Meter */}
            <ConfidenceMeter
              confidence={result.confidence}
              level={result.confidence_level}
              prediction={result.prediction}
            />

            {/* Title / Headline preview if present */}
            {(result.title || result.article_info?.title) && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 font-medium mb-1">Article Headline</div>
                <h2 className="text-base font-bold text-slate-900 leading-snug">
                  {result.title || result.article_info?.title}
                </h2>
              </div>
            )}

            {/* Why This Result (Strictly separated into Model Signals vs External Evidence) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">Why this result?</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Model Signals */}
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    <span>Model Linguistic Signals</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {result.why_this_result?.model_signals?.map((sig, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-slate-400 mt-0.5">•</span>
                        <span>{sig}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* External Evidence */}
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>External Corroboration Evidence</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {result.why_this_result?.external_evidence?.map((ev, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-slate-400 mt-0.5">•</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Source Credibility Component (Section 4) */}
          <SourceCredibilityCard
            sourceInfo={result.source_credibility}
            articleMetadata={result.article_info || {}}
            supportingCount={result.evidence_summary?.supporting_sources || 0}
            contradictingCount={result.evidence_summary?.contradicting_sources || 0}
          />

          {/* Key Detected Stylistic Signals */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Key Linguistic & Stylistic Indicators</span>
            </h3>
            <SignalList signals={result.signals} />
          </div>

          {/* Claim Verification & External Sources (Section 3) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Claim Verification & External Sources</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Core declarative claims extracted and cross-referenced with external news indices
                </p>
              </div>
            </div>

            {result.primary_claim && (
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
                  Extracted Primary Claim
                </div>
                <p className="text-sm font-medium text-slate-800 italic">
                  "{result.primary_claim}"
                </p>
              </div>
            )}

            {/* Evidence summary stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <div className="text-xs text-emerald-800 font-semibold">Supporting</div>
                <div className="text-xl font-bold text-emerald-900 mt-0.5">
                  {result.evidence_summary?.supporting_sources || 0}
                </div>
              </div>
              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
                <div className="text-xs text-rose-800 font-semibold">Contradicting</div>
                <div className="text-xl font-bold text-rose-900 mt-0.5">
                  {result.evidence_summary?.contradicting_sources || 0}
                </div>
              </div>
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg">
                <div className="text-xs text-slate-700 font-semibold">Inconclusive</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {result.evidence_summary?.inconclusive_sources || 0}
                </div>
              </div>
            </div>

            {/* List of related sources found */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Related Sources Identified
              </h4>
              {result.evidence_summary?.sources?.length > 0 ? (
                <div className="space-y-2.5">
                  {result.evidence_summary.sources.map((src, i) => (
                    <SourceCard key={i} source={src} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded border border-slate-200">
                  No matching headlines identified in public news feeds for this specific claim wording.
                </p>
              )}
            </div>
          </div>

          {/* Model Information & Academic Disclaimer */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2 border-b border-slate-200 pb-3">
              <div>
                <strong>Model:</strong> {result.model_info?.model_name || 'TF-IDF + Classifier'} ({result.model_info?.version})
              </div>
              <div>
                <strong>Feature Set:</strong> {result.model_info?.feature_type}
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
              <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <span>
                <strong>Warning:</strong> {result.disclaimer || 'This prediction is probabilistic and generated by an automated NLP model. It should not be treated as absolute fact.'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
