import re
import string
from typing import Dict, Any, List

# Common English stop words
STOP_WORDS = {
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
    'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
    'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t',
    'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have',
    'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself',
    'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into',
    'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my',
    'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our',
    'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s',
    'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
    'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re',
    'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t',
    'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s',
    'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t',
    'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself',
    'yourselves'
}

def clean_text(text: str, remove_stopwords: bool = False) -> str:
    """
    Standard text normalization pipeline for NLP:
    1. Lowercase text
    2. Remove URLs, email addresses, HTML tags
    3. Remove special characters and redundant whitespace
    4. Optional stop-words filtering
    """
    if not text or not isinstance(text, str):
        return ""
    
    # Lowercase
    text = text.lower()
    
    # Strip HTML tags
    text = re.sub(r'<.*?>', ' ', text)
    
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    
    # Remove email addresses
    text = re.sub(r'\S+@\S+', ' ', text)
    
    # Remove punctuation & numbers but keep basic whitespace
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    
    # Remove excess whitespace
    tokens = text.split()
    
    if remove_stopwords:
        tokens = [token for token in tokens if token not in STOP_WORDS and len(token) > 2]
        
    return " ".join(tokens)

def extract_linguistic_signals(text: str) -> Dict[str, Any]:
    """
    Extracts deterministic surface-level stylistic and linguistic indicators
    useful for explainability and heuristic risk scoring.
    """
    if not text:
        return {
            "exclamation_count": 0,
            "question_count": 0,
            "all_caps_ratio": 0.0,
            "word_count": 0,
            "avg_word_length": 0.0,
            "sensational_word_density": 0.0,
            "certainty_word_density": 0.0,
        }

    total_chars = len(text)
    words = text.split()
    word_count = len(words)
    
    # Punctuation counts
    exclamation_count = text.count('!')
    question_count = text.count('?')
    
    # Uppercase analysis (avoiding divide-by-zero)
    upper_chars = sum(1 for c in text if c.isupper())
    alpha_chars = sum(1 for c in text if c.isalpha())
    all_caps_ratio = (upper_chars / alpha_chars) if alpha_chars > 0 else 0.0
    
    # Sensational / Clickbait lexicon
    sensational_words = {
        'shocking', 'unbelievable', 'miracle', 'secret', 'exposed', 'conspiracy',
        'cure', 'hidden', 'censored', 'banned', 'bombshell', 'scandal', 'bizarre',
        'horrifying', 'explosive', 'hoax', 'devastating', 'breakthrough', 'proof',
        'they don\'t want you to know', 'mainstream media lies', 'urgent alert'
    }
    
    # High certainty / extreme assertion markers
    certainty_words = {
        'definitely', 'undeniably', 'absolutely', 'guaranteed', 'irrefutable',
        'proven beyond doubt', 'never', 'always', 'everyone knows', 'without a doubt'
    }
    
    lower_text = text.lower()
    sensational_hits = sum(1 for phrase in sensational_words if phrase in lower_text)
    certainty_hits = sum(1 for phrase in certainty_words if phrase in lower_text)
    
    avg_word_length = sum(len(w) for w in words) / word_count if word_count > 0 else 0
    
    return {
        "exclamation_count": exclamation_count,
        "question_count": question_count,
        "all_caps_ratio": round(all_caps_ratio, 4),
        "word_count": word_count,
        "avg_word_length": round(avg_word_length, 2),
        "sensational_word_density": round(sensational_hits / max(1, word_count / 100), 2),
        "certainty_word_density": round(certainty_hits / max(1, word_count / 100), 2),
    }
