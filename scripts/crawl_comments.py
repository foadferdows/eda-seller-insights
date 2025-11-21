#!/usr/bin/env python3
import csv
import re
import time
from pathlib import Path

import requests

BASE_DIR = Path(__file__).resolve().parent.parent
#DATA_DIR = "/Users/foadferdows/Desktop/project/ERD/Data"
DATA_DIR = BASE_DIR / "Data"
DATA_DIR.mkdir(exist_ok=True)

URL_CSV = DATA_DIR / "urls.csv"
OUT_CSV = DATA_DIR / "comments_raw.csv"

# Very light headers so we look like a browser
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    )
}

DIGIKALA_COMMENT_API = "https://api.digikala.com/v1/product/{pid}/comments/?page={page}"


def extract_numeric_id(product_url: str) -> str | None:
    """
    Extract numeric Digikala id from a product URL like
    https://www.digikala.com/product/dkp-696864/...
    """
    m = re.search(r"dkp-(\d+)", product_url)
    return m.group(1) if m else None


def load_product_urls(path: Path):
    with path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            product_id = row.get("product_id") or row.get("sku") or row.get("id")
            url = row.get("url") or row.get("product_url")
            if not product_id or not url:
                continue
            yield product_id.strip(), url.strip()


def fetch_comments_for_product(product_id: str, product_url: str, max_pages: int = 10):
    pid = extract_numeric_id(product_url)
    if not pid:
        print(f"[WARN] Could not detect numeric id in URL for {product_id}: {product_url}")
        return []

    all_comments = []
    for page in range(1, max_pages + 1):
        api_url = DIGIKALA_COMMENT_API.format(pid=pid, page=page)
        resp = requests.get(api_url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            print(f"[WARN] HTTP {resp.status_code} for {api_url}")
            break

        try:
            payload = resp.json()
        except Exception as e:
            print(f"[WARN] .json() failed for {api_url}: {e}")
            break

        # Structure may change; try a few common patterns
        data = payload.get("data") or {}
        comments = (
            data.get("comments")
            or data.get("hits")
            or data.get("items")
            or []
        )

        if not comments:
            break

        for c in comments:
            all_comments.append(
                {
                    "product_id": product_id,
                    "digikala_id": pid,
                    "comment_id": c.get("id"),
                    "rating": c.get("rate") or c.get("score"),
                    "title": (c.get("title") or "").strip(),
                    "body": (c.get("body") or c.get("comment") or "").strip(),
                    "created_at": c.get("created_at") or c.get("created_at_dt"),
                    "recommendation_status": c.get("recommendation_status"),
                    "likes": c.get("likes"),
                    "dislikes": c.get("dislikes"),
                }
            )

        # be nice to their servers
        time.sleep(1.0)

    return all_comments


def main():
    all_rows = []

    for product_id, url in load_product_urls(URL_CSV):
        print(f"Fetching comments for {product_id} ...")
        comments = fetch_comments_for_product(product_id, url)
        all_rows.extend(comments)

    if not all_rows:
        print("No comments fetched; nothing to write.")
        return

    fieldnames = list(all_rows[0].keys())
    with OUT_CSV.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_rows)

    print(f"Saved {len(all_rows)} comments to {OUT_CSV}")


if __name__ == "__main__":
    main()

