#!/usr/bin/env python3
"""
Custom JSON Resume Theme — Sean Alter Style
Generates an HTML resume from a resume.json file.
Modeled after the original Sean Alter resume formatting.

Usage:
  python3 generate.py [resume.json] [output.html]
"""
import json
import sys
import datetime

MONTH_NAMES = {
    1: "January", 2: "February", 3: "March", 4: "April",
    5: "May", 6: "June", 7: "July", 8: "August",
    9: "September", 10: "October", 11: "November", 12: "December"
}

def fmt_date(d):
    """Format '2025-12' -> 'December 2025', handle 'Present' and missing."""
    if not d:
        return "Present"
    try:
        parts = d.split("-")
        if len(parts) >= 2:
            return f"{MONTH_NAMES[int(parts[1])]} {parts[0]}"
        return parts[0]
    except (ValueError, KeyError):
        return d

def date_range(start, end=None):
    s = fmt_date(start)
    e = fmt_date(end)
    return f"{s} - {e}"

CSS = r"""
@page {
    size: letter;
    margin: 0.6in 0.5in 0.4in 0.5in;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: 'Carlito', Calibri, sans-serif;
    font-size: 11.5pt;
    line-height: 1.05;
    color: #000;
    background: #fff;
    max-width: 7.5in;
    margin: 0 auto;
}

/* ---- HEADER ---- */
.header { text-align: center; margin-bottom: 2pt; }
.header h1 { font-size: 18pt; font-weight: bold; margin-bottom: 2pt; }
.contact {
    font-size: 11.5pt;
    margin-bottom: 3pt;
}

/* ---- LINKS ---- */
a { color: #0462c1; text-decoration: none; }
a:hover { text-decoration: underline; }

/* ---- SECTION HEADERS ---- */
.sec-hdr {
    font-size: 12pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #1f3863;
    margin-top: 4pt;
    margin-bottom: 2pt;
    letter-spacing: 0.5pt;
}
.sec-rule {
    border: none; border-top: 1px solid #1f3863;
    margin: 0 0 4pt 0;
}
.header-rule {
    border: none; border-top: 1px solid #1f3863;
    margin: 2pt 0 2pt 0;
}

/* ---- FLEX ROW (company/dates etc) ---- */
.row { display: flex; justify-content: space-between; align-items: baseline; }
.row-right { text-align: right; white-space: nowrap; padding-left: 8pt; flex-shrink: 0; }

/* ---- ENTRY BLOCK ---- */
.entry { margin-bottom: 4pt; }
.bold { font-weight: bold; }
.italic { font-style: italic; }

/* ---- BULLET LISTS ---- */
ul {
    list-style-type: none;
    padding-left: 20pt;
    margin: 1pt 0 1pt 0;
}
li {
    font-family: 'Times New Roman', Times, serif;
    font-size: 11.5pt;
    line-height: 1.05;
    margin-bottom: 1pt;
    position: relative;
    padding-left: 12pt;
}
li::before {
    content: "●";
    position: absolute;
    left: 0;
    top: 0;
    font-size: 10pt;
    color: #000;
}

/* ---- SKILLS BLOCK ---- */
.skills-block { margin-bottom: 2pt; }
.skills-block div { margin-bottom: 1pt; font-size: 11.5pt; }

/* ---- PRINT ---- */
@media print {
    body { margin: 0; max-width: none; }
    .sec-hdr { color: #1f3863 !important; }
    .sec-rule, .header-rule { border-top-color: #1f3863 !important; }
    a { color: #0462c1 !important; }
}
"""





