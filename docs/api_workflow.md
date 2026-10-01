# API Workflow & Endpoints Specification — TruthLens

The TruthLens backend provides modular REST endpoints built on FastAPI.

---

## 1. Base URL
All application endpoints are served under:
```
http://localhost:8000/api
```

---

## 2. Endpoints Reference

### 2.1 News Verification

#### `POST /api/news/analyze-text`
Analyzes raw news text or paragraphs.
- **Request Body**:
  ```json
  {
    "text": "The Indian Space Research Organisation announced...",
    "title": "Optional headline string"
  }
  ```
- **Response**:
  ```json
  {
    "id": 1,
    "input_type": "news_text",
    "prediction": "REAL",
    "confidence": 94.2,
    "confidence_level": "High",
    "signals": [...],
    "why_this_result": {
      "model_signals": [...],
      "external_evidence": [...]
    },
    "evidence_summary": {
      "supporting_sources": 3,
      "contradicting_sources": 0,
      "inconclusive_sources": 1,
      "sources": [...]
    },
    "model_info": {...},
    "disclaimer": "..."
  }
  ```

#### `POST /api/news/analyze-url`
Safely scrapes and verifies an online news article.
- **Request Body**:
  ```json
  {
    "url": "https://www.bbc.com/news/technology-68500000"
  }
  ```
- **Response (Success)**:
  Returns article title, publisher, author, published date, extracted text, and full credibility analysis.
- **Response (Blocked by Anti-Bot / 403)**:
  ```json
  {
    "success": false,
    "error_type": "extraction_blocked",
    "message": "We couldn't retrieve this article automatically because the publisher restricts automated access. Try pasting the article text instead.",
    "can_paste_manually": true
  }
  ```

#### `GET /api/news/latest`
Delivers live news stories filtered by category.
- **Query Parameters**:
  - `category`: `All` | `India` | `World` | `Technology` | `Business` | `Science` | `Health` | `Sports` | `Entertainment`
  - `query`: Optional search keyword
  - `limit`: Number of items (default: 15, max: 50)
  - `refresh`: Boolean (true bypasses 5-min TTL cache)

---

### 2.2 Review Authenticity

#### `POST /api/reviews/analyze`
Evaluates consumer product feedback for fake, bot, or incentivized markers.
- **Request Body**:
  ```json
  {
    "review_text": "I have been using these wireless headphones for about 3 weeks...",
    "product_name": "Sony WH-1000XM4",
    "category": "Electronics"
  }
  ```
- **Response**:
  ```json
  {
    "id": 2,
    "prediction": "GENUINE",
    "confidence": 88.5,
    "confidence_level": "High",
    "detected_signals": [...],
    "signals_breakdown": {
      "promotional_intensity": 10,
      "sentiment_extremity": 25,
      "syntactic_repetition": 0,
      "product_specificity": 80,
      "punctuation_intensity": 10
    },
    "sentiment_label": "Balanced / Moderate",
    "length_profile": "Standard Length",
    "reasons": [...]
  }
  ```

---

### 2.3 Standalone Claim Verification

#### `POST /api/verification/verify-claim`
Cross-references a single factual assertion with open news and reference sources.
- **Request Body**:
  ```json
  {
    "claim": "NASA announced humans will live permanently on Mars by 2027."
  }
  ```

---

### 2.4 History & Analytics

#### `GET /api/history`
Retrieves past records with filtering by `input_type`, `prediction`, and `search`.

#### `GET /api/history/dashboard/stats`
Computes verified aggregate counts (total, articles, reviews, real/fake/suspicious counts, average confidence, most frequent suspicious signals). Strictly returns `has_history: false` if database is empty.

#### `DELETE /api/history/{id}`
Removes a specific analysis record from the database.

---

### 2.5 Developer & Evaluation Specs

#### `GET /api/model/evaluation`
Returns authentic model metrics loaded from `backend/ml/saved_models/evaluation_metrics.json`.
