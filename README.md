# TruthLens — AI-Powered Fake News & Review Detection System

> **"Check Before You Believe."**  
> A full-stack, machine-learning-driven platform for verifying the credibility of news articles, extracting declarative claims, cross-referencing external news sources, and detecting deceptive consumer product reviews.

---

## 1. Project Overview

TruthLens addresses the critical challenge of online disinformation and deceptive e-commerce feedback. Engineered as a serious, production-grade AI and full-stack software system, it avoids black-box predictions by combining:
1. **Statistical NLP Classifiers**: TF-IDF feature extraction with Logistic Regression, Linear SVM, Multinomial Naive Bayes, and Random Forest.
2. **Deterministic Linguistic Signal Analysis**: Quantifying sensational clickbait lexicon, absolute certainty markers, emotional punctuation, uppercase anomalies, and promotional hyperbole.
3. **External Real-Time Sourcing**: Searching open news indices to tally supporting, contradicting, and inconclusive reports on focal claims.
4. **Source Credibility Registry**: Referencing factual publisher directories with transparent notice when domain credibility data is unavailable (no fabricated scores).

---

## 2. Key Features

- **Dual-Mode News Verification**:
  - **Paste Text**: Analyze raw news excerpts or full paragraphs.
  - **Paste URL**: SSRF-protected extraction of article title, publisher, author, date, and text without bypassing website anti-bot protections.
- **Deceptive Review Checker**:
  - Detects promotional hyperbole, extreme sentiment polarity, repetition patterns, and lack of tangible product experience.
- **Daily Live News Wire**:
  - Configurable multi-provider architecture (NewsAPI, GNews, or zero-config Open Public RSS feeds).
  - Categorized browsing: All, India, World, Technology, Business, Science, Health, Sports, Entertainment.
  - One-click **"Verify in TruthLens"** integration directly from the news feed.
- **Explainable AI (XAI)**:
  - Strictly distinguishes **Model Linguistic Signals** from **External Evidence**.
  - Provides clear, transparent rationales behind every prediction.
- **Empirical Model Evaluation Dashboard**:
  - Authentic metrics recorded from real training runs (Accuracy, Precision, Recall, F1, and Confusion Matrices).
  - Top n-gram vocabulary indicators for both fake and real classes.
- **Analytics & History**:
  - Stores all historical analyses in an indexed SQLite database with JSON explainability fields.
  - Search, filter, view full details in modal, or delete records.

---

## 3. System Architecture Diagram

```
+─────────────────────────────────────────────────────────────────────────────+
│                                CLIENT TIER                                  │
│   React 18 (Vite) + Tailwind CSS + Lucide Icons                             │
│   ├── Home (Hero, Workflow, Viva Test Samples)                              │
│   ├── News Checker (Text & URL Analysis, SSRF Safe)                         │
│   ├── Review Checker (Promotional Hype, Polarity & Specificity Meters)      │
│   ├── Latest News Wire (Category Feed, Search, 1-Click Verification)        │
│   ├── Analytics & History (SQLite History, Search, Deletion, Modals)        │
│   └── Developer Specs (Real Model Benchmarks, Confusion Matrices)           │
+──────────────────────────────────────┬──────────────────────────────────────+
                                       │ HTTP REST (JSON)
                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
│                               BACKEND TIER                                  │
│   FastAPI (Python 3.10+)                                                    │
│   ├── /api/news (Text Analysis, URL Extractor, Latest RSS News)             │
│   ├── /api/reviews (Authenticity Analysis & Signal Breakdown)               │
│   ├── /api/verification (Cross-Source Claim Corroborator)                   │
│   ├── /api/history (CRUD Operations & Dashboard Aggregates)                 │
│   └── /api/model (Benchmark Specs & N-gram Weights)                         │
+───────────────────┬─────────────────────────────────────┬───────────────────+
                    │                                     │
                    ▼                                     ▼
+──────────────────────────────────────+   +──────────────────────────────────+
│          DATA STORAGE TIER           │   │      MACHINE LEARNING TIER       │
│  SQLite (SQLAlchemy ORM)             │   │  Scikit-Learn ML Pipeline        │
│  - Table: analysis_history           │   │  - TF-IDF (1-2 N-Grams, 5k Dim)  │
│  - Structured & JSON Columns         │   │  - Logistic Regression / SVM /   │
│  - Migration-ready for PostgreSQL    │   │    Naive Bayes / Random Forest   │
│                                      │   │  - Serialized Artifacts (.joblib)│
+──────────────────────────────────────+   +──────────────────────────────────+
```

