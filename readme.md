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


from paddleocr import PaddleOCR
import cv2
import json
import pandas as pd

# === 1. Preprocessing Gambar Cepat ===
def preprocess_image(img_path):
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)  # langsung grayscale, lebih cepat
    h, w = img.shape

    # Resize hanya jika > 1280px di sisi terpanjang
    if max(h, w) > 1280:
        scale = 1280 / max(h, w)
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    # Tingkatkan kontras ringan (alpha kecil biar OCR tidak over-sharpen)
    img = cv2.convertScaleAbs(img, alpha=1.3, beta=10)

    # Sedikit blur untuk hilangkan noise, kernel kecil = cepat
    img = cv2.GaussianBlur(img, (3, 3), 0)

    processed_path = "processed_temp.jpg"
    cv2.imwrite(processed_path, img)
    return processed_path

# === 2. Jalankan OCR Lite (lebih cepat) ===
def parse_receipt(img_path):
    ocr = PaddleOCR(
        use_angle_cls=False,   # skip rotasi, lebih cepat
        lang='en',             # ganti 'en' kalau multi bahasa
        show_log=False
    )
    return ocr.ocr(img_path, cls=False)

# === 3. Ekstrak Item & Total ===
def extract_data(results):
    items = []
    total = None
    for line in results[0]:
        text = line[1][0]
        # Deteksi item + harga
        if any(char.isdigit() for char in text):
            parts = text.split()
            if len(parts) >= 2 and parts[-1].replace(",", "").replace(".", "").isdigit():
                items.append({"item": " ".join(parts[:-1]), "price": parts[-1]})
        # Deteksi total
        if "TOTAL" in text.upper() or "HARGA JUAL" in text.upper():
            total = ''.join([c for c in text if c.isdigit() or c in [".", ","]])
    return items, total

# === 4. Simpan ke JSON & CSV ===
def save_results(items, total):
    data = {"items": items, "total": total}
    with open("output.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    df = pd.DataFrame(items)
    df["total"] = total
    df.to_csv("output.csv", index=False, encoding="utf-8")

if __name__ == "__main__":
    image_path = "/Users/otnansirk/Downloads/warung-pasta.jpg"
    processed = preprocess_image(image_path)
    results = parse_receipt(processed)
    items, total = extract_data(results)
    save_results(items, total)
    print("✅ OCR selesai lebih cepat! Hasil tersimpan di output.json dan output.csv")
