#!/usr/bin/env python3
"""
Scrape posting dates from kehillanw.org and patch Sanity publishDate fields.
Dates come from individual article pages (format: "Mar 01st, 2026").
"""

import re, json, time, urllib.request, urllib.parse, urllib.error, sys

PROJECT_ID = "sn3t47dp"
DATASET = "production"
TOKEN = "skpXEM2MDDlf8m0E4rI3WkUXqXGCy3ltbj8e0hPGmZaUkLnkggabu7ken0jWAetGDuvpwR6Y96hXF1NwmjasPZFw7YFewCWbdW0sFBBVdCTyq26vFfelLdA4ofpqNAZ2PEExwyTl2q6CVKh0C337Y8Ey0eWkYgMJR4mpTJfOArfQQKE6hrWw"
QUERY_URL = f"https://{PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/{DATASET}"
MUTATE_URL = f"https://{PROJECT_ID}.api.sanity.io/v2021-10-21/data/mutate/{DATASET}"

OLD_SITE = "https://kehillanw.org"

MONTH_ABBR = {
    "jan": "01", "feb": "02", "mar": "03", "apr": "04",
    "may": "05", "jun": "06", "jul": "07", "aug": "08",
    "sep": "09", "oct": "10", "nov": "11", "dec": "12",
}

DATE_RE = re.compile(
    r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})(?:st|nd|rd|th),?\s+(\d{4})',
    re.I
)
COMMENT_RE = re.compile(r'<!--.*?-->', re.S)
ARTICLE_HREF_RE = re.compile(r'href=["\'](?:/?)(articles/[a-z0-9_/-]+\.html)["\']')

CATEGORIES = [
    "community", "education", "entertainment", "government", "support",
    "shopping", "travel", "shiurim", "cholim", "gemachim", "organisations",
    "halacha", "purim", "announcements", "local-guidance", "local-shops",
    "shop-announcements", "cateringtake-away", "kosher-outdoor-dining",
    "gifts", "outings-and-activities", "kashrus", "wellbeing", "women",
    "parenting", "health", "sport", "useful-info", "schools", "business",
    "local", "news", "jobs", "property", "food", "technology", "finance",
    "legal", "charity", "youth", "seniors", "culture", "arts", "kosher",
    "simcha", "events", "volunteering",
]


def fetch(url, timeout=15):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode("utf-8", errors="replace")
    except Exception as e:
        return None


def extract_date_from_article(html):
    """Extract posting date from an article page. First non-commented match wins."""
    # Remove HTML comments so we don't pick up old commented-out dates
    clean = COMMENT_RE.sub("", html)
    m = DATE_RE.search(clean)
    if not m:
        return None
    mon = MONTH_ABBR[m.group(1).lower()]
    day = m.group(2).zfill(2)
    yr = m.group(3)
    return f"{yr}-{mon}-{day}"


def collect_article_urls():
    """Scrape category pages to build a set of article URLs."""
    url_to_slug = {}  # {slug: category/slug path}

    for cat in CATEGORIES:
        for pg in range(1, 20):
            url = f"{OLD_SITE}/articles/{cat}/" if pg == 1 else f"{OLD_SITE}/articles/{cat}/?page={pg}"
            html = fetch(url, timeout=12)
            if not html:
                break

            hrefs = ARTICLE_HREF_RE.findall(html)
            if not hrefs:
                break

            new_found = 0
            for href in hrefs:
                # href is like "articles/purim/some-slug.html"
                parts = href.strip("/").split("/")
                if len(parts) < 3:
                    continue
                slug = parts[-1].replace(".html", "")
                path = "/".join(parts)  # "articles/category/slug.html"
                if slug not in url_to_slug:
                    url_to_slug[slug] = path
                    new_found += 1

            if pg == 1:
                print(f"  {cat}: {len(hrefs)} on p1, {new_found} new")
            if new_found == 0:
                break  # no new articles on this page

    return url_to_slug


