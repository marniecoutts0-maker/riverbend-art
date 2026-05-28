# Regenerate Gallery Data Automatically

Whenever you update paintings.json, run this script to keep js/paintings-data.js in sync:

```
python regenerate_paintings_data.py
```

This now also performs web-safe image processing on every image referenced in paintings.json:
- Resizes to max 1600px on the long edge
- Recompresses JPEG/WebP at quality 82
- Strips metadata (EXIF) by re-saving

Tip: keep full-resolution master files in a separate private folder outside this repo.

## Automation Options
- **Manual:** Run the script after each paintings.json edit.
- **Pre-commit Hook:** Add a git pre-commit hook to auto-run the script before every commit.
- **Render Worker:** Add this script to your Render background worker after syncing images/artwork data.

## Why Not Sub-Agents?
- For this workflow, a single master agent (this script) is sufficient: it reads the source of truth and generates the gallery data.
- Sub-agents are useful for more complex, multi-step, or distributed workflows (e.g., image optimization, metadata review, publishing approval).
- If you want to add more automation (e.g., image optimization, notifications, or review steps), sub-agents can be introduced later.

## Next Steps
- To fully automate, add this script to your Render worker or a git hook.
- Let me know if you want help with either option or want to expand the workflow with sub-agents.

## Instagram Guidance
- DPI is not the control that matters; exported pixel dimensions are what matter.
- For feed posts, export around 1080px wide (or 1350px tall for portrait feed format).
- Keep a separate social export folder and never upload original high-res masters.
