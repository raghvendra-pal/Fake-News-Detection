import os
import joblib
from typing import Dict, Any, Optional
from backend.ml.preprocess import clean_text
from backend.services.signal_analyzer import analyze_news_signals, analyze_review_signals
from backend.services.verifier import verify_article_claims
from backend.services.credibility_service import get_source_credibility

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "ml", "saved_models")

class TruthLensPredictor:
    def __init__(self):
        self.news_model = None
        self.news_vectorizer = None
        self.review_model = None
        self.review_vectorizer = None
        self._load_models()

    def _load_models(self):
        try:
            news_model_path = os.path.join(MODELS_DIR, "news_model.joblib")
            news_vec_path = os.path.join(MODELS_DIR, "news_vectorizer.joblib")
            if os.path.exists(news_model_path) and os.path.exists(news_vec_path):
                self.news_model = joblib.load(news_model_path)
                self.news_vectorizer = joblib.load(news_vec_path)
                print("[Predictor] Successfully loaded news detection models.")
        except Exception as e:
            print(f"[Predictor Warning] Could not load news model: {e}")

        try:
            rev_model_path = os.path.join(MODELS_DIR, "review_model.joblib")
            rev_vec_path = os.path.join(MODELS_DIR, "review_vectorizer.joblib")
            if os.path.exists(rev_model_path) and os.path.exists(rev_vec_path):
                self.review_model = joblib.load(rev_model_path)
                self.review_vectorizer = joblib.load(rev_vec_path)
                print("[Predictor] Successfully loaded review detection models.")
        except Exception as e:
            print(f"[Predictor Warning] Could not load review model: {e}")

    def predict_news(self, text: str, title: str = "", source_url: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Unified news analysis pipeline:
        1. Linguistic signal analysis (heuristics & explainability)
        2. ML Model inference (TF-IDF + Classifier probabilities)
        3. External source verification (claim checking)
        4. Source reputation lookup (if URL provided)
        5. Fusion into REAL / SUSPICIOUS / FAKE with calibrated confidence.
        """
        # 1. Analyze stylistic signals
        signals_data = analyze_news_signals(text, title)
        signals = signals_data["signals"]
        metrics = signals_data["metrics"]

        # 2. ML Prediction
        combined_text = (title + " " + text).strip()
        cleaned = clean_text(combined_text)
        
        fake_prob = 0.5
        model_name = "TF-IDF + ML Classifier"
        if self.news_model and self.news_vectorizer and cleaned:
            vec = self.news_vectorizer.transform([cleaned])
            if hasattr(self.news_model, "predict_proba"):
                probs = self.news_model.predict_proba(vec)[0]
                # Index 1 is FAKE
                fake_prob = float(probs[1])
            elif hasattr(self.news_model, "decision_function"):
                df_val = self.news_model.decision_function(vec)[0]
                fake_prob = float(1.0 / (1.0 + pow(2.71828, -df_val)))
            model_name = self.news_model.__class__.__name__

        # 3. External Source Corroboration
        claim_verification = verify_article_claims(text, title)
        verification_details = claim_verification["verification"]
        contradicting = verification_details["contradicting_count"]
        supporting = verification_details["supporting_count"]
        
        # 4. Source Credibility Check (if URL or publisher provided)
        domain = ""
        if metadata and metadata.get("domain"):
            domain = metadata["domain"]
        elif source_url:
            from urllib.parse import urlparse
            domain = urlparse(source_url).netloc
            
        credibility_info = get_source_credibility(domain)

        # 5. Hybrid Assessment Rule Engine
        # Distinguish Model Signals vs External Evidence
        model_explanations = []
        external_explanations = []
        
        if metrics.get("sensationalism", 0) > 30:
            model_explanations.append("Model detected sensationalist or emotionally charged vocabulary patterns.")
        if metrics.get("extreme_certainty", 0) > 40:
            model_explanations.append("Article exhibits rigid absolute certainty markers lacking typical journalistic nuance.")
        if metrics.get("emotional_punctuation", 0) > 40:
            model_explanations.append("Elevated use of emotional punctuation or capitalization anomalies.")
        if metrics.get("urgency_pressure", 0) > 50:
            model_explanations.append("Contains coercive urgency prompts urging rapid unverified sharing.")
        if metrics.get("attribution_quality", 0) > 70:
            model_explanations.append("Contains conventional institutional attribution or naming markers.")
            
        if not model_explanations:
            model_explanations.append("Linguistic syntax and tone align within standard objective journalistic distributions.")

        if contradicting > 0:
            external_explanations.append(f"External search identified {contradicting} independent source(s) questioning or refuting this claim.")
        elif supporting >= 2:
            external_explanations.append(f"Found {supporting} related reporting items from indexed news sources addressing this topic.")
        elif verification_details["sources_found"]:
            external_explanations.append("Topical reporting exists, but primary claims could not be conclusively cross-verified.")
        else:
            external_explanations.append("No corroborating reports were found across indexed reliable news indices for this specific claim.")

        # Determine Final Category
        if contradicting > 0 or fake_prob >= 0.70:
            prediction = "FAKE"
            confidence = round(max(fake_prob * 100, 72.0), 1)
        elif fake_prob <= 0.28 and contradicting == 0 and metrics.get("sensationalism", 0) <= 25:
            prediction = "REAL"
            confidence = round(max((1.0 - fake_prob) * 100, 75.0), 1)
        else:
            prediction = "SUSPICIOUS"
            # In suspicious/uncertain category, confidence indicates the certainty of ambiguity
            confidence = round(65.0 + abs(fake_prob - 0.5) * 30, 1)

        # Confidence qualitative tier
        if confidence >= 80.0:
            confidence_level = "High"
        elif confidence >= 65.0:
            confidence_level = "Medium"
        else:
            confidence_level = "Low"

        return {
            "prediction": prediction,
            "confidence": confidence,
            "confidence_level": confidence_level,
            "model_probability_fake": round(fake_prob, 4),
            "signals": signals,
            "linguistic_metrics": metrics,
            "claims": claim_verification["all_extracted_claims"],
            "primary_claim": claim_verification["primary_claim"],
            "why_this_result": {
                "model_signals": model_explanations,
                "external_evidence": external_explanations,
                "summary": f"Categorized as {prediction} with {confidence}% {confidence_level.lower()} confidence based on combined NLP features and source corroboration."
            },
            "evidence_summary": {
                "supporting_sources": supporting,
                "contradicting_sources": contradicting,
                "inconclusive_sources": verification_details["inconclusive_count"],
                "assessment": verification_details["overall_evidence_assessment"],
                "sources": verification_details["sources_found"]
            },
            "source_credibility": credibility_info,
            "model_info": {
                "model_name": f"{model_name} with TF-IDF Vectorization",
                "version": "1.0.0-tfidf",
                "feature_type": "TF-IDF (1-2 N-Grams, 5000 max features, sublinear TF)",
                "pipeline": "Data Preprocessing -> Tokenization -> TF-IDF Vectorizer -> Classifier -> Signal Corroboration"
            },
            "disclaimer": "This prediction is probabilistic and generated by an automated NLP model. It should not be treated as absolute fact or definitive proof."
        }

    def predict_review(self, review_text: str, product_name: str = "", category: str = "") -> Dict[str, Any]:
        """
        Analyzes a product review for fake/incentivized signals.
        """
        signals_data = analyze_review_signals(review_text, product_name, category)
        signals = signals_data["signals"]
        breakdown = signals_data["breakdown"]

        cleaned = clean_text(review_text)
        fake_prob = 0.5
        model_name = "TF-IDF + ML Classifier"
        if self.review_model and self.review_vectorizer and cleaned:
            vec = self.review_vectorizer.transform([cleaned])
            if hasattr(self.review_model, "predict_proba"):
                probs = self.review_model.predict_proba(vec)[0]
                fake_prob = float(probs[1])
            elif hasattr(self.review_model, "decision_function"):
                df_val = self.review_model.decision_function(vec)[0]
                fake_prob = float(1.0 / (1.0 + pow(2.71828, -df_val)))
            model_name = self.review_model.__class__.__name__

        # Heuristic adjustments
        # High promotional intensity + high repetition + 0 specificity strongly pushes toward fake
        if breakdown["promotional_intensity"] > 50 and breakdown["syntactic_repetition"] > 30:
            fake_prob = max(fake_prob, 0.85)
        elif breakdown["product_specificity"] >= 40 and breakdown["promotional_intensity"] < 20:
            fake_prob = min(fake_prob, 0.20)

        # Categorization: Genuine, Suspicious, Fake
        if fake_prob >= 0.68:
            prediction = "FAKE"
            confidence = round(max(fake_prob * 100, 70.0), 1)
        elif fake_prob <= 0.32:
            prediction = "GENUINE"
            confidence = round(max((1.0 - fake_prob) * 100, 72.0), 1)
        else:
            prediction = "SUSPICIOUS"
            confidence = round(60.0 + abs(fake_prob - 0.5) * 40, 1)

        confidence_level = "High" if confidence >= 80.0 else ("Medium" if confidence >= 65.0 else "Low")

        reasons = []
        if breakdown["promotional_intensity"] > 40:
            reasons.append("Contains hyperbolic promotional superlatives typical of incentivized or paid reviews.")
        if breakdown["syntactic_repetition"] > 30:
            reasons.append("Identified unnatural keyword or phrase repetitions.")
        if breakdown["product_specificity"] == 0 and len(review_text.split()) > 12:
            reasons.append("Lacks specific functional, ergonomic, or material attributes of the actual product.")
        if breakdown["punctuation_intensity"] > 40:
            reasons.append("Elevated punctuation spam (multiple exclamation marks).")
        if not reasons:
            reasons.append("Review displays balanced descriptive phrasing, natural sentence flow, and specific usage feedback.")

        return {
            "prediction": prediction,
            "confidence": confidence,
            "confidence_level": confidence_level,
            "model_probability_fake": round(fake_prob, 4),
            "detected_signals": signals,
            "signals_breakdown": breakdown,
            "sentiment_label": signals_data["sentiment_label"],
            "length_profile": signals_data["length_profile"],
            "reasons": reasons,
            "model_info": {
                "model_name": f"{model_name} with TF-IDF Vectorization",
                "version": "1.0.0-tfidf",
                "feature_type": "TF-IDF (1-2 N-Grams, 4000 max features, sublinear TF)"
            },
            "disclaimer": "This analysis represents an automated model prediction and should not be treated as a definitive statement of authenticity."
        }

predictor = TruthLensPredictor()
