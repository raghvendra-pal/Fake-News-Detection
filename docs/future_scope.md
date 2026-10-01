# Future Scope & Extensions — TruthLens

This document outlines architectural roadmaps and potential extensions for future academic iterations and enterprise deployment of TruthLens.

---

## 1. Multilingual Natural Language Processing
- **Regional Language Support**: Integration of multilingual embeddings (e.g. `IndicBERT`, `mBERT`, `XLM-RoBERTa`) to assess non-English and regional news (e.g., Hindi, Tamil, Bengali, Telugu, Spanish).
- **Cross-Lingual Fact-Checking**: Corroborating vernacular WhatsApp forwards and news items against international English news registries using zero-shot cross-lingual transfer.

---

## 2. Deep Transformer Integration & Edge Quantization
- **Configurable Transformer Backends**: Enabling `MODEL_TYPE=transformer` to load fine-tuned `DistilBERT` or `DeBERTa-v3` checkpoints when GPU resources are available.
- **ONNX Runtime / 8-Bit Quantization**: Exporting Transformer models to ONNX INT8 format to enable real-time sub-50ms inference on standard CPUs without GPU dependencies.

---

## 3. Knowledge Graph Verification
- **Wikidata & DBpedia Triples Extraction**: Parsing extracted claims into Subject-Predicate-Object (SPO) semantic triples (e.g., `(NASA, announced, Mars Colony 2027)`).
- **Graph Traversal**: Querying verified knowledge graphs to validate whether entity properties and historical dates corroborate the extracted triples.

---

## 4. Multi-Modal Verification (Image & Video)
- **Reverse Image Search Integration**: Integrating Google Lens / TinEye APIs to check whether images accompanying news articles are recycled from prior unrelated events.
- **EXIF Metadata Forensics**: Inspecting capture timestamp, camera serial numbers, and compression artifacts to detect AI-generated imagery or edited composites.

---

## 5. Browser Extension & Social Media Integration
- **Chrome / Firefox Manifest V3 Extension**: Delivering real-time TruthLens credibility badges directly over Twitter/X, Reddit, Facebook, and news portals as the user browses.
- **One-Click Review Inspection**: Directly embedding the review credibility meter onto Amazon and Flipkart product pages.
