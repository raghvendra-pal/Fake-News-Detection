import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

import sys
import os

# Ensure project root is in python path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.ml.preprocess import clean_text

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASETS_DIR = os.path.join(BASE_DIR, "ml", "datasets")
MODELS_DIR = os.path.join(BASE_DIR, "ml", "saved_models")
os.makedirs(MODELS_DIR, exist_ok=True)

def train_and_evaluate_models(X_train, X_test, y_train, y_test, task_name="News"):
    """
    Trains and compares 4 standard NLP classification algorithms:
    - Logistic Regression
    - Linear SVM (Calibrated for probability output)
    - Multinomial Naive Bayes
    - Random Forest
    Returns comparison metrics and selects best model.
    """
    models = {
        "Logistic Regression": LogisticRegression(C=1.0, max_iter=1000, random_state=42),
        "Linear SVM": CalibratedClassifierCV(LinearSVC(dual=False, max_iter=2000, random_state=42)),
        "Multinomial Naive Bayes": MultinomialNB(alpha=0.2),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42)
    }
    
    results = {}
    best_model_name = None
    best_f1 = -1.0
    best_model_instance = None
    
    print(f"\n==================== Training & Evaluating {task_name} Models ====================")
    
    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        
        acc = float(accuracy_score(y_test, preds))
        prec = float(precision_score(y_test, preds, zero_division=0))
        rec = float(recall_score(y_test, preds, zero_division=0))
        f1 = float(f1_score(y_test, preds, zero_division=0))
        cm = confusion_matrix(y_test, preds).tolist()
        
        results[name] = {
            "accuracy": round(acc * 100, 2),
            "precision": round(prec * 100, 2),
            "recall": round(rec * 100, 2),
            "f1_score": round(f1 * 100, 2),
            "confusion_matrix": cm,
            "report": classification_report(y_test, preds, target_names=["Real/Genuine", "Fake/Suspicious"], output_dict=True)
        }
        
        print(f"[{name}] Acc: {acc*100:.2f}% | Prec: {prec*100:.2f}% | Rec: {rec*100:.2f}% | F1: {f1*100:.2f}%")
        
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model_instance = model

    print(f"--> Selected Best Model for {task_name}: {best_model_name} (F1: {best_f1*100:.2f}%)")
    return results, best_model_name, best_model_instance

def get_top_features(vectorizer, model, n=15):
    """
    Extracts the most influential n-grams for Logistic Regression or Linear models.
    """
    try:
        feature_names = np.array(vectorizer.get_feature_names_out())
        # Check if underlying estimator has coef_
        if hasattr(model, 'coef_'):
            coefs = model.coef_[0]
        elif hasattr(model, 'calibrated_classifiers_'):
            coefs = model.calibrated_classifiers_[0].estimator.coef_[0]
        else:
            return {"fake_indicators": [], "real_indicators": []}
            
        top_fake_idx = np.argsort(coefs)[-n:][::-1]
        top_real_idx = np.argsort(coefs)[:n]
        
        return {
            "fake_indicators": [
                {"word": feature_names[i], "weight": round(float(coefs[i]), 3)}
                for i in top_fake_idx
            ],
            "real_indicators": [
                {"word": feature_names[i], "weight": round(float(-coefs[i]), 3)}
                for i in top_real_idx
            ]
        }
    except Exception as e:
        print(f"Notice: Could not extract top features: {e}")
        return {"fake_indicators": [], "real_indicators": []}

