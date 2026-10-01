import re
from typing import List

def extract_key_claims(text: str, max_claims: int = 3) -> List[str]:
    """
    Extracts prominent declarative sentences/claims from news text.
    Looks for sentences with subject-verb-assertion patterns, quotation attributions,
    or key declarative statements.
    """
    if not text:
        return []
        
    # Split text into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [s.strip() for s in sentences if len(s.strip()) > 30]
    
    if not sentences:
        # Fallback to text chunk if no sentence punct found
        return [text[:150] + "..." if len(text) > 150 else text]
        
    candidates = []
    
    # Priority patterns: statements with numbers, quotes, named announcements
    keywords = ["announced", "reported", "confirmed", "revealed", "discovered", "claims", "passed", "launched", "states", "agreed"]
    
    for s in sentences:
        s_lower = s.lower()
        if any(kw in s_lower for kw in keywords) or '"' in s or any(char.isdigit() for char in s):
            candidates.append(s)
            
    # If not enough keyword matches, take first couple sentences as main claims
    for s in sentences:
        if s not in candidates:
            candidates.append(s)
            
    return candidates[:max_claims]

def clean_extracted_html(text: str) -> str:
    """Removes extra white space, repeated newlines, and dangling markup."""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()
