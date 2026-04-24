#!/usr/bin/env python3
"""Seek-and-capture key frames of the 30s animation for visual QA."""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

HTML = Path(__file__).parent / "index.html"
OUT = Path(__file__).parent / "screenshots"
OUT.mkdir(exist_ok=True)

DURATION = 36.5
# key frames: signature moments of each scene (post-fade-in)
FRAMES = [
    (2.5,  "s1-hook"),
    (4.2,  "s1-blockers"),
    (5.5,  "t1-2-crossfade"),      # S1→S2 mid cross-fade
    (8.5,  "s2-break"),
    (10.5, "t2-3-crossfade"),      # S2→S3 mid cross-fade
    (13.0, "s3-dml"),
    (15.5, "t3-4-crossfade"),      # S3→S4 mid cross-fade
    (18.5, "s4-dv-files"),
    (19.5, "s4-dv-tickers"),
    (21.5, "t4-5-crossfade"),      # S4→S5 mid cross-fade
    (24.0, "s5-lineage"),
    (26.5, "t5-6-crossfade"),      # S5→S6 mid cross-fade
    (28.5, "s6-boom"),
    (31.5, "t6-7-crossfade"),      # S6→S7 mid cross-fade
    (34.0, "s7-landing"),
]

def main():
    page_errors, console_errors = [], []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 1920x1136 → stageHolder height = 1080 → scale = 1.0 for perfect 1080p canvas
        ctx = browser.new_context(viewport={"width": 1920, "height": 1136}, device_scale_factor=1)
        page = ctx.new_page()
        page.on("pageerror", lambda e: page_errors.append(str(e)))
        page.on("console", lambda m: console_errors.append(f"[{m.type}] {m.text}")
                if m.type in ("error", "warning") else None)

        print(f"→ Open {HTML.name}")
        page.goto(HTML.resolve().as_uri(), wait_until="networkidle")
        page.wait_for_timeout(2500)  # fonts + initial render

        for t, tag in FRAMES:
            page.evaluate(f"window.__seek({t})")
            page.wait_for_timeout(400)

            # Hide controls for a clean canvas screenshot
            page.evaluate("document.querySelector('.no-record').style.visibility='hidden'")
            out_path = OUT / f"frame-t{t:04.1f}s-{tag}.png"
            page.screenshot(path=str(out_path), clip={"x": 0, "y": 0, "width": 1920, "height": 1080})
            page.evaluate("document.querySelector('.no-record').style.visibility=''")
            print(f"  ✓ t={t:>4.1f}s ({tag}) → {out_path.name}")

        browser.close()

    print("\n" + "=" * 50)
    if page_errors:
        print(f"PAGE ERRORS ({len(page_errors)}):")
        for e in page_errors:
            print(f"  - {e}")
    else:
        print("✅ no page errors")
    if console_errors:
        print(f"\nCONSOLE ({len(console_errors)}):")
        for e in console_errors[:10]:
            print(f"  - {e}")
    else:
        print("✅ console clean")
    return 1 if page_errors else 0

if __name__ == "__main__":
    sys.exit(main())
