# Kadua website (Phase 1)

Static site for Kadua, "Kasama sa Bawat Hakbang", a connection point for mental wellness
support in the Philippines. Built as the Phase 1 minimum viable platform described in the
Kadua feasibility study: a resource center, a professional directory, and a persistent
Immediate Help hub. No accounts, no database, no personal data stored.

## Pages

| Page | Study section it comes from |
|---|---|
| `index.html` Home: four doors, what Kadua is and isn't, how it works | Executive summary; §I.A problem; §VII user journey (step 2 "choose a need") |
| `immediate-help.html` verified hotlines, what to expect, how the page is kept right | §IV.A.1 Immediate Help/Safety Hub; §III.C "documented process for checking accuracy" |
| `find-support.html` filterable directory (sample entries), verification steps, apply | §IV.A.1 Professional Support "curated directory and search/filter"; §III.C verification before publication and re-verification |
| `self-care.html` five guides, Phase 2 product interest form | §IV.A.1 Self-Care "educational resources and a small product catalog"; Appendix A Phase 2 go/no-go evidence (demand) |
| `community.html` categories, participation rules, join or organize forms | §IV.A.1 Community and Hobbies "curated listings/partner groups"; §II.A partnerships; §III.C participation rules, reporting, moderation |
| `about.html` name rationale, four areas, is and isn't, roadmap, team units, privacy, feedback | §I.B rationale; §III.B organizational structure; §III.D privacy as a core design requirement; Appendix A roadmap |
| `guides/*.html` five short guides | §IV.A.1 Resource Center "articles, guides, practical information"; §IV.D promotion rules (no diagnosing, no guaranteed outcomes, products never replace treatment) |

## Editing without touching code

- **Hotline numbers and the last-checked date:** `immediate-help.html` for the numbers,
  `js/config.js` for `lastChecked`. Record every check in `VERIFICATION-LOG.md`.
- **Directory entries:** `data/providers.js`. Add a real entry only after the verification
  steps on the Find Support page are complete, and change `status` to the verified text and date.
- **Community groups:** `data/communities.js`.
- **Forms and contact email:** `js/config.js`. Paste the Google Form or Tally URLs. Until a
  URL is set, the matching button shows "opens here once connected".
- **Guides:** edit the HTML in `guides/`. Update the "Last updated" line and the review status
  once a qualified adviser signs off.

## Design

Tokens live in `css/tokens.css` (warm paper, deep green accent, one clay reserved for the crisis control;
Newsreader and Figtree, self-hosted in `fonts/`). Photos are licensed Unsplash images, self-hosted in `img/`
at two widths and credited in `img/CREDITS.md`. Motion is one fade-up per element on first view and small hover
lifts (`js/motion.js`), all off under reduced-motion. Mobile-first, works at 320 px and up.

## Run locally

Open `index.html` in a browser, or run `python3 -m http.server 8080` in this folder and
visit http://localhost:8080.

## Deploy

GitHub Pages from the `main` branch root. Any static host works (Cloudflare Pages, Netlify).
