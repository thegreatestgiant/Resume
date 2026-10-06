/**
 * jsonresume-theme-alter
 *
 * Single-page resume theme: Calibri/Carlito, navy section headings,
 * gray rules, bold "Company - Role" lines with dates on the right.
 *
 * Usage with resumed:
 *   npx resumed render resume.json --theme jsonresume-theme-alter
 */

const MONTHS = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function fmtDate(d) {
  if (!d) return "Present";
  const parts = d.split("-");
  if (parts.length >= 2) {
    const m = parseInt(parts[1], 10);
    return `${MONTHS[m] || parts[1]} ${parts[0]}`;
  }
  return parts[0];
}

function dateRange(start, end) {
  return `${fmtDate(start)} - ${fmtDate(end)}`;
}

// Future end dates print as "Expected Graduation: May 2027"
function eduDate(d) {
  if (!d) return "";
  const parts = d.split("-").map((x) => parseInt(x, 10));
  const end = new Date(parts[0], (parts[1] || 1) - 1, 1);
  const label = fmtDate(d);
  return end > new Date() ? `Expected Graduation: ${label}` : label;
}

function esc(s) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const CSS = `
@page {
    size: letter;
    margin: 0.4in 0.5in;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

body {
    font-family: Calibri, Carlito, 'Segoe UI', Arial, sans-serif;
    font-size: 10pt;
    line-height: 1.15;
    color: #000;
    background: #fff;
    max-width: 7.5in;
    margin: 0 auto;
}

a { color: #0462c1; text-decoration: underline; }

.header { text-align: center; }
.header h1 { font-size: 16pt; font-weight: bold; margin-bottom: 2pt; }
.contact { font-size: 10pt; color: #333; padding-bottom: 4pt; }
.header-rule { border: none; border-top: 1px solid #999; margin: 0 0 4pt 0; }

.sec-hdr {
    font-size: 11.5pt;
    font-weight: bold;
    color: #1f3863;
    text-transform: uppercase;
    margin-top: 6pt;
}
.sec-rule { border: none; border-top: 1px solid #999; margin: 1pt 0 3pt 0; }

.row { display: flex; justify-content: space-between; align-items: baseline; }
.row-right { text-align: right; white-space: nowrap; padding-left: 8pt; flex-shrink: 0; }

.entry { margin-bottom: 3pt; }
.title { font-size: 10.5pt; font-weight: bold; }
.date { font-size: 10pt; font-weight: bold; font-style: italic; }
.sub { font-style: italic; color: #333; }
.bold { font-weight: bold; }

ul {
    padding-left: 0;
    margin: 1pt 0 0 0;
    list-style: none;
}
li {
    position: relative;
    padding-left: 0.5in;
    font-size: 10pt;
    line-height: 1.15;
    margin-bottom: 2.5pt;
}
li::before {
    content: "\\25CF";
    position: absolute;
    left: 0.27in;
    top: 0.05em;
    font-family: Arial, 'Liberation Sans', 'DejaVu Sans', sans-serif;
    font-size: 8pt;
}

.skills-block div { margin-bottom: 1pt; }
`;

function bullets(hl) {
  if (!hl || !hl.length) return "";
  return `<ul>${hl.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>`;
}

