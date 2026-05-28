#!/usr/bin/env python3
"""
regenerate_paintings_data.py

Master automation script for the Riverbend Art gallery.
Steps:
  1. Validate paintings.json is a clean JSON array
  2. Regenerate js/paintings-data.js from paintings.json
  3. Validate paintings-data.js starts with valid JavaScript
  4. Git add, commit, and push all changes to trigger Render deployment

Run this script after updating paintings.json with new artwork.
"""
import json
import os
import subprocess
import sys

from googleapiclient.discovery import build

import drive_sync
from prepare_web_images import optimize_images_for_web

PAINTINGS_JSON = "paintings.json"
PAINTINGS_DATA_JS = os.path.join("js", "paintings-data.js")
HEADER = "// AUTO-GENERATED from paintings.json\nwindow.PAINTINGS_DATA = "
FOOTER = ";\n"


def step1_validate_json():
    """Validate paintings.json is a valid, clean JSON array."""
    print("\n[Step 1] Validating paintings.json...")
    with open(PAINTINGS_JSON, "r", encoding="utf-8") as f:
        raw = f.read()

    # Check for duplicate opening bracket (common corruption)
    stripped = raw.lstrip()
    if stripped[:2] == "[[":
        raise RuntimeError(
            "paintings.json starts with '[[' — duplicate bracket detected. Fix the file first."
        )

    paintings = json.loads(raw)

    if not isinstance(paintings, list):
        raise RuntimeError("paintings.json must be a JSON array at the top level.")
    if len(paintings) == 0:
        raise RuntimeError("paintings.json is empty — no artworks found.")

    required_keys = {"id", "title", "image", "medium", "size", "category", "status", "featured", "orientation"}
    for i, p in enumerate(paintings):
        missing = required_keys - set(p.keys())
        if missing:
            raise RuntimeError(f"Entry #{i} '{p.get('title', '?')}' is missing keys: {missing}")

    print(f"  OK — {len(paintings)} artworks found: {[p['title'] for p in paintings]}")
    return paintings


def step0_sync_drive_once():
    """Sync Google Drive folder into local images/ before processing gallery data."""
    print("\n[Step 0] Syncing images from Google Drive into local images/...")

    creds = drive_sync.authenticate()
    service = build('drive', 'v3', credentials=creds)
    total_items, downloaded, updated = drive_sync.download_new_images(service)

    print(
        f"  OK — Drive sync complete: {total_items} image(s) in folder, "
        f"{downloaded} downloaded, {updated} updated."
    )


def step2_regenerate_js(paintings):
    """Write a clean paintings-data.js from the validated paintings list."""
    print("\n[Step 2] Regenerating js/paintings-data.js...")
    with open(PAINTINGS_DATA_JS, "w", encoding="utf-8") as f:
        f.write(HEADER)
        json.dump(paintings, f, indent=4, ensure_ascii=False)
        f.write(FOOTER)
    print(f"  OK — {PAINTINGS_DATA_JS} written.")


def step1_5_optimize_images(paintings):
    """Resize/compress images for web-safe display and strip metadata."""
    optimize_images_for_web(paintings)


def step3_validate_js():
    """Validate that paintings-data.js starts with valid JavaScript."""
    print("\n[Step 3] Validating paintings-data.js...")
    with open(PAINTINGS_DATA_JS, "r", encoding="utf-8") as f:
        first_line = f.readline()
        second_line = f.readline()

    if not first_line.startswith("// AUTO-GENERATED"):
        raise RuntimeError(f"paintings-data.js first line invalid: '{first_line.strip()}'")
    if not second_line.startswith("window.PAINTINGS_DATA"):
        raise RuntimeError(f"paintings-data.js second line invalid: '{second_line.strip()}'")

    print("  OK — paintings-data.js starts with valid JavaScript.")


def step4_git_push():
    """Stage all changes, commit, and push to trigger Render deployment."""
    print("\n[Step 4] Committing and pushing to git...")

    # Stage the key files (new images are staged via 'git add images/')
    subprocess.run(
        ["git", "add", PAINTINGS_JSON, PAINTINGS_DATA_JS, "images/"],
        check=True
    )

    # Check if there's actually anything to commit
    result = subprocess.run(
        ["git", "diff", "--cached", "--quiet"],
        capture_output=True
    )
    if result.returncode == 0:
        print("  Nothing new to commit — gallery is already up to date.")
        return

    # Commit
    subprocess.run(
        ["git", "commit", "-m", "Master Agent: update gallery with new artwork"],
        check=True
    )

    # Push
    subprocess.run(["git", "push"], check=True)
    print("  OK — pushed to git. Render will deploy automatically.")


def main():
    print("=" * 55)
    print("  Riverbend Art — Master Gallery Automation Script")
    print("=" * 55)

    try:
        step0_sync_drive_once()
        paintings = step1_validate_json()
        step1_5_optimize_images(paintings)
        step2_regenerate_js(paintings)
        step3_validate_js()
        step4_git_push()
        print("\n[Done] Gallery updated successfully. Check Render for deployment status.")
    except Exception as e:
        print(f"\n[ERROR] {e}")
        print("Fix the issue above and run this script again.")
        sys.exit(1)


if __name__ == "__main__":
    main()
