# Portfolio Site — Project Spec

Reference site: https://bhaveshgudlani.me/ (design/structure inspiration only — content will be 100% hers)

## Status
- [x] Reference site analyzed (design + structure)
- [ ] Her content collected (name, field, projects, skills, experience, contact info)
- [ ] Color palette confirmed (default: match reference, dark navy + neon accents)
- [ ] Sanity project created (schema + studio)
- [ ] Resend contact form wired up
- [ ] Next.js site scaffolded
- [ ] Deployed

## Decisions locked in
- **Site type**: Professional portfolio (hero, about, projects, skills, experience, contact) — same structure as reference site, her content.
- **Contact**: Working contact form. Submissions sent via **Resend** email API to her (and optionally you) — not just static links.
- **CMS**: **Sanity** — projects, skills, experience, and about content will be editable there instead of hardcoded, so she (or you) can update the site without touching code.
- **Stack**: Next.js (App Router) + Sanity (content) + Resend (contact form emails) + Tailwind CSS for styling.

## Still needed from you (blocking content work)
1. Her name + one-line tagline (like "Builds complete systems")
2. Her field/profession
3. 3–5 projects/work items (title + short description each)
4. Skills list (tools/languages/whatever's relevant to her field)
5. Work experience (role, company, dates, bullets) — or skip if not applicable
6. Contact email (where form submissions land) + social links (LinkedIn, Instagram, Behance, GitHub, etc.)
7. Color preference — keep reference palette or pick something else

See `DESIGN.md` for the full extracted design system and `SITE_STRUCTURE.md` for the section-by-section layout plan.

## Build order (once content is in)
1. Scaffold Next.js app + Tailwind, wire up fonts (Syne + DM Sans or her chosen alternative)
2. Set up Sanity Studio + schemas (project, skill, experienceEntry, siteSettings)
3. Build static sections (hero, about, skills) pulling from Sanity
4. Build projects section (Sanity-driven cards/detail)
5. Build experience + education section
6. Build contact form → API route → Resend
7. Scroll animations / polish pass (match reference's chapter-based scroll feel, simplified)
8. Deploy (Vercel recommended — pairs natively with Next.js)