function render(resume) {
  const b = resume.basics || {};
  const loc = b.location || {};
  const parts = [];

  // -- Header --
  parts.push(`<div class="header"><h1>${esc(b.name)}</h1>`);
  const contact = [];
  if (loc.city && loc.region) contact.push(`${esc(loc.city)}, ${esc(loc.region)}`);
  if (b.phone) contact.push(esc(b.phone));
  if (b.email) contact.push(`<a href="mailto:${esc(b.email)}">${esc(b.email)}</a>`);
  for (const p of b.profiles || []) {
    contact.push(`<a href="${esc(p.url)}">${esc(p.network)}</a>`);
  }
  parts.push(`<div class="contact">${contact.join(" | ")}</div>`);
  parts.push(`<hr class="header-rule"></div>`);

  // -- Education --
  const education = resume.education || [];
  if (education.length) {
    parts.push(`<h2 class="sec-hdr">Education</h2><hr class="sec-rule">`);
    for (const ed of education) {
      const inst = esc(ed.institution || "");
      const eloc = esc(ed.location || "");

      const desc = [];
      if (ed.studyType && ed.area) desc.push(`${esc(ed.studyType)} in ${esc(ed.area)}`);
      if (ed.minor) desc.push(`Minor in ${esc(ed.minor)}`);
      if (ed.track) desc.push(esc(ed.track));
      if (ed.honors) desc.push(esc(ed.honors));

      const gpa = ed.score ? `GPA: <span class="bold">${esc(ed.score)}</span>` : "";

      parts.push(`<div class="entry">`);
      parts.push(`<div class="row"><div class="title">${inst}${eloc ? ", " + eloc : ""}</div><div class="row-right date">${esc(eduDate(ed.endDate))}</div></div>`);
      parts.push(`<div class="row"><div class="sub">${desc.join(", ")}</div><div class="row-right">${gpa}</div></div>`);
      parts.push(`</div>`);
    }
  }

  // -- Work Experience --
  const work = resume.work || [];
  if (work.length) {
    parts.push(`<h2 class="sec-hdr">Work Experience</h2><hr class="sec-rule">`);
    for (const w of work) {
      const heading = w.position
        ? `${esc(w.name)} &mdash; ${esc(w.position)}`
        : esc(w.name);
      parts.push(`<div class="entry">`);
      parts.push(`<div class="row"><div class="title">${heading}</div><div class="row-right date">${dateRange(w.startDate, w.endDate)}</div></div>`);
      parts.push(bullets(w.highlights));
      parts.push(`</div>`);
    }
  }

  // -- Projects --
  const projects = resume.projects || [];
  if (projects.length) {
    parts.push(`<h2 class="sec-hdr">Projects</h2><hr class="sec-rule">`);
    for (const p of projects) {
      const nameHtml = p.url
        ? `<a href="${esc(p.url)}">${esc(p.name)}</a>`
        : esc(p.name);
      parts.push(`<div class="entry">`);
      parts.push(`<div class="row"><div class="title">${nameHtml}</div><div class="row-right date">${dateRange(p.startDate, p.endDate)}</div></div>`);
      parts.push(bullets(p.highlights));
      parts.push(`</div>`);
    }
  }

  // -- Skills + Interests --
  const skills = resume.skills || [];
  const interests = resume.interests || [];
  if (skills.length || interests.length) {
    parts.push(`<h2 class="sec-hdr">Skills</h2><hr class="sec-rule">`);
    parts.push(`<div class="skills-block">`);
    for (const s of skills) {
      const kws = (s.keywords || []).map(esc).join(", ");
      parts.push(`<div><span class="bold">${esc(s.name)}:</span> ${kws}</div>`);
    }
    for (const i of interests) {
      const kws = (i.keywords || []).map(esc).join(", ");
      parts.push(`<div><span class="bold">Interests:</span> ${kws}</div>`);
    }
    parts.push(`</div>`);
  }

  // -- Leadership (volunteer) --
  const vol = resume.volunteer || [];
  if (vol.length) {
    parts.push(`<h2 class="sec-hdr">Leadership</h2><hr class="sec-rule">`);
    for (const v of vol) {
      parts.push(`<div class="entry">`);
      parts.push(`<div class="row"><div class="title">${esc(v.organization)}</div><div class="row-right date">${dateRange(v.startDate, v.endDate)}</div></div>`);
      parts.push(bullets(v.highlights));
      parts.push(`</div>`);
    }
  }

  return parts.join("\n");
}

exports.render = function (resume) {
  const name = (resume.basics && resume.basics.name) || "Resume";
  const body = render(resume);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(name)} — Resume</title>
<style>${CSS}</style>
</head>
<body>
${body}
</body>
</html>`;
};
