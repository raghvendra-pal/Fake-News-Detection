import re
from typing import Dict, Any, List

def analyze_news_signals(text: str, title: str = "") -> Dict[str, Any]:
    """
    Evaluates explainable stylistic and rhetorical signals in a news article.
    Produces clear indicators distinguishing model signals from evidence.
    """
    full_content = (title + " " + text).strip()
    words = full_content.split()
    word_count = len(words)
    
    signals = []
    scores = {}
    
    # 1. Sensational Wording
    sensational_lexicon = [
        "shocking", "unbelievable", "miracle", "secret", "exposed", "bombshell",
        "conspiracy", "censored", "banned", "horrifying", "explosive", "hoax",
        "breakthrough", "they don't want you to know", "mainstream media lies"
    ]
    found_sensational = [w for w in sensational_lexicon if w in full_content.lower()]
    if found_sensational:
        signals.append({
            "name": "Sensationalist Language",
            "type": "warning",
            "description": f"Detected emotionally provocative or clickbait terminology: {', '.join(found_sensational[:3])}."
        })
        scores["sensationalism"] = min(100, len(found_sensational) * 25)
    else:
        scores["sensationalism"] = 10
        
    # 2. Extreme Certainty Markers
    certainty_markers = [
        "undeniably", "absolutely", "guaranteed", "proven beyond doubt",
        "irrefutable", "everyone knows", "without a doubt", "always", "never"
    ]
    found_certainty = [w for w in certainty_markers if w in full_content.lower()]
    if found_certainty:
        signals.append({
            "name": "Unusual Absolute Certainty",
            "type": "warning",
            "description": f"Contains rigid certainty markers lacking journalistic nuance: {', '.join(found_certainty[:2])}."
        })
        scores["extreme_certainty"] = min(100, len(found_certainty) * 30)
    else:
        scores["extreme_certainty"] = 15

    # 3. Punctuation & Capitalization Intensity
    exclamations = full_content.count("!")
    questions = full_content.count("?")
    upper_chars = sum(1 for c in full_content if c.isupper())
    alpha_chars = sum(1 for c in full_content if c.isalpha())
    caps_ratio = (upper_chars / alpha_chars) if alpha_chars > 0 else 0
    
    if exclamations > 2 or caps_ratio > 0.15:
        signals.append({
            "name": "Punctuation / Casing Anomaly",
            "type": "warning",
            "description": f"High emotional punctuation ({exclamations} exclamation marks) or elevated uppercase text ({round(caps_ratio*100, 1)}%)."
        })
        scores["emotional_punctuation"] = min(100, exclamations * 20 + int(caps_ratio * 100))
    else:
        scores["emotional_punctuation"] = 10

    # 4. Virality & Urgency Pressure
    urgency_terms = ["share immediately", "before deleted", "spread this", "urgent alert", "wake up", "viral"]
    found_urgency = [w for w in urgency_terms if w in full_content.lower()]
    if found_urgency:
        signals.append({
            "name": "Coercive Virality Pressure",
            "type": "warning",
            "description": "Urges readers to aggressively circulate or repost before censorship or removal."
        })
        scores["urgency_pressure"] = 80
    else:
        scores["urgency_pressure"] = 5
        
    # 5. Professional Attribution Markers
    attribution_markers = ["according to", "spokesperson", "published in", "stated during", "official confirmed", "study led by"]
    has_attribution = any(marker in full_content.lower() for marker in attribution_markers)
    if has_attribution:
        signals.append({
            "name": "Standard Attribution Markers",
            "type": "positive",
            "description": "Article includes standard journalistic sourcing conventions or institution references."
        })
        scores["attribution_quality"] = 85
    else:
        scores["attribution_quality"] = 30
        
    return {
        "signals": signals,
        "metrics": scores,
        "word_count": word_count
    }

