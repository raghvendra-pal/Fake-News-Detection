import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from typing import Dict, Any, Optional
from backend.config import settings
from backend.utils.security import is_safe_url

def extract_article_from_url(url: str) -> Dict[str, Any]:
    """
    Safely retrieves and parses an online news article.
    Honors website access policies and does NOT attempt to circumvent bot protections.
    """
    # 1. URL validation & SSRF check
    is_safe, error_reason = is_safe_url(url)
    if not is_safe:
        return {
            "success": False,
            "error_type": "invalid_url",
            "message": f"Please enter a valid, accessible public article URL. ({error_reason})"
        }
        
    parsed = urlparse(url)
    domain = parsed.netloc.replace("www.", "")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }
    
    try:
        response = requests.get(
            url,
            headers=headers,
            timeout=settings.REQUEST_TIMEOUT_SECONDS,
            allow_redirects=True
        )
    except requests.exceptions.Timeout:
        return {
            "success": False,
            "error_type": "timeout",
            "message": "The news website took too long to respond. You can paste the article text directly."
        }
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error_type": "connection_error",
            "message": "Could not connect to the news server. Try pasting the article text instead."
        }
        
    # Check for blocking status codes (403 Forbidden, 401, 429, Cloudflare / Captcha challenge)
    if response.status_code in (401, 403, 429, 451, 503):
        return {
            "success": False,
            "error_type": "extraction_blocked",
            "status_code": response.status_code,
            "message": "We couldn't retrieve this article automatically because the publisher restricts automated access. Try pasting the article text instead."
        }
        
    if response.status_code != 200:
        return {
            "success": False,
            "error_type": "http_error",
            "status_code": response.status_code,
            "message": f"Failed to retrieve article (HTTP {response.status_code}). Try pasting the article text instead."
        }
        
    # Check for Captcha / Bot protection text in HTML
    html_content = response.text
    if any(sig in html_content.lower() for sig in ["captcha-delivery", "cf-browser-verification", "ddos-guard", "verify you are human"]):
        return {
            "success": False,
            "error_type": "extraction_blocked",
            "message": "We couldn't retrieve this article automatically due to anti-bot verification. Try pasting the article text instead."
        }

    soup = BeautifulSoup(html_content, "html.parser")
    
    # Remove unwanted tags
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript", "svg"]):
        tag.decompose()
        
    # Extract Title
    title = ""
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):
        title = og_title["content"].strip()
    elif soup.title and soup.title.string:
        title = soup.title.string.strip()
    elif soup.find("h1"):
        title = soup.find("h1").get_text(strip=True)
        
    # Extract Publisher / Site Name
    publisher = domain
    og_site_name = soup.find("meta", property="og:site_name")
    if og_site_name and og_site_name.get("content"):
        publisher = og_site_name["content"].strip()
        
    # Extract Author
    author = None
    author_meta = (
        soup.find("meta", attrs={"name": "author"}) or
        soup.find("meta", property="article:author") or
        soup.find("meta", attrs={"name": "byl"})
    )
    if author_meta and author_meta.get("content"):
        author = author_meta["content"].strip()
    else:
        # Check common author classes
        author_tag = soup.find(class_=lambda c: c and any(k in str(c).lower() for k in ["author-name", "byline", "author"]))
        if author_tag:
            author_text = author_tag.get_text(strip=True)
            if len(author_text) < 60:
                author = author_text
                
    # Extract Publication Date
    published_date = None
    date_meta = (
        soup.find("meta", property="article:published_time") or
        soup.find("meta", attrs={"name": "pubdate"}) or
        soup.find("meta", attrs={"name": "date"}) or
        soup.find("meta", property="og:pubdate")
    )
    if date_meta and date_meta.get("content"):
        published_date = date_meta["content"].strip()
    else:
        time_tag = soup.find("time")
        if time_tag and (time_tag.get("datetime") or time_tag.get_text()):
            published_date = time_tag.get("datetime") or time_tag.get_text(strip=True)
            
    # Extract Image URL
    image_url = None
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        image_url = og_image["content"].strip()
        
    # Extract Main Article Body
    article_text = ""
    # Try finding semantic article container
    article_container = soup.find("article") or soup.find("main") or soup.find(class_=lambda c: c and any(k in str(c).lower() for k in ["article-body", "story-body", "post-content", "entry-content"]))
    
    if article_container:
        paragraphs = article_container.find_all("p")
        texts = [p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 20]
        article_text = "\n\n".join(texts)
        
    if not article_text or len(article_text) < 100:
        # Fallback to all document paragraphs
        paragraphs = soup.find_all("p")
        texts = [p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 30]
        article_text = "\n\n".join(texts)
        
    if not article_text or len(article_text.strip()) < 80:
        return {
            "success": False,
            "error_type": "empty_content",
            "message": "We couldn't extract sufficient readable text from this page. Please copy and paste the article text manually."
        }
        
    return {
        "success": True,
        "title": title or "Untitled Article",
        "publisher": publisher,
        "domain": domain,
        "author": author,
        "published_date": published_date,
        "image_url": image_url,
        "article_text": article_text,
        "source_url": url,
        "word_count": len(article_text.split())
    }
