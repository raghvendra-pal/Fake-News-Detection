# Database Design & Architecture — TruthLens

TruthLens uses a lightweight, zero-configuration **SQLite** database via **SQLAlchemy ORM** for local student development, engineered with migration readiness for enterprise **PostgreSQL**.

---

## 1. Entity-Relationship Schema

### Table: `analysis_history`

| Column Name | SQL Type | Nullable | Indexed | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | No | Primary Key | Auto-incrementing identifier. |
| `input_type` | `VARCHAR(50)` | No | Yes | `'news_text'`, `'news_url'`, or `'review'`. |
| `query_preview` | `VARCHAR(255)` | No | No | Short title or headline snippet for quick listing. |
| `content` | `TEXT` | No | No | Full article body, excerpt, or review text. |
| `source_url` | `VARCHAR(512)` | Yes | No | Original URL if input was a web link. |
| `prediction` | `VARCHAR(50)` | No | Yes | `'REAL'`, `'SUSPICIOUS'`, `'FAKE'`, `'GENUINE'`. |
| `confidence` | `FLOAT` | No | No | Calibrated percentage score ($0.0 - 100.0$). |
| `signals` | `JSON` | Yes | No | Array of detected stylistic/linguistic indicators. |
| `claims` | `JSON` | Yes | No | Array of extracted declarative claims. |
| `evidence_summary`| `JSON` | Yes | No | External source counts, stances, and citations. |
| `metadata_info` | `JSON` | Yes | No | Publisher, author, published date, product name. |
| `model_version` | `VARCHAR(50)` | Yes | No | Model tracking tag (e.g. `'1.0.0-tfidf'`). |
| `created_at` | `DATETIME` | No | Yes | UTC timestamp of submission. |

---

## 2. Design Rationale

### 2.1 Hybrid Relational + JSON Structure
- **Structured Fields** (`input_type`, `prediction`, `created_at`):
  Indexed for fast aggregate filtering, time-range querying, and dashboard calculations.
- **Semi-Structured Fields** (`signals`, `evidence_summary`, `metadata_info`):
  Stored as JSON objects. This allows rich explainability signals and source cards to evolve without requiring repeated database migration alters. Both SQLite (via JSON1 extension) and PostgreSQL (via native `JSONB`) support this seamlessly.

### 2.2 Indexing Strategy
- `idx_analysis_history_input_type`: Accelerates category segregation (`news` vs `reviews`).
- `idx_analysis_history_prediction`: Accelerates dashboard outcome distribution queries.
- `idx_analysis_history_created_at`: Enables instant reverse-chronological sorting (`ORDER BY created_at DESC`).

---

## 3. Migration Guide to PostgreSQL

To deploy TruthLens to production using PostgreSQL:

1. Update the database URL in `.env`:
   ```bash
   DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/truthlens_db
   ```
2. Install the PostgreSQL database driver in Python:
   ```bash
   pip install psycopg2-binary
   ```
3. The SQLAlchemy models in `backend/database/models.py` utilize standard ANSI SQL types and portable JSON columns, enabling immediate schema creation on PostgreSQL without altering application code.
