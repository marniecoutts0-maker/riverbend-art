#!/usr/bin/env python3
"""
regenerate_paintings_data.py

This script reads paintings.json and regenerates js/paintings-data.js for the gallery.
Run this after any update to paintings.json to keep the gallery in sync.
"""
import json
import os

PAINTINGS_JSON = "paintings.json"
PAINTINGS_DATA_JS = os.path.join("js", "paintings-data.js")

HEADER = "// AUTO-GENERATED from paintings.json\nwindow.PAINTINGS_DATA = "
FOOTER = ";\n"

def main():
    with open(PAINTINGS_JSON, "r", encoding="utf-8") as f:
        paintings = json.load(f)
    with open(PAINTINGS_DATA_JS, "w", encoding="utf-8") as f:
        f.write(HEADER)
        json.dump(paintings, f, indent=4, ensure_ascii=False)
        f.write(FOOTER)
    print(f"Regenerated {PAINTINGS_DATA_JS} from {PAINTINGS_JSON}.")

if __name__ == "__main__":
    main()