def render(data):
    b = data.get("basics", {})
    loc = b.get("location", {})
    parts = []

    # -- HEADER --
    parts.append(f"<div class='header'><h1>{b.get('name','')}</h1>")

    contact = []
    if loc.get("city") and loc.get("region"):
        contact.append(f"{loc['city']}, {loc['region']}")
    if b.get("phone"):
        contact.append(b["phone"])
    if b.get("email"):
        contact.append(f"<a href='mailto:{b['email']}'>{b['email']}</a>")
    for p in b.get("profiles", []):
        contact.append(f"<a href='{p.get('url','#')}'>{p['network']}</a>")

    parts.append(f"<div class='contact'>{' | '.join(contact)}</div></div>")

    # -- EDUCATION --
    for ed in data.get("education", []):
        parts.append("<h2 class='sec-hdr'>EDUCATION</h2><hr class='sec-rule'>")
        inst = ed.get("institution", "")
        loc_e = ed.get("location", "")
        end = ed.get("endDate", "")
        end_str = fmt_date(end) if end else ""

        desc = []
        if ed.get("studyType") and ed.get("area"):
            desc.append(f"{ed['studyType']} in {ed['area']}")
        if ed.get("minor"):
            desc.append(f"Minor in {ed['minor']}")
        if ed.get("track"):
            desc.append(ed["track"])
        if ed.get("honors"):
            desc.append(ed["honors"])

        gpa = ed.get("score", "")
        parts.append("<div class='entry'>")
        inst_loc = f"{inst}, {loc_e}" if loc_e else inst
        parts.append(f"<div class='row'><div><span class='bold'>{inst_loc}</span></div>"
                     f"<div class='row-right'><i><b>{end_str}</b></i></div></div>")
        parts.append(f"<div class='row'><div><i>{', '.join(desc)}</i></div>"
                     f"<div class='row-right'>GPA: <span class='bold'>{gpa}</span></div></div>")
        parts.append("</div>")

    # -- EXPERIENCE --
    work = data.get("work", [])
    if work:
        parts.append("<h2 class='sec-hdr'>EXPERIENCE</h2><hr class='sec-rule'>")
        for w in work:
            parts.append("<div class='entry'>")
            comp = w.get('name','')
            pos = w.get('position','')
            title = f"{comp} — {pos}" if pos else comp
            
            dr = date_range(w.get("startDate"), w.get("endDate"))
            parts.append(
                f"<div class='row'><div><span class='bold'>{title}</span></div>"
                f"<div class='row-right'><i><b>{dr}</b></i></div></div>")
            hl = w.get("highlights", [])
            if hl:
                parts.append("<ul>" + "".join(f"<li>{h}</li>" for h in hl) + "</ul>")
            parts.append("</div>")

    # -- PROJECTS --
    projects = data.get("projects", [])
    if projects:
        parts.append("<h2 class='sec-hdr'>PROJECTS</h2><hr class='sec-rule'>")
        for p in projects:
            name_html = f"<span class='bold'>{p.get('name','')}</span>"
            if p.get("url"):
                name_html += f" | <a href='{p['url']}'>GitHub</a>"
            if p.get("demoUrl"):
                name_html += f" | <a href='{p['demoUrl']}'>Demo</a>"
            dr = date_range(p.get("startDate"), p.get("endDate"))

            parts.append("<div class='entry'>")
            parts.append(f"<div class='row'><div>{name_html}</div>"
                         f"<div class='row-right'><i><b>{dr}</b></i></div></div>")
            hl = p.get("highlights", [])
            if hl:
                parts.append("<ul>" + "".join(f"<li>{h}</li>" for h in hl) + "</ul>")
            parts.append("</div>")

    # -- SKILLS (includes interests) --
    skills = data.get("skills", [])
    interests = data.get("interests", [])
    if skills or interests:
        parts.append("<h2 class='sec-hdr'>SKILLS</h2><hr class='sec-rule'>")
        parts.append("<div class='skills-block'>")
        for s in skills:
            kws = ", ".join(s.get("keywords", []))
            parts.append(f"<div><span class='bold'>{s['name']}:</span> {kws}</div>")
        for i in interests:
            kws = ", ".join(i.get("keywords", []))
            parts.append(f"<div><span class='bold'>Interests:</span> {kws}</div>")
        parts.append("</div>")

    # -- LEADERSHIP (volunteer) --
    vol = data.get("volunteer", [])
    if vol:
        parts.append("<h2 class='sec-hdr'>LEADERSHIP</h2><hr class='sec-rule'>")
        for v in vol:
            dr = date_range(v.get("startDate"), v.get("endDate"))
            parts.append("<div class='entry'>")
            comp = v.get('organization','')
            parts.append(
                f"<div class='row'><div><span class='bold'>{comp}</span></div>"
                f"<div class='row-right'><i><b>{dr}</b></i></div></div>")
            hl = v.get("highlights", [])
            if hl:
                parts.append("<ul>" + "".join(f"<li>{h}</li>" for h in hl) + "</ul>")
            parts.append("</div>")

    return parts


def build_html(data):
    name = data.get("basics", {}).get("name", "Resume")
    body = "\n".join(render(data))
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{name} — Resume</title>
<style>{CSS}</style>
</head>
<body>
{body}
</body>
</html>"""


def main():
    json_path = sys.argv[1] if len(sys.argv) > 1 else "resume.json"
    out_path  = sys.argv[2] if len(sys.argv) > 2 else "resume.html"

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    html = build_html(data)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✓ Generated {out_path}")


if __name__ == "__main__":
    main()
