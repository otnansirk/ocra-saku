from ..minio import upload_base64_image_to_minio
from playwright.sync_api import sync_playwright
from ..supabase import supabase_client
from dotenv import load_dotenv
from bs4 import BeautifulSoup
import time


def scrape_pdki(per_page=100, max_pages=100):
    load_dotenv()

    url = "https://pdki-indonesia.dgip.go.id/search"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        page.goto(url, wait_until="domcontentloaded")
        js_code = f"""
            localStorage.setItem("search-store", JSON.stringify({{
            state: {{
                method: "NORMAL",
                captchaToken: null,
                keywords: "",
                category: "trademark",
                selectedStatus: [],
                searchIndex: "trademark",
                mustQuery: [],
                shouldQuery: [],
                filterQuery: [],
                pageFrom: 0,
                pageSize: {per_page},
                aggs: {{
                country: {{ terms: {{ field: "owner.country_name" }} }},
                provinces: {{ terms: {{ field: "province.province_keyword" }} }},
                names: {{ terms: {{ field: "nama_merek_keyword" }} }},
                consultants: {{ terms: {{ field: "consultant.reprs_name_keyword" }} }}
                }},
                esQuery: {{}},
                queryList: [],
                searchTrigger: Date.now()
            }},
            version: 0
            }}));
        """
        page.evaluate(js_code)
        print(f"🔄 Memuat halaman.")

        page.reload(wait_until="networkidle")
        time.sleep(2)
        all_results = []

        while True:
            results = []
            page.wait_for_selector("div.flex.flex-col.gap-6.w-\\[86vw\\].max-w-\\[86vw\\].md\\:w-full")

            html = page.content()
            
            soup = BeautifulSoup(html, "html.parser")
            divwrap = soup.select_one("div.flex.flex-col.gap-6.w-\\[86vw\\].max-w-\\[86vw\\].md\\:w-full")
            if not divwrap:
                print(f"⚠️ Tidak ada data di halaman ini, stop scraping. {divwrap}", divwrap)
                break

            for card in divwrap.select('a'):
                link = card.get('href', "Unknown").strip()
                merk_name = card.select_one("h1.text-md.md\\:text-lg.cursor-pointer").get_text(strip=True)
                merk_status = card.select_one("div.inline-flex.items-center").get_text(strip=True)
                merk_logo = card.select_one("img.w-28.h-28.rounded.border.object-contain").get("src", "Unknown").strip()
                merk_class = card.select_one("p.text-sm").get_text(strip=True)
                merk_desc = card.select_one("p.text-gray-400.font-medium.text-sm.line-clamp-1").get_text(strip=True)
                merk_owner = card.select_one("div.flex.gap-1.text-sm").get_text(strip=True)
                merk_application_number = card.select_one("p.text-gray-400.font-medium.text-sm").get_text(strip=True)

                # Upload base64 logo to MinIO and get URL
                merk_logo_url = None
                if merk_logo and merk_logo.startswith("data:image"):
                    try:
                        merk_logo_url = upload_base64_image_to_minio(merk_logo, object_name=f"{merk_name.replace(' ', '_').lower()}_logo.png")["url"]
                    except Exception as e:
                        merk_logo_url = f"upload_error: {e}"
                else:
                    merk_logo_url = merk_logo  # fallback: keep original src

                data = {
                    "link": link,
                    "name": merk_name,
                    "status": merk_status,
                    "class": merk_class,
                    "description": merk_desc,
                    "owner": merk_owner,
                    "application_number": merk_application_number,
                    "logo_url": merk_logo_url
                }
                results.append(data)

            # --- insert ke supabase ---
            try:
                supabase_client().table("pdki").upsert(results, on_conflict="application_number").execute()
            except Exception as e:
                print(f"Supabase insert error: {e}")


            try:
                next_btn = page.get_by_role("button", name="Next")
                fifty_btn = page.get_by_role("button", name="500")

                if next_btn.is_visible():
                    print("➡️ Klik tombol Next")
                    next_btn.click()
                    page.wait_for_load_state("networkidle")

                elif fifty_btn.is_visible():
                    print("➡️ Tidak ada Next, klik tombol 500 lalu selesai.")
                    fifty_btn.click()
                    page.wait_for_load_state("networkidle")
                    break

                else:
                    print("⚠️ Tidak ada tombol Next atau 500, berhenti.")
                    break

            except Exception as e:
                print(f"⚠️ Error saat navigasi tombol: {e}")
                break


        browser.close()
        return len(results)

if __name__ == "__main__":
    per_page = 20
    print(scrape_pdki(per_page=per_page))