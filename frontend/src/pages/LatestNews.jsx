import React, { useState, useEffect } from 'react';
import { Globe, Search, RefreshCw, ExternalLink, ShieldCheck, Calendar, Building2, Tag, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function LatestNews({ onVerifyArticle }) {
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    'All', 'India', 'World', 'Technology', 'Business', 'Science', 'Health', 'Sports', 'Entertainment'
  ];

  const fetchNews = async (cat = category, query = searchQuery, force = false) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await api.getLatestNews(cat, query, 24, force);
      setNewsList(data.articles || []);
    } catch (err) {
      console.error("Error fetching latest news:", err);
      setError("News feed service is temporarily unavailable or network failed. Please try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews(category, searchQuery);
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNews(category, searchQuery);
  };

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>Daily News Wire</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Latest News Feed
          </h1>
          <p className="text-sm text-slate-500">
            Real-time news stories across global and national categories. Click "Verify in TruthLens" on any article to run full ML credibility checks.
          </p>
        </div>

        <button
          onClick={() => fetchNews(category, searchQuery, true)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-sky-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search headline keywords across news feeds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-24 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); fetchNews(category, ''); }}
              className="absolute right-20 top-2 text-xs text-slate-400 hover:text-slate-600 px-2 py-0.5"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Content Area */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold">{error}</div>
            <p className="mt-0.5 text-slate-600">The configured news provider could not be reached. Try switching categories or refreshing.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-full"></div>
              <div className="h-16 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : newsList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8 space-y-3">
          <Globe className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No News Articles Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No headlines currently match your search criteria in the "{category}" category. Try clearing filters.
          </p>
          <button
            onClick={() => { setCategory('All'); setSearchQuery(''); fetchNews('All', '', true); }}
            className="px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-lg hover:bg-sky-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((article, idx) => (
            <article
              key={article.id || idx}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group"
            >
              {article.image_url && (
                <div className="h-44 w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                  <img
                    src={article.image_url}
                    alt={article.headline}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-sky-800 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{article.publisher}</span>
                    </span>
                    <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      {article.category}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-sky-700 transition-colors">
                    {article.headline}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {article.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{article.published_date ? new Date(article.published_date).toLocaleDateString() : 'Recent'}</span>
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                      {article.verification_status || 'Unverified Feed'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-medium"
                      >
                        <span>Original</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <button
                      onClick={() => onVerifyArticle(article.url || article.headline)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold transition-colors ml-auto shadow-2xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                      <span>Verify in TruthLens</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
