import csv
from pathlib import Path
from django.conf import settings

# فرض: پوشه Data کنار manage.py است
BASE = Path(settings.BASE_DIR) / "Data"


def _load_csv(filename: str):
    path = BASE / filename
    rows = []
    with path.open(encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows


def load_products():
    rows = _load_csv("products.csv")
    for r in rows:
#        r["product_id"] = int(r["product_id"])
        r["cost_price"] = float(r["cost_price"])
        r["selling_price"] = float(r["selling_price"])
    return rows


def load_sales():
    rows = _load_csv("sales.csv")
    for r in rows:
        r["product_id"] = int(r["product_id"])
        r["quantity"] = int(r["quantity"])
        r["final_price"] = float(r["final_price"])
        r["commission"] = float(r["commission"])
        r["shipping_cost"] = float(r["shipping_cost"])
    return rows


def load_inventory():
    rows = _load_csv("inventory.csv")
    for r in rows:
        r["product_id"] = int(r["product_id"])
        r["current_stock"] = int(r["current_stock"])
        r["restock_quantity"] = int(r["restock_quantity"])
    return rows


def load_pricing():
    rows = _load_csv("pricing.csv")
    for r in rows:
        r["product_id"] = int(r["product_id"])
        r["price"] = float(r["price"])
        r["discount"] = float(r["discount"])
    return rows


def load_reviews():
    rows = _load_csv("reviews.csv")
    for r in rows:
        r["product_id"] = int(r["product_id"])
        r["score"] = int(r["score"])
    return rows