---

## 4. Technologies Used

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Axios
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic, Requests, BeautifulSoup4
- **Machine Learning**: Scikit-Learn, Pandas, NumPy, Joblib
- **Database**: SQLite, SQLAlchemy ORM

---

## 5. Machine Learning Pipeline & Evaluation

### 5.1 Training Pipeline
Run the offline training pipeline to clean data, train models, compute metrics, and serialize artifacts:
```bash
python backend/ml/train.py
```

### 5.2 Algorithm Benchmark Results (Empirical Test Set)

| Model Architecture | Task | Accuracy | Precision | Recall | F1-Score |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Multinomial Naive Bayes** | News Fake Detection | **100.0%** | **100.0%** | **100.0%** | **100.0%** |
| **Logistic Regression** | News Fake Detection | **94.44%** | **100.0%** | **88.89%** | **94.12%** |
| **Linear SVM (Calibrated)** | News Fake Detection | **94.44%** | **100.0%** | **88.89%** | **94.12%** |
| **Random Forest** | News Fake Detection | **94.44%** | **100.0%** | **88.89%** | **94.12%** |
| **Logistic Regression** | Fake Review Detection | **100.0%** | **100.0%** | **100.0%** | **100.0%** |

*Note: All evaluations performed on stratified 20% test holdout datasets.*

---

## 6. Installation & Quick Start

### 6.1 Prerequisites
- Python 3.10 or higher
- Node.js v18 or higher & npm

### 6.2 Backend Setup
```bash
# 1. Navigate to project root
cd ProjBYantigravity

# 2. Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 3. Install dependencies
pip install -r backend/requirements.txt

# 4. Generate datasets and train models (if not already trained)
python backend/ml/datasets/generate_datasets.py
python backend/ml/train.py

# 5. Run Backend Server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be accessible at: `http://127.0.0.1:8000`  
Interactive Swagger API Documentation: `http://127.0.0.1:8000/docs`

### 6.3 Frontend Setup
```bash
# 1. In a new terminal, navigate to frontend
cd frontend

# 2. Install packages
npm install

# 3. Start development server
npm run dev
```
Frontend will be accessible at: `http://localhost:5173`

---

## 7. Environment Variables (`.env`)

Create `.env` in `backend/.env` (or copy from `.env.example`):
```ini
MODEL_TYPE=tfidf
DATABASE_URL=sqlite:///./truthlens.db

# Optional News API Keys (system falls back to open RSS news feeds if omitted)
NEWS_API_KEY=
GNEWS_API_KEY=

HOST=127.0.0.1
PORT=8000
DEBUG=True
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
REQUEST_TIMEOUT_SECONDS=10
```

---

## 8. Automated Testing

Run the automated integration test suite:
```bash
python backend/tests/test_suite.py
```
Validates:
- Health check endpoint
- Real & Fake news text classification
- Genuine & Fake product review classification
- Daily news feed retrieval
- SQLite database persistence and dashboard telemetry
- Developer model evaluation metrics

---

## 9. Academic Limitations & Real-World Considerations

As documented in `docs/viva_questions.md`, fake news detection is inherently **probabilistic**:
1. **Dynamic Real-World Events**: Static training corpora cannot predict tomorrow's breaking news.
2. **Hybrid Truths**: Disinformation frequently weaponizes 90% verifiable facts with 10% fabricated assertions.
3. **Satire**: High-quality satire (*The Onion*) mimics professional journalistic grammar while describing absurd scenarios.
4. **Dataset Generalization**: Classifiers reflect regional and lexical patterns of their training data.

TruthLens therefore uses language such as **"Model Assessment"** rather than claiming **"Absolute Truth"**.

---

## 10. Documentation Index

- [System Architecture](docs/architecture.md)
- [ML & NLP Workflow](docs/ml_workflow.md)
- [API Workflow Specification](docs/api_workflow.md)
- [Database Design & Migration](docs/database_design.md)
- [Viva Questions & Answers](docs/viva_questions.md)
- [Future Scope](docs/future_scope.md)

---

## 11. License
Academic Open-Source — Developed for Educational Research and College Project Presentations.
