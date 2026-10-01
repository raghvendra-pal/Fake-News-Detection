import React, { useState, useEffect } from 'react';
import { BarChart3, History, Trash2, ExternalLink, Eye, AlertCircle, CheckCircle2, AlertTriangle, ShieldCheck, Search, Filter, RefreshCw, Calendar, Tag } from 'lucide-react';
import { api } from '../services/api';
import PredictionBadge from '../components/PredictionBadge';
import Modal from '../components/Modal';

export default function Dashboard({ onReanalyze }) {
  const [activeSubTab, setActiveSubTab] = useState('analytics'); // 'analytics' | 'history'
  const [stats, setStats] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [totalHistory, setTotalHistory] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterType, setFilterType] = useState('all');
  const [filterPred, setFilterPred] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail Modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load stats
      const statsData = await api.getDashboardStats();
      setStats(statsData);

      // Load history
      const params = {};
      if (filterType !== 'all') params.input_type = filterType;
      if (filterPred !== 'all') params.prediction = filterPred;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const histData = await api.getHistory(params);
      setHistoryItems(histData.items || []);
      setTotalHistory(histData.total || 0);
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setError("Failed to load analytics and history from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterType, filterPred]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this analysis record from history?")) return;
    try {
      await api.deleteHistoryItem(id);
      loadData();
      if (selectedRecord?.id === id) {
        setModalOpen(false);
      }
    } catch (err) {
      alert("Failed to delete record.");
    }
  };

  const handleOpenDetail = async (id) => {
    try {
      const data = await api.getHistoryDetail(id);
      setSelectedRecord(data);
      setModalOpen(true);
    } catch (err) {
      alert("Could not load record details.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Telemetry & Records</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Analytics & Verification History
          </h1>
          <p className="text-sm text-slate-500">
            Real-time inspection of past analyses stored securely in the SQLite database.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex">
            <button
              onClick={() => setActiveSubTab('analytics')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeSubTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Analytics Overview
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeSubTab === 'history'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              History Log ({totalHistory})
            </button>
          </div>

          <button
            onClick={loadData}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics Overview Tab */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          {stats && !stats.has_history ? (
            /* Strict requirement Section 13: Display "No analysis history available" if no records exist */
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8 space-y-3">
              <History className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No analysis history available</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No articles or reviews have been analyzed yet. Run an analysis in the News Checker or Review Checker to generate verified analytics.
              </p>
            </div>
          ) : stats && stats.has_history ? (
            <>
              {/* Stat Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Analyzed</div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{stats.total_analyzed}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Verified records</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Articles Analyzed</div>
                  <div className="text-2xl sm:text-3xl font-bold text-sky-700 mt-1">{stats.articles_analyzed}</div>
                  <div className="text-[11px] text-slate-400 mt-1">News text & URLs</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reviews Analyzed</div>
                  <div className="text-2xl sm:text-3xl font-bold text-amber-700 mt-1">{stats.reviews_analyzed}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Consumer reviews</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Confidence</div>
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1">{stats.average_confidence}%</div>
                  <div className="text-[11px] text-slate-400 mt-1">Across all models</div>
                </div>
              </div>

              {/* Predictions Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Prediction Outcomes Distribution
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-emerald-700 font-semibold">Real / Genuine Information</span>
                        <span className="text-slate-900 font-bold">{stats.real_predictions}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{
                            width: `${stats.total_analyzed ? (stats.real_predictions / stats.total_analyzed) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-amber-700 font-semibold">Suspicious / Uncertain Information</span>
                        <span className="text-slate-900 font-bold">{stats.suspicious_predictions}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{
                            width: `${stats.total_analyzed ? (stats.suspicious_predictions / stats.total_analyzed) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-rose-700 font-semibold">Fake / Misleading Information</span>
                        <span className="text-slate-900 font-bold">{stats.fake_predictions}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full"
                          style={{
                            width: `${stats.total_analyzed ? (stats.fake_predictions / stats.total_analyzed) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Most Common Detected Suspicious Signals */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Most Frequent Suspicious Signals
                  </h3>

                  {stats.most_common_signals?.length > 0 ? (
                    <div className="space-y-2.5">
                      {stats.most_common_signals.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                          <span className="font-semibold text-slate-800">{item.signal}</span>
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                            {item.count} occurrences
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No recurring red-flag signals identified yet.</p>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* History Log Tab */}
      {activeSubTab === 'history' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700"
              >
                <option value="all">All Input Types</option>
                <option value="news_text">News Text</option>
                <option value="news_url">News URL</option>
                <option value="review">Reviews</option>
              </select>

              <select
                value={filterPred}
                onChange={(e) => setFilterPred(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700"
              >
                <option value="all">All Predictions</option>
                <option value="REAL">Real / Genuine</option>
                <option value="SUSPICIOUS">Suspicious</option>
                <option value="FAKE">Fake / Deceptive</option>
              </select>
            </div>

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search history records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-16 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 px-2 py-0.5 bg-slate-800 text-white rounded text-[11px]"
              >
                Go
              </button>
            </form>
          </div>

          {/* History List */}
          {historyItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8 space-y-2">
              <History className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No matching records</h3>
              <p className="text-xs text-slate-500">No analysis entries match the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenDetail(item.id)}
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded font-mono font-medium text-[11px] bg-slate-100 text-slate-700 uppercase">
                        {item.input_type.replace('_', ' ')}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400 text-[11px]">
                        {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-[11px] text-slate-500 font-mono">{item.model_version}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 truncate group-hover:text-sky-700 transition-colors">
                      {item.query_preview}
                    </h4>

                    {item.source_url && (
                      <p className="text-xs text-sky-600 truncate max-w-lg">
                        {item.source_url}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <PredictionBadge prediction={item.prediction} size="sm" />
                      <div className="text-[11px] font-bold text-slate-600 mt-1">
                        {item.confidence}% Conf.
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal for full inspection */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Analysis Details Record"
      >
        {selectedRecord && (
          <div className="space-y-5 text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <PredictionBadge prediction={selectedRecord.prediction} size="lg" />
              <div className="text-right">
                <div className="text-xs text-slate-500 font-medium">Confidence Score</div>
                <div className="text-lg font-bold text-slate-900">{selectedRecord.confidence}%</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <strong>Input Type:</strong> {selectedRecord.input_type}
              </div>
              <div>
                <strong>Timestamp:</strong> {selectedRecord.created_at}
              </div>
              <div>
                <strong>Model Version:</strong> {selectedRecord.model_version}
              </div>
              {selectedRecord.source_url && (
                <div className="truncate col-span-2">
                  <strong>Source:</strong>{' '}
                  <a
                    href={selectedRecord.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-600 hover:underline"
                  >
                    {selectedRecord.source_url}
                  </a>
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-bold text-slate-700 uppercase mb-1">Preview / Content Excerpt</div>
              <div className="p-3 bg-slate-100 rounded text-xs text-slate-800 max-h-40 overflow-y-auto leading-relaxed">
                {selectedRecord.content}
              </div>
            </div>

            {selectedRecord.signals?.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase">Detected Signals</div>
                <div className="space-y-1">
                  {selectedRecord.signals.map((sig, i) => (
                    <div key={i} className="text-xs p-2 rounded bg-amber-50 border border-amber-200 text-amber-900">
                      <strong>{sig.name}:</strong> {sig.description}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
