# System Architecture — TruthLens

TruthLens is an end-to-end, full-stack Natural Language Processing (NLP) system designed to detect disinformation in news reporting and deceptive patterns in consumer product reviews.

---

## 1. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|                                                                                   |
|    React 18 SPA (Vite) + Tailwind CSS + Lucide Icons + Axios API Layer            |
|    [News Checker]    [Review Checker]    [Latest News]    [Analytics / Specs]     |
+------------------------------------------+----------------------------------------+
                                           | HTTP / REST (JSON)
                                           v
+-----------------------------------------------------------------------------------+
|                                 BACKEND TIER                                      |
|                                                                                   |
|    FastAPI (Uvicorn ASGI)                                                         |
|    ├── Security & SSRF Protection (IP & DNS Resolution Filter)                    |
|    ├── Article Extractor (HTML Parser, Metadata, Bot Protection Respecter)        |
|    ├── Signal Analyzer (Sensationalism, Certainty, Repetition, Punctuation)       |
|    ├── Verification Layer (Live News RSS / Wikipedia Claim Corroborator)          |
|    ├── Credibility Directory (Verified Registry / Graceful Unknown Notice)       |
|    ├── Multi-Provider News Feed (NewsAPI / GNews / Open RSS Fallback)             |
|    └── Unified Predictor (Calibrated Probabilities + Explainable AI Engine)       |
+------------------------------------------+----------------------------------------+
                      |                                    |
                      v                                    v
+-----------------------------+          +-----------------------------------------+
|      DATA STORAGE TIER      |          |            MACHINE LEARNING TIER        |
|                             |          |                                         |
|  SQLite (SQLAlchemy ORM)    |          |  Scikit-Learn ML Pipeline               |
|  - Table: analysis_history  |          |  - TF-IDF Vectorizer (Unigrams/Bigrams) |
|  - JSON-compatible fields   |          |  - Models: Logistic Regression, Linear  |
|  - PostgreSQL migration     |          |    SVM, Naive Bayes, Random Forest      |
|    ready schema             |          |  - Serialized Artifacts (.joblib)       |
|                             |          |  - Metrics Benchmark (JSON)             |
+-----------------------------+          +-----------------------------------------+
```

---

## 2. Key Architecture Principles

### 2.1 Multi-Layered Hybrid Verification
Unlike shallow classifiers that rely purely on bag-of-words or synthetic probabilities, TruthLens evaluates information through three independent layers:
1. **Statistical NLP Layer**: Computes vocabulary and sequence likelihood using TF-IDF n-grams trained on stratified benchmark corpora.
2. **Deterministic Linguistic Signal Layer**: Measures surface-level stylistic markers (sensational clickbait density, extreme certainty, emotional punctuation, capitalization ratio, promotional superlatives).
3. **External Real-Time Sourcing Layer**: Queries live open news indices (Google News RSS and reference feeds) to find supporting, contradicting, or inconclusive reports regarding the focal claim.

### 2.2 Transparent Explainability (XAI)
The system strictly distinguishes:
- **Model Signals**: Internal observations derived from vocabulary weights and linguistic syntax.
- **External Evidence**: Factual corroboration or refutation found in indexed news feeds.

### 2.3 SSRF & Web Scraping Ethics
When fetching articles via URL:
- Validates URL syntax and performs DNS resolution to block access to private, loopback (127.0.0.1), link-local (169.254.x.x), or internal CIDR blocks.
- If a publisher returns HTTP 401, 403, Cloudflare/Captcha, or blocking anti-bot protections, TruthLens strictly **does not attempt to bypass security mechanisms**. It returns an informative error and prompts the user to paste the article text manually.

### 2.4 Resilient Multi-Provider Strategy
- Open public news feeds are provided as the default out-of-the-box fallback.
- If `NEWS_API_KEY` or `GNEWS_API_KEY` are provided in `.env`, the system automatically routes to the respective paid/freemium API provider without code modifications.
