# clean_ai_cache.sh
rm -rf ~/.paddleocr ~/.paddlehub ~/.cache/huggingface ~/.cache/torch/hub ~/.keras ~/Library/Caches/pip

# OCRa

**OCRa** (*Optical Character Recognition Assistant*) is a lightweight service for extracting text from various media sources such as images, scanned documents, and audio.  
It is designed to be **fast, accurate, and easy to integrate**, with optional support for **Text-to-Speech (TTS)** and **Speech-to-Text (STT)**.

## ✨ Key Features

- **OCR (Optical Character Recognition)**  
  Extracts text from images or scanned documents, including receipts with varying formats.
- **TTS (Text-to-Speech)** *(optional)*  
  Converts text into natural-sounding speech.
- **STT (Speech-to-Text)** *(optional)*  
  Converts speech into text with high accuracy.
- **Multi-format Input**  
  Supports JPG, PNG, PDF, and common audio formats (MP3, WAV).
- **Fast & Lightweight API**  
  Powered by **FastAPI**, suitable for small to medium-scale workloads.
- **Stateless Service**  
  Does not store data permanently (privacy-friendly).

## 🚀 Architecture
[Client] → [OCRa API] → [Processing Engine] → [JSON / Audio Response]

- **FastAPI** → API server for request/response handling  
- **PaddleOCR** → High-accuracy OCR engine  
- **TTS/STT Engine** → Optional speech processing modules  
- **Stateless** → Data is processed only during requests, not stored

## 📦 Installation
> Requires Python 3.10+ and `venv` for environment isolation.

```bash
# Clone the repository
git clone git@github.com:otnansirk/ocra-saku.git
cd ocra-saku

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

# Usage
Run the Server
```
uvicorn main:app --reload
```