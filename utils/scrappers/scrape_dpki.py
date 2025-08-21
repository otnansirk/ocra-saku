from utils.minio import upload_base64_image_to_minio
from playwright.sync_api import sync_playwright
from utils.supabase import supabase_client
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from datetime import datetime
from utils.scrappers.filtering_pdki import filtering
import os


def wait_for_selector(page):
    try:
        page.wait_for_selector("div.flex.space-x-4.w-full", state="detached", timeout=300000)
        page.wait_for_selector("div.flex.flex-col.gap-6 a", timeout=300000)
    except Exception as e:
        count_before = len(page.query_selector_all("div.flex.flex-col.gap-6 a"))
        page.wait_for_function(
            """oldCount => {
                const newCount = document.querySelectorAll('div.flex.flex-col.gap-6 a').length;
                return newCount !== oldCount && newCount > 0;
            }""",
            arg=count_before,
            timeout=300000
        )

def scrape_pdki(per_page=100, max_pages=100, filtering_data=None, minio_bucket=None, minio_folder=None, database_table=None):

    url = "https://pdki-indonesia.dgip.go.id/search"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        page.goto(url, wait_until="domcontentloaded")
        page.evaluate(filtering_data)
        print(f"🔄 Fisrt load Page. {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        page.reload(wait_until="networkidle")
        
        i = 1
        while True:
            print("➡️ Load page", i)
            
            page.wait_for_selector("div.flex.flex-col.gap-4")

            html = page.content()
            soup = BeautifulSoup(html, "html.parser")
            divwrap = soup.select_one("div.flex.flex-col.gap-4")
            if not divwrap:
                print(f"⚠️ Data is empty, stop scrapping. {divwrap}", divwrap)
                break

            items = divwrap.select("div.flex.flex-col.gap-6")
            if not items:
                print("⚠️ No items found inside divwrap.")
                break

            for card in items[0].select('a'):
                link = card.get('href', "Unknown").strip()
                merk_name = card.select_one("h1.text-md.md\\:text-lg.cursor-pointer").get_text(strip=True)
                merk_logo = card.select_one("img.w-28.h-28.rounded.border.object-contain").get("src", "Unknown").strip()
                
                status_n_appwrap = card.select_one("div.flex.flex-col.md\\:flex-row.gap-2.md\\:items-center")
                merk_status = status_n_appwrap.select_one("div.inline-flex.items-center").get_text(strip=True)
                merk_application_number = status_n_appwrap.select_one("p.text-gray-400.font-medium.text-sm").get_text(strip=True)
                
                merk_class = card.select("p.text-sm")[1].get_text(strip=True)
                merk_desc = card.select_one("p.text-gray-400.font-medium.text-sm.line-clamp-1").get_text(strip=True)
                merk_owner = card.select_one("div.flex.gap-1.text-sm").get_text(strip=True)

                # Upload base64 logo to MinIO and get URL
                merk_logo_url = None
                if merk_logo and merk_logo.startswith("data:image"):
                    try:
                        merk_logo_url = upload_base64_image_to_minio(merk_logo, object_name=f"{merk_name.replace(' ', '_').lower()}_logo.png", bucket=minio_bucket, folder=minio_folder)["url"]
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

                # --- insert ke supabase ---
                try:
                    supabase_client().table(database_table).upsert(data, on_conflict="application_number").execute()
                except Exception as e:
                    print(f"Supabase insert error: {e}")


            try:
                next_btn = page.get_by_role("button", name="Next")
                fifty_btn = page.get_by_role("button", name=str(max_pages))

                if next_btn.is_visible():
                    print("➡️ Click next button to load more results.")
                    next_btn.click()
                    page.wait_for_load_state("networkidle")
                    wait_for_selector(page)
 
                elif fifty_btn.is_visible():
                    print(f"➡️ Can't see next button, clicking {max_pages} results per page.")
                    fifty_btn.click()
                    page.wait_for_load_state("networkidle")
                    wait_for_selector(page)

                else: 
                    print("⚠️ Not enough results to paginate, stopping.")
                    break

            except Exception as e:
                print(f"⚠️ Error when navigate: {e}")
                break

            print("Loading page", i)
            i += 1

        browser.close()
        return f"Last page {i}"

if __name__ == "__main__":
    load_dotenv()

    per_page = 1000
    max_pages = 10000/per_page
    filtering_data = filtering(
        per_page=per_page,
        # keywords="add keywords",
        # tanggal_permohonan="2025",
        # tanggal_pengumuman="2025-08-01|2025-08-30",
        # tanggal_pendaftaran="2025-08-01|2025-08-30",
        # tanggal_dimulai_perlindungan="2025-08-01|2025-08-30",
        # tanggal_berakhir_perlindungan="2025-08-01|2025-08-30",
        nama_merek="redbox"
    )

    res = scrape_pdki(
        per_page=per_page,
        max_pages=int(max_pages),
        filtering_data=filtering_data,
        minio_bucket=os.getenv("MINIO_PUBLIC_BUCKET"),
        minio_folder=os.getenv("MINIO_PUBLIC_FOLDER"),
        database_table=os.getenv("SUPABASE_TABLE")
    )

    print(res, datetime.now().strftime("%Y-%m-%d %H:%M:%S"))