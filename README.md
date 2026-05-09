# Riverbend Art Website

## How to Add or Update Gallery Images

1. **Add your new image** to the `images/` folder. Make sure the filename matches exactly (case-sensitive).
2. **Update `paintings.json`** with a new entry for your artwork. Use the correct image path (e.g., `images/YourImage.jpg`).
3. **Regenerate `js/paintings-data.js`** by copying the full array from `paintings.json` into `window.PAINTINGS_DATA` in `js/paintings-data.js`.
4. **Check your site locally** (open `gallery.html` in your browser or use Live Server) to confirm the new image appears.
5. **Stage, commit, and push** all changes (including the new image file) to GitHub.

### Troubleshooting
- If images do not load, check that the image path in `paintings.json` matches the file in `images/`.
- The `.gitignore` is set to allow images in the `images/` folder, but not elsewhere.
- If `js/paintings-data.js` is empty or missing data, regenerate it from `paintings.json`.

---

**Tip:** Always verify your changes locally before pushing to GitHub to avoid missing images on your live site.
