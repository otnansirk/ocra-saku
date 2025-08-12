from paddleocr import PPStructureV3
from pathlib import Path
import cv2
import json
import pandas as pd

# === 1. Preprocessing Gambar ===
def preprocess_image(img_path):
    img = cv2.imread(img_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Tingkatkan kontras
    gray = cv2.convertScaleAbs(gray, alpha=1.5, beta=0)
    # Hilangkan noise kecil
    gray = cv2.medianBlur(gray, 3)
    processed_path = "processed_temp.jpg"
    cv2.imwrite(processed_path, gray)
    return processed_path

# === 2. Jalankan OCR Layout Parsing ===
def parse_receipt(img_path):
    pipeline = PPStructureV3(
        use_doc_orientation_classify=True,
        use_doc_unwarping=False
    )
    results = pipeline.predict(img_path)
    return results

# === 3. Ekstrak Item & Total ===
def extract_data(results):
    items = []
    total = None
    for res in results:
        text_data = res["layout_parsing_result"]
        for block in text_data:
            if "text" in block:
                line = block["text"]
                # Coba deteksi item + harga
                if any(char.isdigit() for char in line):
                    parts = line.split()
                    if len(parts) >= 2 and parts[-1].replace(",", "").replace(".", "").isdigit():
                        items.append({
                            "item": " ".join(parts[:-1]),
                            "price": parts[-1]
                        })
                # Deteksi total
                if "TOTAL" in line.upper() or "HARGA JUAL" in line.upper():
                    total = ''.join([c for c in line if c.isdigit() or c in [".", ","]])
    return items, total

# === 4. Simpan ke JSON & CSV ===
def save_results(items, total):
    data = {
        "items": items,
        "total": total
    }
    # Simpan JSON
    with open("output.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    # Simpan CSV
    df = pd.DataFrame(items)
    df["total"] = total
    df.to_csv("output.csv", index=False, encoding="utf-8")

if __name__ == "__main__":
    image_path = "/Users/otnansirk/Downloads/warung-pasta.jpg"  # ganti sesuai gambar struk
    processed = preprocess_image(image_path)
    results = parse_receipt(processed)
    items, total = extract_data(results)
    save_results(items, total)
    print("✅ OCR selesai! Hasil tersimpan di output.json dan output.csv")

# OPSI TERAKHIR

# from paddleocr import PaddleOCR
# import cv2
# import json
# import pandas as pd

# # === 1. Preprocessing Gambar Cepat ===
# def preprocess_image(img_path):
#     img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)  # langsung grayscale, lebih cepat
#     h, w = img.shape

#     # Resize hanya jika > 1280px di sisi terpanjang
#     if max(h, w) > 1280:
#         scale = 1280 / max(h, w)
#         img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

#     # Tingkatkan kontras ringan (alpha kecil biar OCR tidak over-sharpen)
#     img = cv2.convertScaleAbs(img, alpha=1.3, beta=10)

#     # Sedikit blur untuk hilangkan noise, kernel kecil = cepat
#     img = cv2.GaussianBlur(img, (3, 3), 0)

#     processed_path = "processed_temp.jpg"
#     cv2.imwrite(processed_path, img)
#     return processed_path

# # === 2. Jalankan OCR Lite (lebih cepat) ===
# def parse_receipt(img_path):
#     ocr = PaddleOCR(
#         use_angle_cls=False,   # skip rotasi, lebih cepat
#         lang='en',             # ganti 'en' kalau multi bahasa
#         show_log=False
#     )
#     return ocr.ocr(img_path, cls=False)

# # === 3. Ekstrak Item & Total ===
# def extract_data(results):
#     items = []
#     total = None
#     for line in results[0]:
#         text = line[1][0]
#         # Deteksi item + harga
#         if any(char.isdigit() for char in text):
#             parts = text.split()
#             if len(parts) >= 2 and parts[-1].replace(",", "").replace(".", "").isdigit():
#                 items.append({"item": " ".join(parts[:-1]), "price": parts[-1]})
#         # Deteksi total
#         if "TOTAL" in text.upper() or "HARGA JUAL" in text.upper():
#             total = ''.join([c for c in text if c.isdigit() or c in [".", ","]])
#     return items, total

# # === 4. Simpan ke JSON & CSV ===
# def save_results(items, total):
#     data = {"items": items, "total": total}
#     with open("output.json", "w", encoding="utf-8") as f:
#         json.dump(data, f, indent=2, ensure_ascii=False)
#     df = pd.DataFrame(items)
#     df["total"] = total
#     df.to_csv("output.csv", index=False, encoding="utf-8")

# if __name__ == "__main__":
#     image_path = "/Users/otnansirk/Downloads/warung-pasta.jpg"
#     processed = preprocess_image(image_path)
#     results = parse_receipt(processed)
#     items, total = extract_data(results)
#     save_results(items, total)
#     print("✅ OCR selesai lebih cepat! Hasil tersimpan di output.json dan output.csv")
