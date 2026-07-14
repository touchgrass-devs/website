# Touchgrass.DEVS — Website Rebuild

## Project Root
`D:\naveed\touchgrass.devs\landingsite\`

## What This Project Is
We are a 4-person freelance dev team (Touchgrass.DEVS). We have an existing blueprint site at:

`sample\landing_site_blueprint\`

This blueprint is the **reference for design, theme, and layout only — not content.** Text/copy in the blueprint may be unrelated to our agency, inaccurate, or placeholder-quality; do not assume it's usable as-is. Actual content will be provided by me or drafted on request as we build each section — never carry blueprint copy over by default.

Also note: as the project progresses, the design itself may evolve and diverge from the blueprint based on my direction. When that happens, the blueprint stops being the source of truth for that section/element — the current state of the built site (and what's logged in `notes.md`) takes precedence over the original blueprint. Log any such divergence in `notes.md` (see below) so future sessions don't "correct" the site back toward the blueprint by mistake.

**Do not touch or modify anything inside `sample\landing_site_blueprint\`.** It is read-only reference material. All new work happens in the project root (`landingsite`), outside that folder.

## Working Style — Read This First
This is a **section-by-section, command-driven build.** Do not attempt to scaffold or build the entire site in one pass unless explicitly told to.

- I will name a section (e.g. "hero", "services", "about", "footer") and give a command.
- You build/refine only that section, using the blueprint's version of it as reference for content and rough structure.
- After each section, stop and wait for my review/next command. Do not chain into the next section on your own.
- When I say "implement this change," treat it as a targeted diff — don't refactor unrelated code while doing it, unless the change requires it (and if it does, tell me first).
- If a command is ambiguous, ask a short clarifying question rather than guessing and building the wrong thing.

## The Core Bar: Premium
Every section must feel **extremely premium.** This is the single most important quality standard for this project. Concretely, that means:

- Generous whitespace, never cramped. No stock-template density.
- Typography-led design — strong type hierarchy, considered font pairing, tight kerning/leading control. No default font stacks.
- Motion is subtle and purposeful (GSAP/Framer Motion-level polish), not decorative for its own sake. Micro-interactions on hover/scroll should feel deliberate, not gimmicky.
- Color palette should be restrained and intentional — not "rainbow of Tailwind defaults."
- Every section should look like it belongs on a $50k agency site, not a template marketplace.
- No visible seams: consistent spacing scale, consistent corner radii, consistent shadow language across the whole site.
- Performance matters as much as looks — premium also means fast. No layout shift, no jank on scroll/animation.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** JavaScript (confirm before introducing TypeScript)
- **Styling:** Tailwind CSS
- **Animation:** GSAP (+ Framer Motion where appropriate), Three.js only where it earns its cost
- **Deployment target:** Vercel

## Content
Don't invent content that isn't provided. Ask if something's missing rather than filling in placeholder copy that might ship by accident. Additional context files (design system, content, structure conventions) may be added to this project later — until then, use the blueprint and my direct commands as the source of truth.

## Progress Notes — `notes.md`
Maintain a file called `notes.md` at the project root with a short, running brief of the project's current state. This exists so that switching to a new chat/session doesn't lose context or hinder workflow — a fresh session should be able to read it and know where things stand.

- Update it after meaningful progress: a section completed, a major plan change, a design direction change, a decision I made that affects future work.
- **Always log when the built site diverges from the blueprint** (design, theme, or layout) — note what changed and why, so a future session treats the divergence as the new source of truth rather than reverting toward the blueprint.
- Do NOT dump everything in there. No blow-by-blow logs, no routine edits, no restating things already obvious from the code. Keep entries short and high-signal.
- Prefer a running list of dated, one-to-a-few-line entries over long prose.
- If in doubt about whether something is "note-worthy," lean toward not noting it — this file should stay skimmable in under a minute.

## Skills
Skills live at `./.agents/skills/` (not `./.claude/` — that folder exists but is empty; don't be fooled by it). Before building or editing a section, check `./.agents/skills/` for anything relevant and use it. Currently installed:

- **`design-taste-frontend`** — anti-slop frontend rules (typography, color, layout, motion, hard bans on AI-tell patterns like gradient text, eyebrow-on-every-section, serif-for-emphasis, etc.). Read this before styling any new section.
- **`animation-vocabulary`** — reverse-lookup glossary for naming motion effects.
- **`impeccable`** — a heavier structured design workflow (its own PRODUCT.md/DESIGN.md setup, audit/critique/polish commands). Don't auto-invoke; use only if explicitly asked to run an `impeccable` command.

Skill guidance takes precedence over default approach when there's a conflict — but where a skill's generic rule conflicts with an explicit instruction elsewhere in this file (e.g. "follow the blueprint's layout"), the explicit project instruction wins for structure/layout; skill rules win for generic technical/taste defaults (font loading, color bans, a11y, etc.) that the blueprint didn't dictate.

## What NOT to Do
- Don't add sections, pages, or features I haven't asked for, even if you think they'd be nice.
- Don't swap out the agreed tech stack for something else "because it's easier."
- Don't use lorem ipsum or placeholder images in anything meant to be reviewed as near-final — flag missing assets instead.
- Don't over-engineer: no premature abstraction, no component library bloat for a 4-person team's marketing site.