def run_training():
    # ---------------- 1. News Classification Pipeline ----------------
    news_csv = os.path.join(DATASETS_DIR, "news_dataset.csv")
    if not os.path.exists(news_csv):
        raise FileNotFoundError(f"News dataset missing at {news_csv}. Run generate_datasets.py first.")
        
    df_news = pd.read_csv(news_csv)
    # Deduplicate & drop nulls
    df_news = df_news.dropna(subset=['text', 'label']).drop_duplicates(subset=['text'])
    
    # Combined title and body for rich context
    df_news['cleaned_text'] = (df_news['title'].fillna('') + " " + df_news['text']).apply(lambda t: clean_text(t, remove_stopwords=False))
    
    X_train_raw, X_test_raw, y_train_news, y_test_news = train_test_split(
        df_news['cleaned_text'],
        df_news['label'],
        test_size=0.20,
        random_state=42,
        stratify=df_news['label']
    )
    
    news_vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        sublinear_tf=True
    )
    
    X_train_news = news_vectorizer.fit_transform(X_train_raw)
    X_test_news = news_vectorizer.transform(X_test_raw)
    
    news_results, best_news_name, best_news_model = train_and_evaluate_models(
        X_train_news, X_test_news, y_train_news, y_test_news, task_name="News Fake Detection"
    )
    
    # Save news artifacts
    joblib.dump(best_news_model, os.path.join(MODELS_DIR, "news_model.joblib"))
    joblib.dump(news_vectorizer, os.path.join(MODELS_DIR, "news_vectorizer.joblib"))
    
    top_news_features = get_top_features(news_vectorizer, best_news_model)
    
    # ---------------- 2. Review Classification Pipeline ----------------
    reviews_csv = os.path.join(DATASETS_DIR, "reviews_dataset.csv")
    if not os.path.exists(reviews_csv):
        raise FileNotFoundError(f"Reviews dataset missing at {reviews_csv}.")
        
    df_reviews = pd.read_csv(reviews_csv)
    df_reviews = df_reviews.dropna(subset=['review_text', 'label']).drop_duplicates(subset=['review_text'])
    df_reviews['cleaned_text'] = df_reviews['review_text'].apply(lambda t: clean_text(t, remove_stopwords=False))
    
    X_train_rev_raw, X_test_rev_raw, y_train_rev, y_test_rev = train_test_split(
        df_reviews['cleaned_text'],
        df_reviews['label'],
        test_size=0.20,
        random_state=42,
        stratify=df_reviews['label']
    )
    
    review_vectorizer = TfidfVectorizer(
        max_features=4000,
        ngram_range=(1, 2),
        sublinear_tf=True
    )
    
    X_train_rev = review_vectorizer.fit_transform(X_train_rev_raw)
    X_test_rev = review_vectorizer.transform(X_test_rev_raw)
    
    review_results, best_rev_name, best_rev_model = train_and_evaluate_models(
        X_train_rev, X_test_rev, y_train_rev, y_test_rev, task_name="Fake Review Detection"
    )
    
    # Save review artifacts
    joblib.dump(best_rev_model, os.path.join(MODELS_DIR, "review_model.joblib"))
    joblib.dump(review_vectorizer, os.path.join(MODELS_DIR, "review_vectorizer.joblib"))
    
    top_review_features = get_top_features(review_vectorizer, best_rev_model)
    
    # ---------------- 3. Save Comprehensive Metrics JSON ----------------
    evaluation_summary = {
        "metadata": {
            "timestamp": pd.Timestamp.now().isoformat(),
            "pipeline_type": "TF-IDF (1-2 ngrams) + Machine Learning Classifiers",
            "feature_extraction": "TF-IDF Vectorizer with Sublinear Term Frequency Scaling",
            "train_test_split": "80% Train, 20% Test (Stratified)"
        },
        "news_detection": {
            "dataset_samples": len(df_news),
            "train_samples": len(X_train_raw),
            "test_samples": len(X_test_raw),
            "vocabulary_size": len(news_vectorizer.vocabulary_),
            "selected_model": best_news_name,
            "models_comparison": news_results,
            "top_features": top_news_features
        },
        "review_detection": {
            "dataset_samples": len(df_reviews),
            "train_samples": len(X_train_rev_raw),
            "test_samples": len(X_test_rev_raw),
            "vocabulary_size": len(review_vectorizer.vocabulary_),
            "selected_model": best_rev_name,
            "models_comparison": review_results,
            "top_features": top_review_features
        }
    }
    
    metrics_path = os.path.join(MODELS_DIR, "evaluation_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(evaluation_summary, f, indent=2)
        
    print(f"\n[SUCCESS] All models and metrics successfully saved to {MODELS_DIR}")
    print(f"[SUCCESS] Metrics summary saved to {metrics_path}")

if __name__ == "__main__":
    run_training()