def fetch_sanity_notices():
    notices = []
    for start in range(0, 3000, 500):
        end = start + 500
        groq = f"*[_type == 'notice'][{start}...{end}]{{_id, 'slug': slug.current, publishDate}}"
        url = QUERY_URL + "?query=" + urllib.parse.quote(groq)
        html = fetch(url, timeout=20)
        if not html:
            raise RuntimeError("Sanity query failed")
        data = json.loads(html)
        batch = data["result"]
        notices.extend(batch)
        print(f"  Fetched {len(notices)} notices so far...")
        if len(batch) < 500:
            break
    return notices


def apply_mutations(mutations):
    BATCH = 50
    applied = 0
    for i in range(0, len(mutations), BATCH):
        batch = mutations[i:i+BATCH]
        body = json.dumps({"mutations": batch}).encode()
        req = urllib.request.Request(
            MUTATE_URL,
            data=body,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {TOKEN}",
            },
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                applied += len(batch)
                print(f"  Patched {applied}/{len(mutations)}...")
        except urllib.error.HTTPError as e:
            print(f"  Batch failed HTTP {e.code}: {e.read().decode()[:200]}")
        except Exception as e:
            print(f"  Batch error: {e}")
    return applied


def main():
    print("=== KehillaNW Date Fix (Python) ===\n")

    # Step 1: Collect article URLs from category pages
    print("STEP 1: Collecting article URLs from category pages...")
    url_map = collect_article_urls()
    print(f"  Total unique article slugs found: {len(url_map)}\n")

    if not url_map:
        print("ERROR: No article URLs found. Aborting.")
        sys.exit(1)

    # Step 2: Fetch Sanity notices
    print("STEP 2: Fetching Sanity notices...")
    notices = fetch_sanity_notices()
    print(f"  Total notices in Sanity: {len(notices)}\n")

    # Step 3: For each Sanity notice, fetch its article page and get the date
    print("STEP 3: Fetching article pages for dates...")
    slug_date = {}
    missing_url = []

    total = len(notices)
    for i, notice in enumerate(notices):
        slug = notice.get("slug")
        if not slug:
            continue

        path = url_map.get(slug)
        if not path:
            missing_url.append(slug)
            continue

        article_url = f"{OLD_SITE}/{path}"
        html = fetch(article_url, timeout=12)
        if html:
            dt = extract_date_from_article(html)
            if dt:
                slug_date[slug] = dt

        if (i + 1) % 50 == 0:
            print(f"  Progress: {i+1}/{total} ({len(slug_date)} dates found)...")

        time.sleep(0.1)  # polite rate limiting

    print(f"\n  Dates extracted: {len(slug_date)}")
    print(f"  Slugs with no URL on old site: {len(missing_url)}")

    # Step 4: Build mutations
    print("\nSTEP 4: Building mutations...")
    mutations = []
    already_ok = 0

    for notice in notices:
        slug = notice.get("slug")
        if not slug:
            continue
        new_date = slug_date.get(slug)
        if new_date and new_date != notice.get("publishDate"):
            mutations.append({"patch": {"id": notice["_id"], "set": {"publishDate": new_date}}})
        elif new_date == notice.get("publishDate"):
            already_ok += 1

    print(f"  To update: {len(mutations)}")
    print(f"  Already correct: {already_ok}")
    print(f"  Unmatched (no URL found): {len(missing_url)}")

    if mutations:
        print(f"\nSTEP 5: Applying {len(mutations)} mutations to Sanity...")
        applied = apply_mutations(mutations)
        print(f"\n=== DONE: Updated {applied} notices ===")
    else:
        print("\nNothing to update.")

    # Show first few missing slugs
    if missing_url:
        print(f"\nFirst 20 unmatched slugs (not found on old site):")
        for s in missing_url[:20]:
            print(f"  {s}")


if __name__ == "__main__":
    main()
