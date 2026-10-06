# Resume

Generates a one-page PDF resume from `resume.json` (JSON Resume format) using a custom theme, then prints it with WeasyPrint.

## Files

- `resume.json` - resume content in JSON Resume format. This is the only file you edit to change content.
- `index.js` - the theme (HTML and CSS). Edit this to change the look.
- `package.json` - installs `resumed`, the JSON Resume renderer.
- `patch_bullets.py` - one-off script that rewrote the bullet CSS in `index.js`. It is not needed to build the resume.
- `generate.py` - the old generator. It is no longer part of the build.
- `jsonresume-theme-alter/` - the old theme (serif font, gold rules). It is not used by the build.
- `resume.html` and `Sean_Alter_Resume.pdf` - generated output.

## Requirements

- Node.js and npm
- WeasyPrint
- Carlito font (a metric-compatible Calibri substitute). Check with:

```
fc-list | grep -i -E "calibri|carlito"
```

Install on Arch or CachyOS with `sudo pacman -S ttf-carlito`. If real Calibri is installed, it is used first.

## Setup

```
npm install
```

## Build

```
npx resumed render resume.json --theme "file://$PWD/index.js" --output resume.html && weasyprint resume.html Sean_Alter_Resume.pdf
```

The theme is passed as an absolute `file://` URL because `resumed` resolves relative paths from inside `node_modules`, so `./index.js` fails.

The `&&` makes WeasyPrint run only if the render succeeds. Otherwise it would convert a stale `resume.html`.

## Theme behavior

- Section order: Education, Work Experience, Projects, Skills (with Interests), Leadership.
- Leadership is built from the `volunteer` array in `resume.json`.
- Work entries print as "Company - Role" with the date range on the right. The `location` field is not printed.
- An education `endDate` in the future prints as "Expected Graduation: Month Year".
- Each project supports one link (`url`), which makes the project title a link.
- Education uses these optional fields: `minor`, `track`, `honors`, `score` (printed as GPA).
- Bullets are drawn with `li::before` in `index.js`. Adjust `left` and `padding-left` to move them.

## Known limitations

- Fonts: Carlito renders slightly differently from Calibri. The line breaks match, but the letter shapes differ.
- Page fit: the resume is dense, so check that it stays on one page after any content change.
