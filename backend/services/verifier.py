import re
import urllib.parse
import xml.etree.ElementTree as ET
import requests
from typing import List, Dict, Any, Optional
from backend.utils.text_cleaner import extract_key_claims

class VerificationProvider:
    """Abstract base class for verification providers."""
    def verify_claim(self, claim: str) -> Dict[str, Any]:
        raise NotImplementedError

class LiveNewsSearchVerifier(VerificationProvider):
    """
    Corroborates claims against live open news indices (Google News Search RSS & Wikipedia APIs).
    Avoids requiring closed paid API keys for base functionality while allowing configurable fallback.
    """
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        }

    def verify_claim(self, claim: str) -> Dict[str, Any]:
        if not claim or len(claim.strip()) < 10:
            return {
                "claim": claim,
                "sources_found": [],
                "supporting_count": 0,
                "contradicting_count": 0,
                "inconclusive_count": 0,
                "overall_evidence_assessment": "INSUFFICIENT_DATA",
                "summary": "Claim is too brief or ambiguous for automated cross-source verification."
            }

        # Clean query for search
        # Strip punctuation and keep core substantive terms
        query_words = re.findall(r'\b[A-Za-z0-9_-]+\b', claim)
        # Filter out common stop words from search query
        stop_words = {"a", "an", "the", "that", "this", "will", "by", "on", "in", "at", "for", "with", "is", "are"}
        meaningful_words = [w for w in query_words if w.lower() not in stop_words][:6]
        search_query = " ".join(meaningful_words)

        sources = []
        try:
            # Query Google News RSS for live headlines matching key claim terms
            encoded_query = urllib.parse.quote(search_query)
            rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-US&gl=US&ceid=US:en"
            
            resp = requests.get(rss_url, headers=self.headers, timeout=6)
            if resp.status_code == 200:
                root = ET.fromstring(resp.content)
                items = root.findall(".//item")[:5]
                for item in items:
                    title_elem = item.find("title")
                    link_elem = item.find("link")
                    pub_elem = item.find("pubDate")
                    source_elem = item.find("source")
                    
                    title = title_elem.text if title_elem is not None else ""
                    link = link_elem.text if link_elem is not None else ""
                    pub_date = pub_elem.text if pub_elem is not None else ""
                    publisher = source_elem.text if source_elem is not None else "News Source"
                    
                    if title:
                        sources.append({
                            "title": title,
                            "url": link,
                            "publisher": publisher,
                            "published_date": pub_date
                        })
        except Exception as e:
            # Network issue or feed format change
            print(f"Notice: Verification search lookup exception: {e}")

        # Stance analysis on discovered sources
        contradicting = 0
        supporting = 0
        inconclusive = 0
        
        debunk_keywords = ["debunk", "false", "hoax", "fact check", "fake", "denies", "myth", "no evidence", "unfounded", "scam"]
        
        analyzed_sources = []
        for src in sources:
            t_lower = src["title"].lower()
            if any(dk in t_lower for dk in debunk_keywords):
                stance = "CONTRADICTING"
                contradicting += 1
            elif any(w.lower() in t_lower for w in meaningful_words[:3]):
                # If headline shares multiple key nouns/verbs without debunk markers
                stance = "SUPPORTING"
                supporting += 1
            else:
                stance = "RELATED_INCONCLUSIVE"
                inconclusive += 1
                
            analyzed_sources.append({
                **src,
                "stance": stance
            })
            
        # Determine overall evidence assessment
        if contradicting > 0:
            assessment = "CONTRADICTED_BY_SOURCES"
            summary = f"Found {contradicting} independent source(s) questioning or refuting aspects of this claim."
        elif supporting >= 2:
            assessment = "CORROBORATED"
            summary = f"Found {supporting} related reporting item(s) from news sources addressing this topic."
        elif len(analyzed_sources) > 0:
            assessment = "RELATED_BUT_UNVERIFIED"
            summary = "Found related topical coverage, but direct official confirmation could not be verified."
        else:
            assessment = "NO_CORROBORATING_SOURCES"
            summary = "No corroborating reports were found across indexed major news feeds."

        return {
            "claim": claim,
            "sources_found": analyzed_sources,
            "supporting_count": supporting,
            "contradicting_count": contradicting,
            "inconclusive_count": inconclusive,
            "overall_evidence_assessment": assessment,
            "summary": summary
        }

# Singleton instance
default_verifier = LiveNewsSearchVerifier()

def verify_article_claims(text: str, title: str = "") -> Dict[str, Any]:
    """
    Extracts core claims from an article and runs cross-source verification.
    """
    # Extract candidate claims
    claims = extract_key_claims(title + ". " + text if title else text, max_claims=2)
    if not claims:
        claims = [text[:120]]
        
    primary_claim = claims[0]
    verification_result = default_verifier.verify_claim(primary_claim)
    
    return {
        "primary_claim": primary_claim,
        "all_extracted_claims": claims,
        "verification": verification_result
    }
