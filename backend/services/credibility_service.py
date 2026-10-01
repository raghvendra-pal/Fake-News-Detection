from typing import Dict, Any, Optional

# Verified directory of known public domain profiles based on public records & fact-checking registries
# We do NOT invent numeric scores. We provide descriptive classification grounded in factual registry data.
KNOWN_SOURCE_REGISTRY: Dict[str, Dict[str, Any]] = {
    "reuters.com": {
        "name": "Reuters",
        "category": "International News Wire",
        "established": 1851,
        "type": "Mainstream News Agency",
        "editorial_standards": "Adheres to the Thomson Reuters Trust Principles of integrity and freedom from bias.",
        "fact_checking_record": "Signatory to the International Fact-Checking Network (IFCN)."
    },
    "apnews.com": {
        "name": "Associated Press",
        "category": "International News Cooperative",
        "established": 1846,
        "type": "News Cooperative",
        "editorial_standards": "Operates strict verification and cross-sourcing protocols.",
        "fact_checking_record": "Signatory to the International Fact-Checking Network (IFCN)."
    },
    "bbc.com": {
        "name": "BBC News",
        "category": "Public Broadcaster",
        "established": 1922,
        "type": "Public Service Broadcaster",
        "editorial_standards": "Governed by Royal Charter with statutory editorial impartiality guidelines.",
        "fact_checking_record": "Maintains dedicated BBC Verify investigative unit."
    },
    "bbc.co.uk": {
        "name": "BBC News",
        "category": "Public Broadcaster",
        "established": 1922,
        "type": "Public Service Broadcaster",
        "editorial_standards": "Governed by Royal Charter with statutory editorial impartiality guidelines.",
        "fact_checking_record": "Maintains dedicated BBC Verify investigative unit."
    },
    "thehindu.com": {
        "name": "The Hindu",
        "category": "National Newspaper of Record",
        "established": 1878,
        "type": "National Daily Newspaper",
        "editorial_standards": "Operates under an independent Readers' Editor ombudsman.",
        "fact_checking_record": "Maintains internal fact-checking and errata publication policy."
    },
    "ndtv.com": {
        "name": "NDTV",
        "category": "National Television News Network",
        "established": 1988,
        "type": "Broadcast and Digital News",
        "editorial_standards": "Broadcast standards monitored under News Broadcasters & Digital Association (NBDA).",
        "fact_checking_record": "Publishes verified reporting with on-ground correspondent attribution."
    },
    "nature.com": {
        "name": "Nature",
        "category": "Scientific Journal",
        "established": 1869,
        "type": "Peer-Reviewed Scientific Journal",
        "editorial_standards": "Stringent double-blind and single-blind peer review with editorial oversight.",
        "fact_checking_record": "Scientific claims verified through independent peer review."
    },
    "theonion.com": {
        "name": "The Onion",
        "category": "Satire / Parody",
        "established": 1988,
        "type": "Humor & Satirical Publication",
        "editorial_standards": "Explicitly creates fictional humorous content not intended to be taken as factual news.",
        "fact_checking_record": "Not a factual news organization; published stories are fictional satire."
    },
    "babylonbee.com": {
        "name": "The Babylon Bee",
        "category": "Satire / Parody",
        "established": 2016,
        "type": "Satirical Website",
        "editorial_standards": "Publishes intentional parody and satire for humor.",
        "fact_checking_record": "Fictional content; frequently clarified by fact-checkers as satire."
    },
    "infowars.com": {
        "name": "InfoWars",
        "category": "Conspiracy / Alternative Media",
        "established": 1999,
        "type": "Fringe Media Network",
        "editorial_standards": "History of defamation judgments and systematic publication of debunked conspiracy theories.",
        "fact_checking_record": "Multiple claims debunked by international fact-checkers (PolitiFact, Snopes)."
    }
}

def get_source_credibility(domain: str) -> Dict[str, Any]:
    """
    Evaluates source credibility based on verified registry information.
    If the publisher is not recognized, explicitly returns 'Source credibility information unavailable'.
    No synthetic or fake numeric scores are generated.
    """
    if not domain:
        return {
            "has_data": False,
            "reputation_status": "Source credibility information unavailable",
            "details": None
        }
        
    cleaned_domain = domain.lower().replace("www.", "")
    
    # Check direct match
    if cleaned_domain in KNOWN_SOURCE_REGISTRY:
        data = KNOWN_SOURCE_REGISTRY[cleaned_domain]
        return {
            "has_data": True,
            "reputation_status": f"Verified Record: {data['name']}",
            "publisher_name": data["name"],
            "established_year": data["established"],
            "publisher_type": data["type"],
            "category": data["category"],
            "editorial_standards": data["editorial_standards"],
            "fact_checking_record": data["fact_checking_record"]
        }
        
    # Check parent domain match
    for reg_domain, data in KNOWN_SOURCE_REGISTRY.items():
        if cleaned_domain.endswith("." + reg_domain):
            return {
                "has_data": True,
                "reputation_status": f"Verified Record: {data['name']}",
                "publisher_name": data["name"],
                "established_year": data["established"],
                "publisher_type": data["type"],
                "category": data["category"],
                "editorial_standards": data["editorial_standards"],
                "fact_checking_record": data["fact_checking_record"]
            }
            
    # As explicitly required: do NOT invent arbitrary scores
    return {
        "has_data": False,
        "reputation_status": "Source credibility information unavailable",
        "domain": cleaned_domain,
        "details": "This domain is not currently cataloged in the verified registry. Lack of a profile does not indicate an article is fake, but independent verification is advised."
    }
