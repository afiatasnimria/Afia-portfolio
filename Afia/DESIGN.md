# Design System — extracted from bhaveshgudlani.me

## Colors
| Token | Value | Use |
|---|---|---|
| Background (base) | `#0D0B1F` (rgb(13,11,31)) | Page background, deep navy/near-black purple |
| Text (primary) | `#F5F2EC` (rgb(245,242,236)) | Body text, warm off-white |
| Accent (lime) | `#9DC700` (rgb(157,199,0)) | Primary CTA buttons, highlighted words in headings, links |
| Accent (pink/magenta) | seen in "something" heading + a floating pill | secondary highlight, used sparingly |
| Pill/tag colors | multiple — pink, yellow-green, cyan, purple, teal | small rotating skill pills around the hero graphic, each a flat saturated color on dark bg |

Overall palette = one dark neutral + one dominant neon accent (lime) + a small rotating set of bright accent colors used only in tiny decorative elements (tags/pills), never in large fields.

## Typography
- **Display / headings**: `Syne, sans-serif` — bold, geometric, condensed-feel, all-caps for the hero name
- **Body**: `DM Sans, sans-serif` — clean grotesque, good readability at small sizes
- Large hero name is huge (multi-line, near full-width), tight line-height, heavy weight
- Section labels use small uppercase tracked-out text prefixed with a "Chapter N" motif (e.g. "Chapter I – Who I Am")

## Layout & Structure
- Single-page scroll site, sections divided by thin horizontal rules with a subtle gradient line
- Fixed/sticky top nav: logo mark (initials, e.g. "BG.") left, section links center-right, CTA button far right
- Hero: big name headline, italic subtitle tagline, short bio paragraph with bold inline keywords, two CTA buttons (primary filled lime, secondary outlined), decorative floating "skill pill" cluster orbiting a center label (e.g. "BUILDS")
- Section pattern repeats: small "Chapter N" eyebrow label → section heading → content grid
- Projects section: numbered list (01/05 style) with progress dots, each project expands to show description, key features (bullet list with checkmarks), tech stack as pill tags, and a "why it matters" closing line
- Skills section: grouped by category (Languages / Frameworks / Tools) as flat pill/tag clouds
- Experience: timeline-style entries, role + company + dates, bullet achievements, tech tags
- Contact ("Let's Talk"): big heading with accent-colored second line, short invitation text, stacked contact rows (email / LinkedIn / GitHub) each with an arrow icon
- Footer: name, location, year, one-line sign-off

## Motion / Interaction (reference site)
- Scroll-driven reveal animations per section (content fades/slides in as it enters viewport)
- Subtle floating animation on the hero's decorative pills
- Likely GSAP ScrollTrigger or Framer Motion under the hood

## Adaptation notes for her site
- Keep: dark base + single dominant accent color, Syne/DM Sans pairing (or a close alternative if she prefers a softer feel), chaptered section rhythm, numbered project list, pill-tag skills.
- Swap: accent color to her preference (confirm before building), decorative hero graphic content (swap generic tech words for whatever fits her field), all copy.
- Simplify if needed: the elaborate scroll-chapter choreography is nice-to-have polish, not a blocker — build the static structure first, layer in scroll animation last.
