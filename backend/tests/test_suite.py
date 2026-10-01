import sys
import os

# Ensure root in path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from starlette.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    print("PASS: /api/health")

def test_news_text_analysis():
    # Test Real News
    real_payload = {
        "title": "ISRO launches navigation satellite",
        "text": "The Indian Space Research Organisation on Monday launched a next-generation navigation satellite into geostationary transfer orbit from Sriharikota with an atomic clock."
    }
    resp = client.post("/api/news/analyze-text", json=real_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["prediction"] in ["REAL", "SUSPICIOUS", "FAKE"]
    assert "confidence" in data
    assert "signals" in data
    assert "why_this_result" in data
    assert "model_signals" in data["why_this_result"]
    assert "external_evidence" in data["why_this_result"]
    print("PASS: /api/news/analyze-text (Real)")

    # Test Fake News
    fake_payload = {
        "title": "SHOCKING Miracle cure discovered!",
        "text": "Secret Himalayan herb cures all terminal diseases in 48 hours without surgery! Big Pharma is terrified! Share this immediately before deleted!"
    }
    resp_fake = client.post("/api/news/analyze-text", json=fake_payload)
    assert resp_fake.status_code == 200
    data_fake = resp_fake.json()
    assert data_fake["prediction"] in ["SUSPICIOUS", "FAKE"]
    assert len(data_fake["signals"]) > 0
    print("PASS: /api/news/analyze-text (Fake)")

def test_review_analysis():
    # Test Genuine Review
    genuine_payload = {
        "review_text": "I have been using these wireless headphones for about three weeks now during my daily metro commute. The active noise cancellation handles train rumble well, and battery life is around 26 hours. Build quality is sturdy with comfortable memory foam padding.",
        "product_name": "ANC Headphones",
        "category": "Electronics"
    }
    resp = client.post("/api/reviews/analyze", json=genuine_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["prediction"] in ["GENUINE", "SUSPICIOUS"]
    assert "signals_breakdown" in data
    print("PASS: /api/reviews/analyze (Genuine)")

    # Test Fake Review
    fake_payload = {
        "review_text": "THIS IS THE GREATEST PRODUCT IN THE ENTIRE WORLD! Absolutely unbelievable miracle quality! Everyone in the world must buy this immediately right now! Best purchase of my life 1000% recommended! Perfect in every single way! Don't hesitate just buy buy buy!",
        "product_name": "Gadget",
        "category": "General"
    }
    resp_fake = client.post("/api/reviews/analyze", json=fake_payload)
    assert resp_fake.status_code == 200
    data_fake = resp_fake.json()
    assert data_fake["prediction"] in ["FAKE", "SUSPICIOUS"]
    assert data_fake["signals_breakdown"]["promotional_intensity"] > 0
    print("PASS: /api/reviews/analyze (Fake)")

def test_latest_news_feed():
    resp = client.get("/api/news/latest?category=Technology&limit=5")
    assert resp.status_code == 200
    data = resp.json()
    assert "articles" in data
    assert len(data["articles"]) > 0
    print(f"PASS: /api/news/latest (Retrieved {len(data['articles'])} articles)")

def test_dashboard_and_history():
    # Check stats
    resp_stats = client.get("/api/history/dashboard/stats")
    assert resp_stats.status_code == 200
    stats = resp_stats.json()
    assert stats["has_history"] is True
    assert stats["total_analyzed"] >= 2
    print(f"PASS: /api/history/dashboard/stats (Total analyzed: {stats['total_analyzed']})")

    # Check history listing
    resp_hist = client.get("/api/history?limit=10")
    assert resp_hist.status_code == 200
    hist = resp_hist.json()
    assert hist["total"] >= 2
    assert len(hist["items"]) >= 2
    record_id = hist["items"][0]["id"]
    print(f"PASS: /api/history (Retrieved {len(hist['items'])} items)")

    # Check detail
    resp_detail = client.get(f"/api/history/{record_id}")
    assert resp_detail.status_code == 200
    detail = resp_detail.json()
    assert detail["id"] == record_id
    print(f"PASS: /api/history/{record_id} Detail View")

def test_model_evaluation():
    resp = client.get("/api/model/evaluation")
    assert resp.status_code == 200
    data = resp.json()
    assert data["evaluation_data"]["status"] == "ready"
    assert "news_detection" in data["evaluation_data"]
    assert "review_detection" in data["evaluation_data"]
    print("PASS: /api/model/evaluation")

if __name__ == "__main__":
    print("\n========== RUNNING TRUTHLENS AUTOMATED TEST SUITE ==========\n")
    test_health()
    test_news_text_analysis()
    test_review_analysis()
    test_latest_news_feed()
    test_dashboard_and_history()
    test_model_evaluation()
    print("\n[ALL TESTS PASSED SUCCESSFULLY!]")
