# Art Site Master Agent Checklist

1. Add your new image file to the images/ folder.
2. Tell me: “Master Agent, I want to add a new painting.”
3. I’ll ask you for:
	• The image filename (e.g., images/newart.jpg)
	• The painting’s title
	• The dimensions (e.g., 12" x 24")
	• The medium (e.g., Oil on canvas)
	• The category (landscape, wildlife, etc.)
	• The status (available, private-collection, etc.)
	• Orientation (portrait or landscape)
4. I’ll handle:
	• Optimizing the image (if needed)
	• Updating paintings.json and paintings-data.js
	• Preparing a local preview for you
5. You review the update in your browser.
6. If you approve, just say: “Master Agent, publish the update.”
7. I’ll push the changes to GitHub and Render will update your site.

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

---

## Pricing Strategy

### Formula
Use the **linear inch method** as your baseline:
- **(length + width) × rate per linear inch**
- Current rate: **~$6.40 per linear inch** (derived from 11×14 studies at $160)

| Size | Linear inches | Base price |
|------|--------------|------------|
| 5×7  | 12 in.       | ~$75       |
| 9×12 | 21 in.       | ~$135      |
| 11×14 | 25 in.      | $160       |
| 12×24 | 36 in.      | ~$230      |
| 16×20 | 36 in.      | ~$230      |
| 18×24 | 42 in.      | ~$270      |

Adjust upward for: framing, exceptional finish/detail, iconic subject matter, or pieces you're particularly attached to.

### Studies vs. Finished Works
- **Small studies** (quick, exploratory): price at formula rate
- **Featured/finished works**: can step up 20–30% above formula — buyers respond to your confidence in the work
- A painting tagged `featured` should usually be priced above its formula floor

### Prints vs. Originals Rule
- **Do not offer prints on available originals** — it undercuts urgency on the original sale
- Enable `printAvailable: true` only after the original has sold (status: `private-collection`)
- **Exception: May Flowers (the daisy)** — prints stay available regardless, as it's a proven seller and the original is priced low enough that they don't compete

### Framing
- Add **$40–$80** to account for framing cost when listing a framed piece
- Always note framed/unframed clearly in the listing so buyers aren't surprised

### Market Observations (track these over time)
- **May Flowers (daisy)** — first print sold same day posted; two of three daughters chose it as a canvas/paper print; strong impulse-buy energy in the $40–$75 range
- **Coastal Reckoning** — popular with women 30s–40s as a large canvas print; emotional, dramatic seascape resonates
- Small affordable originals ($75–$160) move faster than expected — keep a few in that range
- Prints at ~$45 are impulse territory; originals under $200 are considered-purchase territory

### When in doubt, ask Copilot
Share the painting details (size, medium, subject, finish level, how long it took) and current sold comps from this list, and ask for a pricing recommendation. The more context you give, the better the suggestion.
