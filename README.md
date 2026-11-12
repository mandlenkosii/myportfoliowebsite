# Mandla Sikhosana — 3D Portfolio

An interactive, animated 3D portfolio built with **React 19, TypeScript, Vite, Three.js (React Three Fiber + Drei), Motion, Lenis and Tailwind CSS v4**.

## Features

- **Engineering-lab design:** a black, navy, dark-blue, grey and white palette, blueprint grid, IBM Plex type, spec-sheet panels with corner brackets, rulers and a HUD (live cursor coordinates, scroll depth gauge, Johannesburg time).
- **3D instrument:** a gyroscope with graduated gimbal rings, a metallic core, a scanner sweep, orbiting particles and a blueprint grid floor. It reacts to the mouse and scroll position.
- **Orbital index:** every GitHub repository is a node on a polar measurement grid, orbiting on a ring for its category. Drag to rotate, hover for a spec tag, click to open its technical dossier.
- **Live GitHub data:** stats, dates and new repositories come from the GitHub API. Any new public repo shows up automatically with a "NEW" badge. If the API is unreachable, the curated data is used instead.
- **Project cards:** 3D tilt cards with filters and search, and a detail modal with an in-page live-site preview.
- **Capability lattice:** a rotating molecular model of technologies, with bonds between nearest neighbours, isolated by group.
- **Journey timeline:** built from repository creation dates.
- Custom cursor, magnetic buttons, smooth scrolling, a page loader and a scroll progress bar.
- Responsive layout. Respects `prefers-reduced-motion`. Offscreen 3D canvases pause to save battery.

## Run it

Requires Node.js 20+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Customise

| What | Where |
| --- | --- |
| Name, bio, email, LinkedIn, CV, photo, GitHub username | `src/config.ts` |
| Project titles, descriptions, highlights, featured flags | `src/data/projects.ts` |
| Skills list | `skills` in `src/data/projects.ts` |
| Timeline captions | `milestones` in `src/components/Journey.tsx` |
| Colours and fonts | `@theme` in `src/index.css` (3D colours: `C` in `src/three/BackgroundScene.tsx`) |

To show a headshot instead of the ID schematic, put `photo.jpg` in `public/` and set `photo: '/photo.jpg'`. To add a CV, put `cv.pdf` in `public/` and set `links.cv: '/cv.pdf'`.

## Deploy (Vercel)

1. Push this folder to a new GitHub repo.
2. Import it at vercel.com. The Vite preset is detected automatically (build: `npm run build`, output: `dist`).
