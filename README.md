# FAN Lab — Laboratory Website

Static academic research laboratory website for **FAN Lab** at the **College of Jiyang, Zhejiang A&F University** (浙江农林大学暨阳学院). Principal Investigator: **Prof. Yuchuan Fan / 范豫川**.

Plain HTML, CSS, and JavaScript only. No build tools, no npm, no frameworks, no backend.

The **repository root is the site root**, suitable for publishing as a GitHub user/organization site (`USERNAME.github.io`).

---

## Local preview

Browsers block `fetch()` of JSON from `file://`. Serve the folder over HTTP:

```bash
cd /path/to/this-repo   # the folder that contains index.html
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

---

## Language toggle (中文 | EN)

- Toggle lives in the top navigation on every page.
- Choice is stored in `localStorage` as `lab-lang` = `zh` | `en`.
- Default: browser `zh*` → Chinese, otherwise English.
- UI strings: `data/i18n.json`. Content strings use `{ "en": "...", "zh": "..." }` in the other JSON files.
- Switching language re-renders the current page without a full reload.

---

## Edit content

| File | Purpose |
|------|---------|
| `data/site.json` | Lab name, logo path, tagline, institution, nav, footer, contact |
| `data/i18n.json` | Shared UI chrome strings (nav labels, buttons, empty states) |
| `data/about.json` | About page paragraphs and research approach |
| `data/pi.json` | Dedicated PI page content |
| `data/people.json` | **Single source of truth for the People page** — members with `group` (`pi` \| `researcher` \| `graduate` \| `assistant`), bilingual fields, portraits/monograms |
| `data/research.json` | Research themes (bilingual titles + descriptions + icon keys) |
| `data/publications.json` | Lab publications list (placeholders until filled) |

### People

1. Edit `data/people.json` → `members`.
2. Set `group`, bilingual `name` / `role` / `bio` / `keywords`, optional `portrait` or `monogram`.
3. `hasProfile: true` enables `member.html?id=…` (except PI, who uses `profileHref: "pi.html"`).
4. Never publish private emails (QQ / 126.com etc.). Only institutional emails already approved for the site.

### Logo

Official mark: `assets/images/fanlab-lockup-v2.png` (also used as favicon). Do not recolour, crop, or stretch.

---

## Site map

| Page | File |
|------|------|
| Home | `index.html` |
| About | `about.html` |
| Research | `research.html` |
| People | `people.html` |
| Member profile | `member.html?id=` |
| PI | `pi.html` |
| Publications | `publications.html` |
| Contact | `contact.html` |

---

## Privacy

Do not publish mobile numbers, birth dates, hometown, political affiliation, private emails, or incomplete personal data. Do not invent publications, funding, awards, or roles.

---

## Design

Forest green (`#1B4332`) + cream backgrounds · Source Serif 4 + Source Sans 3 · semantic HTML · sticky header · language toggle.
