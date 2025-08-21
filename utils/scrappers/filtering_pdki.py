
import json

def generate_query_list(
    keywords=None,
    tanggal_permohonan=None,
    tanggal_pengumuman=None,
    tanggal_pendaftaran=None,
    tanggal_dimulai_perlindungan=None,
    tanggal_berakhir_perlindungan=None,
    nama_merek=None
):
    query_list = []

    # 1. keywords
    if keywords:
        query_list.append({
            "key": "keywords",
            "queryType": "must",
            "query": [
                {
                    "bool": {
                        "should": [
                            {"match": {"id": keywords}},
                            {"match": {"nomor_permohonan": keywords}},
                            {"match": {"nomor_pendaftaran": keywords}},
                            {"match_phrase": {"owner.tm_owner_name": keywords}},
                            {"match_phrase": {"nama_merek": f"{keywords}*"}}
                        ]
                    }
                }
            ],
            "data": keywords
        })

    # Helper for date range
    def make_range_query(key, value):
        if "|" in value:  # format range (ex: 2025-08-01|2025-08-30)
            gte, lte = value.split("|", 1)
        else:  # single year (ex: 2025)
            gte, lte = f"{value}||/y", f"{value}||/y"

        return {
            "key": key,
            "queryType": "filter",
            "query": [
                {
                    "range": {
                        key: {
                            "gte": gte,
                            "lte": lte
                        }
                    }
                }
            ],
            "data": value
        }

    # 2. tanggal_permohonan
    if tanggal_permohonan:
        query_list.append(make_range_query("tanggal_permohonan", tanggal_permohonan))

    # 3. tanggal_pengumuman
    if tanggal_pengumuman:
        query_list.append(make_range_query("tanggal_pengumuman", tanggal_pengumuman))

    # 4. tanggal_pendaftaran
    if tanggal_pendaftaran:
        query_list.append(make_range_query("tanggal_pendaftaran", tanggal_pendaftaran))

    # 5. tanggal_dimulai_perlindungan
    if tanggal_dimulai_perlindungan:
        query_list.append(make_range_query("tanggal_dimulai_perlindungan", tanggal_dimulai_perlindungan))

    # 6. tanggal_berakhir_perlindungan
    if tanggal_berakhir_perlindungan:
        query_list.append(make_range_query("tanggal_berakhir_perlindungan", tanggal_berakhir_perlindungan))

    # 7. nama_merek
    if nama_merek:
        query_list.append({
            "key": "nama_merek",
            "queryType": "must",
            "query": [
                {"match": {"nama_merek": nama_merek}}
            ],
            "data": nama_merek
        })

    return json.dumps(query_list, ensure_ascii=False)


def to_fstring_safe_json(data: dict) -> str:
    """
    Convert dict -> JSON string -> escape { } to {{ }} for f-string safety
    """
    json_str = json.dumps(data, indent=4, ensure_ascii=False)
    return json_str.replace("{", "{{").replace("}", "}}")


def filtering(per_page, keywords=None, tanggal_permohonan=None, tanggal_pengumuman=None,
              tanggal_pendaftaran=None, tanggal_dimulai_perlindungan=None,
              tanggal_berakhir_perlindungan=None, nama_merek=None):

    query_safe = generate_query_list(
        keywords=keywords,
        tanggal_permohonan=tanggal_permohonan,
        tanggal_pengumuman=tanggal_pengumuman,
        tanggal_pendaftaran=tanggal_pendaftaran,
        tanggal_dimulai_perlindungan=tanggal_dimulai_perlindungan,
        tanggal_berakhir_perlindungan=tanggal_berakhir_perlindungan,
        nama_merek= nama_merek
    )
    

    return f"""
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
                queryList: {query_safe},
                searchTrigger: Date.now(),
                sort: {{
                    "tanggal_pengumuman": "desc"
                }}
            }},
            version: 0
        }}));
    """