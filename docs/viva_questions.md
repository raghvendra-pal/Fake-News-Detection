# College Viva Questions & Answers — TruthLens

This guide prepares students to defend **TruthLens — AI-Powered Fake News & Review Detection System** during academic evaluations, viva voce, and project presentations.

---

### Q1. What is the core objective of the TruthLens project?
**Answer:** TruthLens is an AI-powered credibility verification platform that assesses textual content across two distinct domains: (1) news articles/claims and (2) consumer product reviews. It classifies inputs as REAL / GENUINE, SUSPICIOUS / UNCERTAIN, or FAKE using a combination of TF-IDF feature extraction, classical machine learning classifiers, stylistic signal heuristics, and real-time external cross-source corroboration.

---

### Q2. Why did you choose TF-IDF over deep neural networks or Transformers for the primary model?
**Answer:** 
1. **Computational Efficiency & Portability**: TF-IDF paired with Logistic Regression or Linear SVM executes in milliseconds on standard consumer laptops without requiring dedicated GPU acceleration.
2. **Interpretability & Explainability**: Linear models allow direct inspection of feature weights and n-gram coefficients, enabling us to pinpoint exact words (e.g. *"miracle cure"*, *"censored"*) driving predictions.
3. **Data Efficiency**: Transformers (like BERT/RoBERTa) require large-scale fine-tuning datasets to prevent catastrophic forgetting and overfitting, whereas TF-IDF with sublinear scaling achieves robust baseline performance on modest corpora.

---

### Q3. Explain the mathematical formula of TF-IDF used in TruthLens.
**Answer:** TF-IDF represents the product of Term Frequency and Inverse Document Frequency:
$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \text{IDF}(t, D)$$
TruthLens implements **sublinear term frequency**:
$$\text{TF}(t, d) = 1 + \log(\text{count}(t, d)) \quad \text{for count} > 0$$
This dampens the influence of words that appear repeatedly simply due to document length. The IDF penalizes universally common words:
$$\text{IDF}(t, D) = \log\left(\frac{1 + |D|}{1 + |\{d \in D : t \in d\}|}\right) + 1$$

---

### Q4. Why did you include bigrams (1-2 n-grams) instead of only unigrams?
**Answer:** Unigrams (single words) lose contextual polarity. For example, the token *"leaf"* or *"cure"* alone is neutral, but the bigram *"miracle cure"* strongly signals sensational health misinformation. Similarly, *"official confirmed"* indicates journalistic attribution. Bigrams capture local phrase dependencies without the combinatorial explosion of trigrams.

---

### Q5. How does the system handle class probabilities with Linear SVM?
**Answer:** Standard Support Vector Machines calculate geometric decision boundaries and uncalibrated signed distances (margins), not probabilities. TruthLens wraps LinearSVC within `CalibratedClassifierCV` using Platt scaling (sigmoid fitting) to produce calibrated posterior probabilities $P(y=1|X) \in [0, 1]$.

---

### Q6. Which metric is more important in Fake News Detection: Precision or Recall?
**Answer:** In fake news detection, both metrics are critical, but **Precision is especially vital to protect freedom of speech and prevent false censorship**. A false positive (labeling a legitimate investigative news article as "Fake") damages journalistic credibility. Conversely, high Recall ensures harmful public health or safety hoaxes are flagged. TruthLens balances both by reporting the harmonic mean (**F1-Score**) and establishing a **"SUSPICIOUS"** buffer zone for ambiguous cases rather than forcing a binary decision.

---

### Q7. Why does TruthLens use three categories (REAL, SUSPICIOUS, FAKE) instead of a binary output?
**Answer:** Real-world news and reviews are rarely purely binary. Articles frequently contain 90% true factual background mixed with a single unverified claim, or satirical elements that mimic factual syntax. A tripartite classification (REAL / SUSPICIOUS / FAKE) with confidence thresholds reflects the probabilistic nature of NLP and prevents false certainty.

---

