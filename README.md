# Mandla Sikhosana — Portfolio

A minimal, interactive developer portfolio. **Live:** https://myportfoliowebsite-snowy.vercel.app

Built with **React 19, TypeScript, Vite, Three.js (React Three Fiber), Motion and Tailwind CSS v4**.

## What's inside

- **Particle orb:** a WebGL point sphere with a custom shader. It breathes, moves away from your cursor, and scatters when clicked.
- **Selected work:** a bento grid of six flagship projects with cursor spotlights, headline metrics and small live diagrams (a disciplinary-process stepper for FairStep, an agent ring for Colleague Zero).
- **Project index:** every public repo, synced live from the GitHub API, with sliding category tabs and expandable rows.
- **About:** a short intro, working principles, a "now" note, a 2026 timeline and a toolkit marquee.
- **Floating dock:** magnifying, macOS-style navigation with a light/dark toggle.
- **Command palette:** press `Ctrl/Cmd + K` or `/` to jump to sections, open projects, copy the email address or switch theme.
- Light and dark themes with no flash on load. Respects `prefers-reduced-motion`. Keyboard-accessible, with a skip link.

New public repos appear automatically with a "new" badge. If the GitHub API is unreachable, the site falls back to the curated data.

## Run it

Requires Node.js 20+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
```

## Customise

| What | Where |
| --- | --- |
| Name, bio, "now" note, email, links, CV | `src/config.ts` |
| Project copy, featured flags, metrics | `src/data/projects.ts` |
| Which projects fill the bento grid | `LAYOUT` in `src/components/SelectedWork.tsx` |
| Timeline and principles | `src/components/About.tsx` |
| Colours (light + dark) and fonts | `src/index.css` |

## Project structure

```
src/
  components/   Hero, SelectedWork, ProjectIndex, About, Contact, Dock, CommandPalette …
  three/Orb.tsx WebGL particle sphere (custom GLSL shader)
  hooks/        useGitHub (live repo sync), useTheme, useInView
  data/         curated project data and skills
  config.ts     personal details
```

## Deploy

The site is hosted on Vercel and connected to this repo, so every push to `main` redeploys it automatically.
