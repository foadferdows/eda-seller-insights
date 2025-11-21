#!/usr/bin/env python3
import csv
from collections import Counter, defaultdict
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

COMMENTS_CSV = DATA_DIR / "comments_raw.csv"
OUT_SUMMARY_CSV = DATA_DIR / "comments_summary.csv"


ISSUE_KEYWORDS = {
    "price": ["قیمت", "گرون", "گران", "ارزون", "ارزان"],
    "quality": ["کیفیت", "دوام", "شکست", "خراب", "معیوب"],
    "delivery": ["ارسال", "پست", "تحویل", "تاخیر", "دیر"],
    "packaging": ["بسته بندی", "بسته‌بندی", "جعبه", "کارتن", "پک"],
}

POSITIVE_KEYWORDS = {
    "quality": ["کیفیت خوب", "عالی", "دوام خوب", "محکم", "راضی ام"],
    "price": ["قیمت مناسب", "به صرفه", "ارزش خرید"],
    "delivery": ["ارسال سریع", "به موقع"],
    "packaging": ["بسته بندی خوب", "بسته‌بندی عالی", "جمع و جور"],
}


def detect_issues(text: str) -> set[str]:
    text = text or ""
    found = set()
    for label, words in ISSUE_KEYWORDS.items():
        if any(w in text for w in words):
            found.add(label)
    return found


def detect_highlights(text: str) -> set[str]:
    text = text or ""
    found = set()
    for label, phrases in POSITIVE_KEYWORDS.items():
        if any(p in text for p in phrases):
            found.add(label)
    return found


def classify_sentiment_from_rating(rating):
    try:
        r = float(rating)
    except (TypeError, ValueError):
        return "neutral"

    if r >= 4:
        return "positive"
    if r <= 2:
        return "negative"
    return "neutral"


def build_summary_sentence(pos_ratio, neg_ratio, recent_delta, recent_packaging_issue):
    parts = []

    # Base satisfaction level
    if pos_ratio >= 0.7:
        parts.append("Overall customer satisfaction with this product is high.")
    elif pos_ratio >= 0.4:
        parts.append("Customer satisfaction with this product is mixed.")
    else:
        parts.append("Overall customer satisfaction with this product is low.")

    # Trend
    if recent_delta is not None:
        if recent_delta <= -0.15:
            parts.append("Recent reviews show a decline in satisfaction.")
        elif recent_delta >= 0.15:
            parts.append("Recent reviews show an improvement in satisfaction.")

    # Packaging note
    if recent_packaging_issue:
        parts.append("The last few reviewers complained about the packaging.")

    return " ".join(parts)


def main():
    df = pd.read_csv(COMMENTS_CSV)

    # Fallbacks
    if "rating" not in df.columns:
        df["rating"] = None

    df["sentiment_label"] = df["rating"].apply(classify_sentiment_from_rating)
    df["body"] = df["body"].fillna("")

    summaries = []

    for product_id, g in df.groupby("product_id"):
        g = g.copy()

        total = len(g)
        pos = (g["sentiment_label"] == "positive").sum()
        neg = (g["sentiment_label"] == "negative").sum()
        neu = (g["sentiment_label"] == "neutral").sum()

        pos_ratio = pos / total if total else 0
        neg_ratio = neg / total if total else 0
        sentiment_score = (pos - neg) / total if total else 0  # between -1 and +1

        # Convert created_at to datetime if possible
        if "created_at" in g.columns:
            g["created_at_dt"] = pd.to_datetime(g["created_at"], errors="coerce")
            g = g.sort_values("created_at_dt")
        else:
            g["created_at_dt"] = None

        # Trend: last 5 vs the rest
        recent = g.tail(5)
        older = g.iloc[:-5] if len(g) > 5 else pd.DataFrame(columns=g.columns)

        def ratio_pos(x):
            n = len(x)
            return ((x["sentiment_label"] == "positive").sum() / n) if n else None

        recent_pos_ratio = ratio_pos(recent)
        older_pos_ratio = ratio_pos(older)
        recent_delta = None
        if recent_pos_ratio is not None and older_pos_ratio is not None:
            recent_delta = recent_pos_ratio - older_pos_ratio

        # Issues & highlights
        issue_counts = Counter()
        highlight_counts = Counter()
        packaging_recent_flag = False

        for _, row in g.iterrows():
            text = row["body"]
            issues = detect_issues(text)
            highs = detect_highlights(text)
            issue_counts.update(issues)
            highlight_counts.update(highs)

        # Check packaging in last 2–3 comments with non-good rating
        for _, row in recent.iterrows():
            if classify_sentiment_from_rating(row["rating"]) != "positive":
                if "packaging" in detect_issues(row["body"]):
                    packaging_recent_flag = True
                    break

        top_issues = [lbl for lbl, _ in issue_counts.most_common(3)]
        top_highlights = [lbl for lbl, _ in highlight_counts.most_common(3)]

        summary_sentence = build_summary_sentence(
            pos_ratio, neg_ratio, recent_delta, packaging_recent_flag
        )

        # Sample Farsi comments (for display in UI)
        sample_comments = list(g["body"].head(3))

        summaries.append(
            {
                "product_id": product_id,
                "total_reviews": int(total),
                "avg_rating": float(g["rating"].astype(float).mean()) if total else 0.0,
                "positive_share": round(pos_ratio * 100, 1),
                "negative_share": round(neg_ratio * 100, 1),
                "sentiment_score": round(sentiment_score, 3),  # -1 .. +1
                "summary_en": summary_sentence,
                "top_issues_en": ", ".join(top_issues),        # e.g. "packaging, price"
                "top_highlights_en": ", ".join(top_highlights),
                # keep Farsi to show as “نمونه نظرات”
                "sample_comments_fa": " || ".join(sample_comments),
            }
        )

    if not summaries:
        print("No rows to summarise.")
        return

    fieldnames = list(summaries[0].keys())
    with OUT_SUMMARY_CSV.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(summaries)

    print(f"Saved {len(summaries)} product summaries to {OUT_SUMMARY_CSV}")


if __name__ == "__main__":
    main()