### Q8. How does the News Verification layer corroborate claims?
**Answer:** TruthLens extracts prominent declarative sentences (claims) from the article text using syntactic patterns. It then queries live open news indices (Google News RSS and reference feeds) with the core semantic keywords of the claim. It analyzes discovered headlines to categorize them into:
- **Supporting Sources**: Independent reports confirming the announcement.
- **Contradicting Sources**: Reports containing debunking tokens (*"false"*, *"debunk"*, *"hoax"*, *"no evidence"*).
- **Inconclusive Sources**: Related background coverage lacking direct confirmation.

---

### Q9. Why does TruthLens NOT assign arbitrary numeric "trust scores" to websites?
**Answer:** Generating arbitrary percentage scores (e.g. *"Domain Trust: 87.4%"*) without an objective methodology is misleading. TruthLens maintains a factual reference registry cataloging known news wire agencies, public broadcasters, satire sites, and fringe platforms. If a domain is unrecognized, TruthLens explicitly outputs: **"Source credibility information unavailable"**, adhering to ethical data science standards.

---

### Q10. What is Server-Side Request Forgery (SSRF) and how does TruthLens prevent it?
**Answer:** SSRF occurs when an attacker inputs a URL pointing to internal server infrastructure (such as `http://127.0.0.1:8000/admin`, `http://169.254.169.254` cloud metadata, or private subnet IPs `192.168.x.x`). TruthLens resolves the target domain's IP address prior to making an HTTP request and validates it against a blacklist of private, loopback, link-local, and reserved CIDR networks. If it resolves to a restricted IP, the request is immediately aborted.

---

### Q11. How does TruthLens handle news websites that block automated scraping?
**Answer:** TruthLens respects anti-bot policies. If a website returns HTTP 401, 403 Forbidden, Cloudflare challenges, or Captcha, TruthLens **does not attempt to bypass or hack the protection**. Instead, it gracefully notifies the user and provides a one-click button to paste the article text manually.

---

### Q12. What linguistic signals are extracted for fake reviews?
**Answer:** 
1. **Promotional Hyperbole**: Superlatives (*"best ever in the universe"*, *"1000% recommended"*, *"miracle"*).
2. **Extreme Sentiment**: Polar saturation (unbalanced euphoria or hostile smear rage).
3. **Product Specificity**: Measures whether the review cites concrete attributes (battery life, dimensions, materials, ports, fit) versus generic praise.
4. **Syntactic Repetition**: Detects repeated phrases (*"buy buy buy"*, *"amazing amazing"*).
5. **Punctuation Anomalies**: Excessive exclamation marks and question marks.

---

### Q13. How does the news API architecture work without requiring a paid key?
**Answer:** TruthLens uses a multi-provider strategy (`NewsProvider` abstract interface). While it supports `NewsAPI` and `GNews` if API keys are set in `.env`, it provides an **Open Public Feed Provider** as the default fallback. This parses live RSS feeds from BBC, NDTV, and The Hindu, ensuring that daily news works out of the box without requiring paid subscriptions.

---

### Q14. What database is used and how is it structured?
**Answer:** TruthLens uses **SQLite** through **SQLAlchemy ORM** for local zero-configuration execution. It stores analysis records in the `analysis_history` table using a hybrid schema: structured relational columns for indexing (`input_type`, `prediction`, `created_at`) and JSON columns for semi-structured explainability details (`signals`, `evidence_summary`, `metadata_info`). It can be migrated to PostgreSQL simply by changing the connection string in `.env`.

---

### Q15. Why is claiming "100% accuracy" in fake news detection scientifically flawed?
**Answer:**
1. **Temporal Decay**: News is dynamic; verified claims change as investigations unfold.
2. **Information Mixing**: Misinformation often incorporates factual premises with false conclusions.
3. **Satire**: Publications like *The Onion* use grammatically flawless, journalistic prose while discussing impossible events.
4. **Dataset Bias**: NLP models trained on a specific political or geographical corpus may not generalize to regional reporting.
Therefore, TruthLens explicitly labels results as **"Model Assessments"** rather than **"Absolute Truth"**.
