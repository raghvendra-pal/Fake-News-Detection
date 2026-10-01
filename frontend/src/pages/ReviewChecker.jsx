import React, { useState } from 'react';
import { Star, AlertCircle, CheckCircle2, ArrowRight, Loader2, Sparkles, AlertTriangle, Info, Copy, Check } from 'lucide-react';
import { api } from '../services/api';
import PredictionBadge from '../components/PredictionBadge';
import ConfidenceMeter from '../components/ConfidenceMeter';
import SignalList from '../components/SignalList';

export default function ReviewChecker({ initialText = '' }) {
  const [reviewText, setReviewText] = useState(initialText || '');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('General');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Pre-configured review samples for viva demo
  const sampleGenuine = {
    productName: "Sony WH-1000XM4 Noise-Cancelling Headphones",
    category: "Electronics",
    text: "I have been using these headphones for about three weeks now during my daily metro commute. The active noise cancellation handles low-frequency train rumble well, though nearby voices still bleed through slightly. Battery life averages around 28 hours on a single charge with ANC enabled. Build quality feels sturdy with comfortable memory foam padding, though the earcups can get slightly warm after two hours of continuous use. Overall, worth the investment for frequent travelers."
  };

  const sampleSuspicious = {
    productName: "Ultra Glow Skin Serum",
    category: "Health & Personal Care",
    text: "This product is absolutely amazing! Best product ever created in the universe. Everyone should buy this immediately without thinking twice! Outstanding miracle item! Truly magnificent craftsmanship, superior superior superior! 1000% recommended to every human being on earth! Completely mindblowing performance! 10/10 perfect! Buy buy buy!"
  };

  const sampleNegativeSpam = {
    productName: "Apex Gaming Mouse",
    category: "Electronics",
    text: "Worst garbage ever made! Scam company! Total fraud, broke in one second! Do not trust this seller, complete cheater! Burned my whole desk down! Reported to consumer court immediately! Zero stars if possible! Horrible disaster trash!"
  };

  const loadSample = (sample) => {
    setProductName(sample.productName);
    setCategory(sample.category);
    setReviewText(sample.text);
    setError(null);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);
    setResult(null);

    if (!reviewText.trim() || reviewText.trim().length < 10) {
      setError("Please provide a product review before continuing (at least 10 characters).");
      return;
    }

    try {
      setLoading(true);
      const data = await api.analyzeReview(reviewText.trim(), productName.trim(), category);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to analyze review. Please check server connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const reportText = `[TruthLens Review Authenticity Report]
Assessment: ${result.prediction} (${result.confidence}% ${result.confidence_level} Confidence)
Product: ${result.product_name || 'Unspecified'} (${result.category || 'General'})
Detected Signals: ${result.detected_signals?.map(s => s.name).join(', ') || 'None detected'}
Sentiment: ${result.sentiment_label}
Reasons: ${result.reasons?.join('; ') || 'N/A'}
Disclaimer: Automated model prediction. Not definitive proof.`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setReviewText('');
    setProductName('');
    setCategory('General');
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-wider">
          <Star className="w-3.5 h-3.5" />
          <span>Deceptive Review & Spam Detection</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Check Product Review Authenticity
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
          Paste consumer reviews to evaluate whether they reflect genuine hands-on product experiences or synthetic, incentivized, and promotional bot patterns.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Review Submission Form
          </span>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Quick Test:</span>
            <button
              type="button"
              onClick={() => loadSample(sampleGenuine)}
              className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 font-medium transition-colors"
            >
              Genuine Review
            </button>
            <button
              type="button"
              onClick={() => loadSample(sampleSuspicious)}
              className="text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded border border-amber-200 font-medium transition-colors"
            >
              Promo Hype (Fake)
            </button>
            <button
              type="button"
              onClick={() => loadSample(sampleNegativeSpam)}
              className="text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded border border-rose-200 font-medium transition-colors"
            >
              Rage Spam (Fake)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Wireless ANC Headphones"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Category <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-white"
              >
                <option value="General">General Category</option>
                <option value="Electronics">Electronics & Gadgets</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Apparel">Apparel & Footwear</option>
                <option value="Books">Books & Media</option>
                <option value="Health & Personal Care">Health & Personal Care</option>
                <option value="Furniture">Furniture & Decor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Review Text <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              placeholder="Paste the consumer review text to analyze..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all leading-relaxed"
            />
            <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
              <span>Minimum 10 characters</span>
              <span>{reviewText.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Review Signals...</span>
                </>
              ) : (
                <>
                  <span>Analyze Review</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {(reviewText || productName || result) && (
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

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Review Results Section */}
      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-3 duration-300">
          {/* Prediction and Meter */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Review Authenticity Assessment
                </div>
                <div className="flex items-center gap-3">
                  <PredictionBadge prediction={result.prediction} size="lg" />
                </div>
              </div>

              <button
                onClick={handleCopyReport}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Report'}</span>
              </button>
            </div>

            <ConfidenceMeter
              confidence={result.confidence}
              level={result.confidence_level}
              prediction={result.prediction}
            />

            {/* Reasons Summary */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-4 h-4 text-sky-600" />
                <span>Model Decision Rationale</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {result.reasons?.map((reason, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-slate-400">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Visual Signal Breakdown (Section 11) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Signal Breakdown Analysis</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Granular detection scores across key linguistic and deceptive indicators
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Promotional Intensity */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Promotional Hyperbole & Superlatives</span>
                  <span>{result.signals_breakdown?.promotional_intensity || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (result.signals_breakdown?.promotional_intensity || 0) > 40 ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                    style={{ width: `${result.signals_breakdown?.promotional_intensity || 0}%` }}
                  />
                </div>
              </div>

              {/* Syntactic Repetition */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Keyword & Token Repetition</span>
                  <span>{result.signals_breakdown?.syntactic_repetition || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (result.signals_breakdown?.syntactic_repetition || 0) > 30 ? 'bg-rose-500' : 'bg-slate-300'
                    }`}
                    style={{ width: `${result.signals_breakdown?.syntactic_repetition || 0}%` }}
                  />
                </div>
              </div>

              {/* Product Specificity */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Concrete Product Specificity (Higher is better)</span>
                  <span>{result.signals_breakdown?.product_specificity || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-emerald-500"
                    style={{ width: `${result.signals_breakdown?.product_specificity || 0}%` }}
                  />
                </div>
              </div>

              {/* Sentiment Extremity */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Sentiment Extremity / Polar Saturation</span>
                  <span>{result.signals_breakdown?.sentiment_extremity || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (result.signals_breakdown?.sentiment_extremity || 0) > 60 ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                    style={{ width: `${result.signals_breakdown?.sentiment_extremity || 0}%` }}
                  />
                </div>
              </div>

              {/* Punctuation Intensity */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>Punctuation Spam (Exclamations/Question density)</span>
                  <span>{result.signals_breakdown?.punctuation_intensity || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (result.signals_breakdown?.punctuation_intensity || 0) > 30 ? 'bg-rose-500' : 'bg-slate-300'
                    }`}
                    style={{ width: `${result.signals_breakdown?.punctuation_intensity || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Profile tags */}
            <div className="flex items-center gap-3 pt-2 text-xs border-t border-slate-100 text-slate-500">
              <div>Sentiment: <strong className="text-slate-800">{result.sentiment_label}</strong></div>
              <span>•</span>
              <div>Length: <strong className="text-slate-800">{result.length_profile}</strong></div>
            </div>
          </div>

          {/* Detected Signals List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Detected Signals List</span>
            </h3>
            <SignalList signals={result.detected_signals} />
          </div>

          {/* Model Information & Disclaimer */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2 border-b border-slate-200 pb-3">
              <div>
                <strong>Model:</strong> {result.model_info?.model_name || 'TF-IDF + Classifier'} ({result.model_info?.version})
              </div>
              <div>
                <strong>Feature Extraction:</strong> {result.model_info?.feature_type}
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
              <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <span>
                <strong>Warning:</strong> {result.disclaimer || 'This analysis represents an automated model prediction and should not be treated as a definitive statement of authenticity.'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
