# Machine Learning & NLP Workflow — TruthLens

This document details the data preparation, feature engineering, mathematical modeling, and evaluation methodology powering TruthLens.

---

## 1. End-to-End Pipeline

```
Raw Article / Review Text
          │
          ▼
Text Cleaning & Normalization (Lowercase, Regex strip HTML/URLs, Punctuation filtering)
          │
          ▼
TF-IDF Vectorization (Unigrams + Bigrams, Sublinear Scaling, Max Features = 5,000)
          │
          ▼
Classifier Inference (Logistic Regression / Multinomial Naive Bayes / Calibrated Linear SVM)
          │
          ▼
Posterior Class Probabilities: P(Fake | Text) vs P(Real | Text)
          │
          ▼
Heuristic Signal Fusion & Calibration (Sensationalism, Urgency, Certainty, Repetition)
          │
          ▼
Final Categorization: REAL | SUSPICIOUS | FAKE (with Confidence Tier)
```

---

## 2. Feature Extraction: Term Frequency-Inverse Document Frequency (TF-IDF)

### 2.1 Formulation
TF-IDF evaluates the relative importance of an n-gram token $t$ in a document $d$ relative to the entire corpus $D$:

$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \text{IDF}(t, D)$$

1. **Sublinear Term Frequency Scaling**:
   Standard term frequency can over-emphasize words repeated simply due to text length. TruthLens enables sublinear TF:
   $$\text{TF}(t, d) = 1 + \log(\text{count}(t, d)) \quad \text{for } \text{count}(t, d) > 0$$

2. **Inverse Document Frequency (IDF)**:
   $$\text{IDF}(t, D) = \log\left(\frac{1 + |D|}{1 + |\{d \in D : t \in d\}|}\right) + 1$$

3. **N-Gram Range**:
   TruthLens extracts both **unigrams** (single tokens like `"shocking"`, `"satellite"`) and **bigrams** (phrase pairs like `"miracle cure"`, `"official confirmed"`). This preserves critical contextual valence that single words lose.

---

## 3. Algorithm Comparison

During the offline training execution (`python backend/ml/train.py`), TruthLens trains and cross-evaluates four classical classifiers:

| Algorithm | Strengths | Use Case in TruthLens |
| :--- | :--- | :--- |
| **Logistic Regression** | Highly interpretable, well-calibrated probabilities via sigmoid function, handles sparse TF-IDF vectors exceptionally well. | Baseline & Primary probability estimator. |
| **Linear SVM** | Maximizes separating hyperplane margin; effective in high-dimensional text feature spaces. | Calibrated via Platt scaling / Isotonic regression for probability estimates. |
| **Multinomial Naive Bayes** | Probabilistic generative model assuming conditional independence of tokens. Extremely fast inference. | Lightweight high-speed categorization. |
| **Random Forest** | Non-linear ensemble of decision trees; handles feature interactions. | Benchmark comparator to evaluate tree-based performance on sparse vectors. |

---

## 4. Evaluation Metrics & Confusion Matrix

All models are evaluated on a **strictly segregated, stratified 20% test partition**:

1. **Accuracy**: $\frac{\text{TP} + \text{TN}}{\text{TP} + \text{TN} + \text{FP} + \text{FN}}$
2. **Precision**: $\frac{\text{TP}}{\text{TP} + \text{FP}}$ (Minimizes false accusations of fake news)
3. **Recall**: $\frac{\text{TP}}{\text{TP} + \text{FN}}$ (Ensures dangerous hoaxes are caught)
4. **F1-Score**: $2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$ (Harmonic mean balancing precision and recall)

### Confusion Matrix Representation:
```
                Predicted Real       Predicted Fake
Actual Real    True Negative (TN)   False Positive (FP)
Actual Fake    False Negative (FN)  True Positive (TP)
```

---

## 5. Artifact Serialization

The training process serializes fitted artifacts to `backend/ml/saved_models/`:
- `news_model.joblib`: Serialized trained classifier for news
- `news_vectorizer.joblib`: Fitted vocabulary and IDF weights
- `review_model.joblib`: Serialized classifier for product reviews
- `review_vectorizer.joblib`: Fitted review vocabulary
- `evaluation_metrics.json`: JSON report capturing exact numerical benchmarks, confusion matrices, and influential n-grams.
