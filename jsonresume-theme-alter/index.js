/**
 * jsonresume-theme-alter
 *
 * A clean, single-page resume theme with serif fonts and gold accent rules.
 * Compatible with resumed, resume-cli, and the JSON Resume registry.
 *
 * Usage with resumed:
 *   npx resumed render resume.json --theme jsonresume-theme-alter
 *
 * Usage with resume-cli:
 *   resume export resume.html --theme alter
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

function esc(s) {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const CSS = `
@page {
    size: letter;
    margin: 0.35in 0.5in;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 11pt;
    line-height: 1.2;
    color: #000;
    background: #fff;
    max-width: 7.5in;
    margin: 0 auto;
}

.header { text-align: center; margin-bottom: 0; }
.header h1 { font-size: 18pt; font-weight: bold; margin-bottom: 1pt; }
.header-rule {
    border: none; border-top: 1px solid #b8960c;
    margin: 1pt 0 2pt 0;
}
.contact { font-size: 9.5pt; margin-bottom: 2pt; }

a { color: #2a5db0; text-decoration: none; }
a:hover { text-decoration: underline; }

.sec-rule { border: none; border-top: 1px solid #000; margin: 0 0 3pt 0; }
.header-rule { border: none; border-top: 1px solid #000; margin: 3pt 0 3pt 0; }
.sec-hdr {
    font-size: 11pt;
    font-weight: bold;
    text-transform: uppercase;
    margin-top: 5pt;
    margin-bottom: 0;
    letter-spacing: 0.3pt;
}
.sec-rule {
    border: none; border-top: 1px solid #b8960c;
    margin: 1pt 0 3pt 0;
}

.row { display: flex; justify-content: space-between; align-items: baseline; }
.row-right { text-align: right; white-space: nowrap; padding-left: 8pt; flex-shrink: 0; }

.entry { margin-bottom: 2pt; }
.bold { font-weight: bold; }
.italic { font-style: italic; }

ul {
    padding-left: 20px;
    margin: 0 0 1pt 0;
    list-style-type: disc;
}
li {
    font-size: 11pt;
    line-height: 1.2;
    margin-bottom: 0.5pt;
}

.skills-block { margin-bottom: 1pt; }
.skills-block div { margin-bottom: 0.5pt; font-size: 11pt; }

@media print {
    body { margin: 0; max-width: none; }
    a { color: #2a5db0 !important; }
    .header-rule, .sec-rule {
        border-top-color: #b8960c !important;
        -webkit-print-color-adjust: exact;
    }
}
`;

function render(resume) {
  const b = resume.basics || {};
  const loc = b.location || {};
  const parts = [];

  // -- Header --
  parts.push(`<div class="header"><h1>${esc(b.name)}</h1>`);
  parts.push(`<hr class="header-rule">`);

  const contact = [];
  if (loc.city && loc.region) contact.push(`${esc(loc.city)}, ${esc(loc.region)}`);
  if (b.phone) contact.push(esc(b.phone));
  if (b.email) contact.push(`<a href="mailto:${esc(b.email)}">${esc(b.email)}</a>`);
  for (const p of b.profiles || []) {
    contact.push(`<a href="${esc(p.url)}">${esc(p.network)}</a>`);
  }
  parts.push(`<div class="contact">${contact.join(" | ")}</div></div>`);

  // -- Education --
  const education = resume.education || [];
  if (education.length) {
    parts.push(`<h2 class="sec-hdr">EDUCATION</h2><hr class="sec-rule">`);
    for (const ed of education) {
      const inst = esc(ed.institution || "");
      const eloc = esc(ed.location || "");
      const endStr = fmtDate(ed.endDate);

      const desc = [];
      if (ed.studyType && ed.area) desc.push(`${esc(ed.studyType)} in ${esc(ed.area)}`);
      if (ed.minor) desc.push(`Minor in ${esc(ed.minor)}`);
      if (ed.track) desc.push(esc(ed.track));
      if (ed.honors) desc.push(esc(ed.honors));

      const gpa = ed.score ? `GPA: <span class="bold">${esc(ed.score)}</span>` : "";

      parts.push(`<div class="entry">`);
      parts.push(`<div class="row"><div><span class="bold">${inst}</span>${eloc ? " - " + eloc : ""}</div><div class="row-right">${endStr}</div></div>`);
      parts.push(`<div class="row"><div>${desc.join(", ")}</div><div class="row-right">${gpa}</div></div>`);
      parts.push(`</div>`);
    }
  }

  // -- Experience --
  const work = resume.work || [];
  if (work.length) {
    parts.push(`<h2 class="sec-hdr">EXPERIENCE</h2><hr class="sec-rule">`);
    for (const w of work) {
      const dr = dateRange(w.startDate, w.endDate);
      parts.push(`<div class="entry">`);
      parts.push(`<div class="row"><div><span class="bold">${esc(w.name)}</span></div><div class="row-right">${esc(w.location || "")}</div></div>`);
      parts.push(`<div class="row"><div><span class="italic">${esc(w.position)}</span></div><div class="row-right">${dr}</div></div>`);
      const hl = w.highlights || [];
      if (hl.length) {
        parts.push(`<ul>${hl.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>`);
      }
      parts.push(`</div>`);
    }
  }

  // -- Projects --
  const projects = resume.projects || [];
  if (projects.length) {
    parts.push(`<h2 class="sec-hdr">PROJECTS</h2><hr class="sec-rule">`);
    for (const p of projects) {
      let nameHtml = `<span class="bold">${esc(p.name)}</span>`;
      if (p.url) nameHtml += ` | <a href="${esc(p.url)}">GitHub</a>`;
      const dr = dateRange(p.startDate, p.endDate);
      parts.push(`<div class="entry">`);
      parts.push(`<div class="row"><div>${nameHtml}</div><div class="row-right">${dr}</div></div>`);
      const hl = p.highlights || [];
      if (hl.length) {
        parts.push(`<ul>${hl.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>`);
      }
      parts.push(`</div>`);
    }
  }

  // -- Skills + Interests --
  const skills = resume.skills || [];
  const interests = resume.interests || [];
  if (skills.length || interests.length) {
    parts.push(`<h2 class="sec-hdr">SKILLS</h2><hr class="sec-rule">`);
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
    parts.push(`<h2 class="sec-hdr">LEADERSHIP</h2><hr class="sec-rule">`);
    for (const v of vol) {
      const dr = dateRange(v.startDate, v.endDate);
      parts.push(`<div class="entry">`);
      parts.push(`<div class="row"><div><span class="bold">${esc(v.organization)}</span></div><div class="row-right">${dr}</div></div>`);
      const hl = v.highlights || [];
      if (hl.length) {
        parts.push(`<ul>${hl.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>`);
      }
      parts.push(`</div>`);
    }
  }

  return parts.join("\n");
}

/**
 * The render export expected by resumed / resume-cli.
 * @param {Object} resume - The parsed resume.json object
 * @returns {string} Full HTML document
 */
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
