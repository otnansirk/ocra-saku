from paddleocr import PaddleOCR


def parse_receipt(img_path):
    ocr = PaddleOCR(
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False)

    results = ocr.predict(img_path)
    return results

if __name__ == "__main__":
    image_path = "/home/k15/Downloads/struk.jpg"
    results = parse_receipt(image_path)
    reciept = results[0]
    texts = reciept['rec_texts']
    print(texts)
    print("✅ OCR selesai! Hasil tersimpan di output.json dan output.csv")
