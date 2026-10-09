"""Generate a current-inventory value report, split by Montana Fur Traders (gallery-owned,
bought wholesale) vs. artist-held stock.

Reads paintings.json directly so the report always reflects current prices/statuses.
Only unsold, priced originals are counted — sold pieces and in-progress commissions are excluded.
"""
import json
from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parent
PAINTINGS_JSON = ROOT / "paintings.json"
OUTPUT = ROOT / "INVENTORY_VALUE_REPORT.pdf"

INK = colors.HexColor("#2c2a26")
MUTED = colors.HexColor("#8c857b")
ACCENT = colors.HexColor("#7a6e5a")
BORDER = colors.HexColor("#d4cdc3")
WARM_BG = colors.HexColor("#e8e1d8")


def money(value: float) -> str:
    return f"${value:,.2f}"


def load_inventory():
    paintings = json.loads(PAINTINGS_JSON.read_text(encoding="utf-8"))
    fur_traders = []
    owned = []
    for p in paintings:
        if p.get("sold") or not p.get("price"):
            continue
        if p["status"] == "available-at-montana-fur-traders":
            fur_traders.append(p)
        elif p["status"] == "available":
            owned.append(p)
    return fur_traders, owned


def build_table(paintings, styles):
    header = ["Title", "Medium", "Size", "Framed", "Price"]
    rows = [header]
    total = 0.0
    for p in paintings:
        display_title = p["title"]
        if p.get("altTitle"):
            display_title += f'\n(shown as "{p["altTitle"]}")'
        rows.append([
            Paragraph(display_title.replace("\n", "<br/>"), styles["cell"]),
            Paragraph(p["medium"], styles["cell"]),
            Paragraph(p["size"], styles["cell"]),
            "Yes" if p.get("framed") else "No",
            money(p["price"]),
        ])
        total += p["price"]

    table = Table(rows, colWidths=[1.9 * inch, 1.5 * inch, 0.95 * inch, 0.6 * inch, 0.85 * inch], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), ACCENT),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("TEXTCOLOR", (0, 1), (-1, -1), INK),
        ("ALIGN", (3, 0), (4, -1), "CENTER"),
        ("ALIGN", (4, 0), (4, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, WARM_BG]),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return table, total


def build_pdf():
    fur_traders, owned = load_inventory()

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "Title", parent=styles["Normal"], fontName="Helvetica-Bold",
        fontSize=19, leading=23, textColor=INK, spaceAfter=2,
    )
    subtitle_style = ParagraphStyle(
        "Subtitle", parent=styles["Normal"], fontName="Helvetica",
        fontSize=10, leading=13, textColor=MUTED, spaceAfter=18,
    )
    section_style = ParagraphStyle(
        "Section", parent=styles["Normal"], fontName="Helvetica-Bold",
        fontSize=13, leading=16, textColor=INK, spaceBefore=18, spaceAfter=4,
    )
    section_sub_style = ParagraphStyle(
        "SectionSub", parent=styles["Normal"], fontName="Helvetica",
        fontSize=9, leading=12, textColor=MUTED, spaceAfter=8,
    )
    cell_style = ParagraphStyle(
        "Cell", parent=styles["Normal"], fontName="Helvetica",
        fontSize=8.8, leading=11.5, textColor=INK,
    )
    subtotal_style = ParagraphStyle(
        "Subtotal", parent=styles["Normal"], fontName="Helvetica-Bold",
        fontSize=10.5, leading=14, textColor=INK, spaceBefore=6, alignment=2,
    )
    grand_total_label = ParagraphStyle(
        "GrandTotalLabel", parent=styles["Normal"], fontName="Helvetica-Bold",
        fontSize=14, leading=18, textColor=colors.white,
    )
    grand_total_value = ParagraphStyle(
        "GrandTotalValue", parent=styles["Normal"], fontName="Helvetica-Bold",
        fontSize=14, leading=18, textColor=colors.white, alignment=2,
    )
    footnote_style = ParagraphStyle(
        "Footnote", parent=styles["Normal"], fontName="Helvetica-Oblique",
        fontSize=8.3, leading=11.5, textColor=MUTED, spaceBefore=16,
    )
    styles.add(cell_style, "cell")

    doc = SimpleDocTemplate(
        str(OUTPUT), pagesize=LETTER,
        leftMargin=0.75 * inch, rightMargin=0.75 * inch,
        topMargin=0.75 * inch, bottomMargin=0.75 * inch,
        title="Current Inventory Value Report", author="Marnie Henry",
    )

    today = date.today().strftime("%B %d, %Y")
    story = [
        Paragraph("Riverbend Art &mdash; Current Inventory Value Report", title_style),
        Paragraph(f"Prepared {today} &middot; Unsold, priced originals only (sold pieces and in-progress commissions excluded)", subtitle_style),
    ]

    # --- Montana Fur Traders section ---
    story.append(Paragraph("Montana Fur Traders Gallery &mdash; Gallery-Owned Inventory (Sold Wholesale)", section_style))
    story.append(Paragraph("On exhibit at Martin City, MT &middot; " + str(len(fur_traders)) + " pieces", section_sub_style))
    ft_table, ft_total = build_table(fur_traders, {"cell": cell_style})
    story.append(ft_table)
    story.append(Paragraph(f"Subtotal: {money(ft_total)}", subtotal_style))

    story.append(Spacer(1, 0.1 * inch))

    # --- Artist-held section ---
    story.append(Paragraph("Artist-Held Inventory", section_style))
    story.append(Paragraph("Available directly from Marnie &middot; " + str(len(owned)) + " pieces", section_sub_style))
    owned_table, owned_total = build_table(owned, {"cell": cell_style})
    story.append(owned_table)
    story.append(Paragraph(f"Subtotal: {money(owned_total)}", subtotal_style))

    # --- Grand total band ---
    story.append(Spacer(1, 0.2 * inch))
    grand_total = ft_total + owned_total
    gt_table = Table(
        [[Paragraph("Total Current Inventory Value", grand_total_label), Paragraph(money(grand_total), grand_total_value)]],
        colWidths=[4.9 * inch, 0.9 * inch],
    )
    gt_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), INK),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(gt_table)

    story.append(Paragraph(
        "Note: Figures reflect retail asking price, not guaranteed sale value. Fur Traders pieces were sold "
        "wholesale to the gallery, which now owns them and resells at retail (customer pays shipping); "
        "artist-held pieces sell directly. Sold works and open commissions are not counted toward current "
        "inventory value.",
        footnote_style,
    ))

    doc.build(story)
    print(f"Wrote {OUTPUT}")
    print(f"Fur Traders subtotal: {money(ft_total)} ({len(fur_traders)} pieces)")
    print(f"Artist-held subtotal: {money(owned_total)} ({len(owned)} pieces)")
    print(f"Grand total: {money(grand_total)}")


if __name__ == "__main__":
    build_pdf()
