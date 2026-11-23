# Site Structure & Sanity Schema Plan

## Pages
- `/` — single-page scroll site (all sections below)
- Optional later: `/projects/[slug]` individual project detail pages if she wants deep-linkable case studies

## Sections (in order)
1. **Nav** — logo/initials, links to sections, CTA button ("Contact Me")
2. **Hero** — name, tagline, short bio, 2 CTAs, decorative graphic
3. **About** ("Chapter I") — longer bio, 3 stat callouts (e.g. years experience, projects done, certifications), skill category chips
4. **Projects** ("Chapter II") — numbered project list, Sanity-driven
5. **Skills** ("Chapter III") — grouped pill clouds, Sanity-driven
6. **Experience** ("Chapter IV") — timeline, Sanity-driven (skip section entirely if not applicable)
7. **Education & Certifications** ("Chapter V") — optional, Sanity-driven
8. **Contact** ("Chapter VI") — form (name/email/message → Resend) + static social links
9. **Footer**

## Sanity schemas (draft)

### `project`
- title (string)
- order (number) — for the 01/02/03 numbering
- summary (text)
- description (text)
- features (array of string)
- techStack (array of string)
- whyItMatters (text)
- image (image, optional)
- link (url, optional)

### `skillCategory`
- categoryName (string) — e.g. "Languages", "Tools"
- skills (array of string)

### `experienceEntry`
- role (string)
- company (string)
- startDate / endDate (date)
- bullets (array of string)
- tags (array of string)

### `educationEntry`
- type (string) — degree/diploma/certification
- title (string)
- institution (string)
- year (string)
- detail (string, optional)
- certificateUrl (url, optional)

### `siteSettings` (singleton)
- name (string)
- tagline (string)
- bio (text)
- email (string)
- socialLinks (array of {label, url})
- resumeUrl (url, optional)

## Contact form flow
1. Visitor fills form (name, email, message) client-side
2. POST to Next.js API route `/api/contact`
3. API route validates input, calls Resend API to send an email to her (and optionally cc you)
4. Return success/error state to the form, show confirmation UI

## Env vars needed
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_TOKEN` (if using authenticated writes, e.g. from a studio embed)
- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL` (her email, destination for form submissions)
