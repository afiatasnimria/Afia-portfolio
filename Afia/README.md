# Afia Tasnim Ria - Portfolio

A responsive personal portfolio with a Vercel serverless contact form.

## Included

- `index.html` - portfolio content
- `style.css` - responsive styling and animations
- `script.js` - scroll reveal interaction, mobile menu, contact form
- `api/contact.js` - Vercel serverless function for the contact form
- `vercel.json` - Vercel headers/config
- `package.json` - project metadata and optional Vercel CLI scripts
- `robots.txt`, `sitemap.xml` - SEO files
- `.env.example` - environment variable template

## Run Locally

For a static preview, open `index.html` directly in a browser.

For full local testing with the `/api/contact` endpoint:

1. Install the Vercel CLI: `npm i -g vercel`
2. Copy `.env.example` to `.env.local`
3. Fill in `RESEND_API_KEY`
4. Run `vercel dev`

Opening the HTML file directly will not run the API, so the contact form may show a server connection message. That is expected outside Vercel.

## Deploy To Vercel

This project is ready for Vercel as a static site with one serverless function.

### Vercel Dashboard

1. Upload/import this project folder.
2. If you import a parent folder, set the Vercel Root Directory to `Afia`.
3. Framework Preset: `Other`.
4. Build Command: leave empty.
5. Output Directory: leave empty.
6. Add environment variables:
   - `RESEND_API_KEY` - required for the contact form
   - `CONTACT_TO_EMAIL` - optional, defaults to `aria2231058@bscse.uiu.ac.bd`
7. Deploy.

### Vercel CLI

From this folder:

```bash
vercel
vercel deploy --prod
```

## Before Going Live

Replace the placeholder domain `afia-portfolio.vercel.app` with the real deployed domain in:

- `index.html` - canonical URL and Open Graph URL
- `sitemap.xml` - `<loc>`
- `robots.txt` - `Sitemap:`

Add a real `og:image` later if you have a 1200x630 profile image or site preview.
