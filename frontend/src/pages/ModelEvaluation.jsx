import React, { useState, useEffect } from 'react';
import { Cpu, Database, CheckCircle2, AlertTriangle, Info, BookOpen, Layers, BarChart, ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function ModelEvaluation() {
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getModelEvaluation();
      setMetricsData(res.evaluation_data);
    } catch (err) {
      console.error("Error loading model metrics:", err);
      setError("Could not load evaluation metrics from backend. Ensure train.py has been run.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const newsEvaluation = metricsData?.news_detection;
  const reviewEvaluation = metricsData?.review_detection;
  const metadata = metricsData?.metadata;

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            <span>Developer Specs & Viva Benchmarks</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Empirical Model Evaluation
          </h1>
          <p className="text-sm text-slate-500">
            Real benchmark measurements recorded during training. No fabricated accuracy metrics.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Metrics</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          Loading evaluation metrics from server...
        </div>
      ) : metricsData?.status === "ready" ? (
        <div className="space-y-10">
          {/* Architecture & Pipeline Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-slate-900 text-base">Pipeline Architecture</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-medium">Feature Extraction</span>
                <strong className="text-slate-800 text-sm font-semibold">TF-IDF Vectorizer</strong>
                <p className="text-[11px] text-slate-500 mt-1">Unigrams & Bigrams (1, 2)</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-medium">Sublinear Scaling</span>
                <strong className="text-slate-800 text-sm font-semibold">Enabled (1 + log(tf))</strong>
                <p className="text-[11px] text-slate-500 mt-1">Dampens hyper-frequent terms</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-medium">Evaluation Split</span>
                <strong className="text-slate-800 text-sm font-semibold">80% Train / 20% Test</strong>
                <p className="text-[11px] text-slate-500 mt-1">Stratified class balance</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-medium">Trained Model Artifacts</span>
                <strong className="text-slate-800 text-sm font-semibold">Joblib Serialized</strong>
                <p className="text-[11px] text-slate-500 mt-1">Zero inference re-training</p>
              </div>
            </div>
          </div>

          {/* Section A: News Fake Detection Benchmark Comparison */}
          {newsEvaluation && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    News Detection Algorithm Comparison
                  </h3>
                  <p className="text-xs text-slate-500">
                    Evaluated across {newsEvaluation.dataset_samples} samples ({newsEvaluation.test_samples} held-out test records)
                  </p>
                </div>
                <div className="text-xs font-semibold text-sky-800 bg-sky-50 px-2.5 py-1 rounded border border-sky-200 self-start sm:self-auto">
                  Selected Algorithm: {newsEvaluation.selected_model}
                </div>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Model Architecture</th>
                      <th className="p-3">Accuracy</th>
                      <th className="p-3">Precision</th>
                      <th className="p-3">Recall</th>
                      <th className="p-3">F1-Score</th>
                      <th className="p-3">Confusion Matrix [TN, FP, FN, TP]</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {Object.entries(newsEvaluation.models_comparison || {}).map(([name, m]) => (
                      <tr key={name} className={name === newsEvaluation.selected_model ? 'bg-sky-50/50' : 'hover:bg-slate-50'}>
                        <td className="p-3 font-sans font-semibold text-slate-900">
                          {name}
                          {name === newsEvaluation.selected_model && (
                            <span className="ml-2 text-[10px] text-sky-600 bg-sky-100 px-1.5 py-0.5 rounded font-normal font-sans">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{m.accuracy}%</td>
                        <td className="p-3 text-slate-700">{m.precision}%</td>
                        <td className="p-3 text-slate-700">{m.recall}%</td>
                        <td className="p-3 font-bold text-sky-700">{m.f1_score}%</td>
                        <td className="p-3 text-slate-600 font-mono text-[11px]">
                          [{m.confusion_matrix?.[0]?.[0]}, {m.confusion_matrix?.[0]?.[1]}] / [{m.confusion_matrix?.[1]?.[0]}, {m.confusion_matrix?.[1]?.[1]}]
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Top N-gram features */}
              {newsEvaluation.top_features && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Most Influential Vocabulary Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-lg space-y-2">
                      <div className="text-xs font-bold text-rose-800 uppercase">Top Misinformation N-grams</div>
                      <div className="flex flex-wrap gap-1.5">
                        {newsEvaluation.top_features.fake_indicators?.map((f, i) => (
                          <span key={i} className="text-[11px] font-mono bg-white border border-rose-200 text-rose-800 px-2 py-0.5 rounded shadow-2xs">
                            {f.word} <span className="text-slate-400">({f.weight})</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg space-y-2">
                      <div className="text-xs font-bold text-emerald-800 uppercase">Top Credible/Journalistic N-grams</div>
                      <div className="flex flex-wrap gap-1.5">
                        {newsEvaluation.top_features.real_indicators?.map((f, i) => (
                          <span key={i} className="text-[11px] font-mono bg-white border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded shadow-2xs">
                            {f.word} <span className="text-slate-400">({f.weight})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section B: Review Detection Benchmark Comparison */}
          {reviewEvaluation && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Review Detection Algorithm Comparison
                  </h3>
                  <p className="text-xs text-slate-500">
                    Evaluated across {reviewEvaluation.dataset_samples} reviews ({reviewEvaluation.test_samples} held-out test records)
                  </p>
                </div>
                <div className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 self-start sm:self-auto">
                  Selected Algorithm: {reviewEvaluation.selected_model}
                </div>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Model Architecture</th>
                      <th className="p-3">Accuracy</th>
                      <th className="p-3">Precision</th>
                      <th className="p-3">Recall</th>
                      <th className="p-3">F1-Score</th>
                      <th className="p-3">Confusion Matrix [TN, FP, FN, TP]</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {Object.entries(reviewEvaluation.models_comparison || {}).map(([name, m]) => (
                      <tr key={name} className={name === reviewEvaluation.selected_model ? 'bg-amber-50/50' : 'hover:bg-slate-50'}>
                        <td className="p-3 font-sans font-semibold text-slate-900">
                          {name}
                          {name === reviewEvaluation.selected_model && (
                            <span className="ml-2 text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-normal font-sans">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{m.accuracy}%</td>
                        <td className="p-3 text-slate-700">{m.precision}%</td>
                        <td className="p-3 text-slate-700">{m.recall}%</td>
                        <td className="p-3 font-bold text-amber-700">{m.f1_score}%</td>
                        <td className="p-3 text-slate-600 font-mono text-[11px]">
                          [{m.confusion_matrix?.[0]?.[0]}, {m.confusion_matrix?.[0]?.[1]}] / [{m.confusion_matrix?.[1]?.[0]}, {m.confusion_matrix?.[1]?.[1]}]
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 24: Essential Real-World AI Limitation Principles for College Viva */}
          <div className="bg-slate-900 text-white rounded-xl p-8 space-y-5 border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
              <BookOpen className="w-5 h-5" />
              <h3>College Viva Defense: Why Fake News Detection is Inherent Probabilistic</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              In academic AI evaluation, claiming "100% infallible fake news detection" is fundamentally incorrect. In modern data science, fake-news detection must be presented as a <strong>probabilistic model assessment</strong> due to verified computational limitations:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-800/80 rounded-lg border border-slate-700/80 space-y-1">
                <strong className="text-amber-300">1. Temporal News Volatility:</strong>
                <p className="text-slate-400">News events evolve minute-by-minute. A true fact today may be superseded tomorrow, rendering static training sets time-bound.</p>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-lg border border-slate-700/80 space-y-1">
                <strong className="text-amber-300">2. Hybrid Information Mixing:</strong>
                <p className="text-slate-400">Sophisticated misinformation weaves 90% verifiable facts with 10% fabricated assertions, evading pure bag-of-words classifiers.</p>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-lg border border-slate-700/80 space-y-1">
                <strong className="text-amber-300">3. Satire & Irony Nuance:</strong>
                <p className="text-slate-400">Satirical sources (e.g. The Onion) mimic authentic journalistic sentence structures and grammar while stating fictional absurdities.</p>
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-lg border border-slate-700/80 space-y-1">
                <strong className="text-amber-300">4. Dataset Bias & Generalization:</strong>
                <p className="text-slate-400">Models inherit geographic, lexical, and topical biases from training corpora. Cross-source verification is essential to counterbalance algorithmic bias.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 space-y-3">
          <p className="text-sm text-slate-600">Model artifacts have not been serialized yet.</p>
          <p className="text-xs text-slate-400">Run <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">python backend/ml/train.py</code> to generate benchmark records.</p>
        </div>
      )}
    </div>
  );
}
