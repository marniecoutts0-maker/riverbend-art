#!/usr/bin/env python3
"""
prepare_web_images.py

Creates web-safe artwork images by resizing and recompressing image files
referenced in paintings.json. This reduces print-quality theft risk and keeps
site performance fast.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Iterable

from PIL import Image


MAX_LONG_EDGE = 1600
JPEG_QUALITY = 82
PAINTINGS_JSON = "paintings.json"
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


@dataclass
class OptimizeResult:
    path: str
    changed: bool
    reason: str


def _iter_image_paths(paintings: Iterable[dict]) -> Iterable[str]:
    seen = set()
    for painting in paintings:
        rel = painting.get("image", "").strip()
        if not rel:
            continue
        normalized = os.path.normpath(rel)
        if normalized in seen:
            continue
        seen.add(normalized)
        yield normalized


def _resize_dimensions(width: int, height: int) -> tuple[int, int]:
    long_edge = max(width, height)
    if long_edge <= MAX_LONG_EDGE:
        return width, height

    ratio = MAX_LONG_EDGE / float(long_edge)
    return int(round(width * ratio)), int(round(height * ratio))


def _optimize_single_image(path: str) -> OptimizeResult:
    ext = os.path.splitext(path)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        return OptimizeResult(path=path, changed=False, reason="skipped (unsupported type)")

    if not os.path.exists(path):
        return OptimizeResult(path=path, changed=False, reason="missing")

    with Image.open(path) as img:
        width, height = img.size
        new_width, new_height = _resize_dimensions(width, height)
        resized = (new_width, new_height) != (width, height)

        if resized:
            working = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        else:
            working = img.copy()

        # Re-save strips EXIF by default unless explicitly passed through.
        save_kwargs = {"optimize": True}

        if ext in {".jpg", ".jpeg"}:
            if working.mode not in ("RGB", "L"):
                working = working.convert("RGB")
            save_kwargs.update({"quality": JPEG_QUALITY, "progressive": True})
            fmt = "JPEG"
        elif ext == ".png":
            if working.mode == "P":
                working = working.convert("RGBA")
            fmt = "PNG"
        else:
            if working.mode not in ("RGB", "RGBA", "L"):
                working = working.convert("RGB")
            save_kwargs.update({"quality": JPEG_QUALITY, "method": 6})
            fmt = "WEBP"

        working.save(path, format=fmt, **save_kwargs)

    if resized:
        return OptimizeResult(path=path, changed=True, reason=f"resized to {new_width}x{new_height}")
    return OptimizeResult(path=path, changed=True, reason="recompressed + metadata stripped")


def optimize_images_for_web(paintings: list[dict]) -> tuple[int, int, int]:
    """Optimize all unique image files referenced in paintings metadata.

    Returns: (total_paths, changed_count, missing_count)
    """
    paths = list(_iter_image_paths(paintings))
    changed = 0
    missing = 0

    print("\n[Step 1.5] Optimizing web images...")
    print(f"  Target long edge: {MAX_LONG_EDGE}px, JPEG quality: {JPEG_QUALITY}")

    for path in paths:
        result = _optimize_single_image(path)
        if result.reason == "missing":
            missing += 1
            print(f"  WARN — Missing: {result.path}")
            continue
        if result.reason.startswith("skipped"):
            print(f"  Skip — {result.path} ({result.reason})")
            continue

        changed += 1
        print(f"  OK — {result.path} ({result.reason})")

    print(
        f"  Done — processed {len(paths)} image path(s), "
        f"updated {changed}, missing {missing}."
    )
    return len(paths), changed, missing


def _load_paintings() -> list[dict]:
    with open(PAINTINGS_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise RuntimeError("paintings.json must be a JSON array")
    return data


if __name__ == "__main__":
    optimize_images_for_web(_load_paintings())