def analyze_review_signals(review_text: str, product_name: str = "", category: str = "") -> Dict[str, Any]:
    """
    Analyzes fine-grained deceptive signals in product reviews:
    - Promotional exaggeration
    - Syntactic and token repetition
    - Extreme sentiment polarity
    - Lack of specific product experience
    - Punctuation anomalies
    """
    text = review_text.strip()
    words = text.split()
    word_count = len(words)
    lower_text = text.lower()
    
    signals = []
    
    # 1. Promotional Language
    promotional_terms = [
        "best ever", "greatest in the world", "miracle", "1000% recommended",
        "life changing", "must buy immediately", "perfect in every way",
        "buy buy buy", "a+++++", "flawless", "super fantastic marvelous",
        "unbelievable bargain", "changed my whole life"
    ]
    promo_hits = [term for term in promotional_terms if term in lower_text]
    promo_score = min(100, len(promo_hits) * 35)
    if promo_hits:
        signals.append({
            "name": "Excessive Promotional Language",
            "type": "warning",
            "description": f"Contains high-intensity marketing superlatives: '{', '.join(promo_hits[:2])}'."
        })
        
    # 2. Extreme Sentiment / Rage or Euphoria
    rage_terms = ["worst garbage", "scam company", "total fraud", "cheater", "burned my house", "complete disaster"]
    rage_hits = [term for term in rage_terms if term in lower_text]
    
    if promo_hits and not rage_hits:
        sentiment_label = "Extremely Euphoric"
        sentiment_score = 90
    elif rage_hits:
        sentiment_label = "Extremely Destructive / Vengeful"
        sentiment_score = 90
        signals.append({
            "name": "Extreme Negative Outlier",
            "type": "warning",
            "description": "Review displays hyperbolic hostile phrasing characteristic of smear campaigns."
        })
    else:
        sentiment_label = "Balanced / Moderate"
        sentiment_score = 25
        
    # 3. Repeated Words / Phrasing (e.g., 'best best best', 'buy buy buy', 'amazing amazing')
    repeated_patterns = re.findall(r'\b(\w+)(?:\s+\1\b){2,}', lower_text)
    repetition_score = min(100, len(repeated_patterns) * 40)
    if repeated_patterns:
        signals.append({
            "name": "Excessive Phrase Repetition",
            "type": "warning",
            "description": f"Detected unnatural word repetition patterns: '{', '.join(set(repeated_patterns))}'."
        })
        
    # 4. Specificity of Product Experience
    # Check for tangible product traits: battery, noise, fit, material, size, buttons, packaging, duration, pros/cons
    specificity_terms = [
        "battery", "charge", "screen", "cable", "sound", "volume", "switch", "keycap",
        "knife", "blade", "steel", "wash", "fit", "size", "shoulder", "sleeve",
        "fabric", "hours", "days", "weeks", "month", "months", "assembly", "weight",
        "pan", "heat", "temperature", "camera", "sensor", "lens", "iso", "autofocus",
        "chair", "lumbar", "mesh", "packaging", "port", "finish", "warranty"
    ]
    specific_hits = [t for t in specificity_terms if t in lower_text]
    specificity_score = min(100, len(specific_hits) * 20)
    
    if len(specific_hits) >= 2:
        signals.append({
            "name": "High Product Specificity",
            "type": "positive",
            "description": f"Describes concrete product attributes: {', '.join(specific_hits[:3])}."
        })
    elif word_count > 15 and len(specific_hits) == 0:
        signals.append({
            "name": "Lack of Specific Experience",
            "type": "warning",
            "description": "Lacks tangible details about hardware specs, ergonomics, usage conditions, or durability."
        })
        
    # 5. Punctuation Spam
    exclamations = text.count("!")
    if exclamations >= 3:
        signals.append({
            "name": "Excessive Punctuation Spam",
            "type": "warning",
            "description": f"Abnormal density of punctuation marks ({exclamations} exclamation marks)."
        })
        punct_score = min(100, exclamations * 25)
    else:
        punct_score = 10
        
    # 6. Length Profile
    if word_count < 10:
        length_profile = "Extremely Brief"
    elif word_count > 150:
        length_profile = "In-depth Long-form"
    else:
        length_profile = "Standard Length"
        
    return {
        "signals": signals,
        "breakdown": {
            "promotional_intensity": promo_score,
            "sentiment_extremity": sentiment_score,
            "syntactic_repetition": repetition_score,
            "product_specificity": specificity_score,
            "punctuation_intensity": punct_score
        },
        "sentiment_label": sentiment_label,
        "length_profile": length_profile,
        "word_count": word_count
    }
