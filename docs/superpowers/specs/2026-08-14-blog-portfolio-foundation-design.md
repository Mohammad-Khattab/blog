# Blog/Portfolio Site Foundation — Design

## Context

Mohammad is a first-year Computer Engineering student (transferred from Industrial Engineering) at PSUT, based in Amman, Jordan, working toward becoming an AI systems engineer. This site is a running log/portfolio of projects along that path — homelabbing, a personal AI agent ("Jarvis"), a custom PC build, and eventually 3D printing/electronics. The goal here is a **foundation only**: structure, tooling, design system, and starter content — not final long-form writing.

## Goals

- Low-maintenance static site, Markdown-first writing workflow
- Simple enough that Mohammad can read and extend every part of the codebase himself
- Deployable via GitHub → Vercel now, with a path to self-hosting (homelab) + custom domain later without code changes
- Structured enough to scale as posts/projects accumulate (typed frontmatter, tag taxonomy)

## Non-goals (v1)

- No CMS, no database, no auth
- No light/dark toggle — dark-only theme
- No per-project detail pages — projects are cards on a single `/projects` index
- No comments, search, or analytics wiring (can be added later)

## Stack

- **Astro** (latest stable) — static-site generator, ships zero JS by default, file-based routing, built-in typed Content Collections (Markdown frontmatter validated at build time via Zod, so a typo breaks the build instead of silently rendering wrong).
- **Tailwind CSS v4** via `@tailwindcss/vite` — utility classes in markup, fast theming, minimal separate CSS to maintain.
- **TypeScript** — comes with Astro's default template, used only for the content-collection schema (`src/content/config.ts`), not app logic.
- **Deployment** — GitHub repo as source of truth; Vercel connected to the repo for auto-deploy on push. Framework preset auto-detected by Vercel (no vercel.json needed for a stock Astro project). Self-hosting on homelab is a later, separate step (out of scope here) — the static build output (`dist/`) is portable to any static host, so no rework is needed when that happens.

### Why Astro over Next.js or Hugo

- **Next.js (static export)**: more industry-standard as a resume skill, but requires learning React/App Router/hydration concepts just to run a Markdown blog — more conceptual overhead than the task needs.
- **Hugo**: fastest builds, mature theme ecosystem, but Go templates are a dead-end skill for an AI-systems path and make it awkward to later embed an interactive component (e.g. a live homelab-status widget).
- **Astro**: content-focused by design, minimal JS, `.astro` components are close to plain HTML (gentle for someone newer to frontend), and React/Vue components can be dropped in later for interactive pieces without switching frameworks.

## Folder structure

```
blog/
  src/
    content/
      posts/           # one .md file per blog post
      projects/        # one .md file per project
      config.ts        # Zod schemas for posts + projects frontmatter
    components/
      Header.astro
      Footer.astro
      PostCard.astro
      ProjectCard.astro
      TagBadge.astro
    layouts/
      BaseLayout.astro   # <html> shell, header/footer, meta tags
      PostLayout.astro   # wraps BaseLayout, adds post title/date/tags chrome
    pages/
      index.astro             # home
      about.astro
      projects/
        index.astro            # projects index (cards)
      blog/
        index.astro             # all posts, newest first
        [slug].astro             # single post
      tags/
        [tag].astro               # posts filtered by one tag
    styles/
      global.css                  # Tailwind entry + any global overrides
  astro.config.mjs
  package.json
  tsconfig.json
  README.md
```

## Content schemas (`src/content/config.ts`)

**posts** collection:
- `title: string`
- `date: date`
- `tags: array of enum('homelab', 'ai-agents', 'pc-build', '3d-printing', 'electronics')`
- `summary: string`
- `draft?: boolean` (default `false`) — draft posts excluded from listing pages in production builds

**projects** collection:
- `title: string`
- `status: enum('planned', 'in-progress', 'done')`
- `tags: array` (same enum as posts)
- `summary: string`
- `relatedPosts?: array of string` (post slugs, rendered as links on the project card)

## Pages & data flow

- **Home (`/`)** — short intro/about blurb, the 3 most recent posts, a link to `/projects`.
- **Blog index (`/blog`)** — all non-draft posts, newest first, each with clickable tag badges linking to `/tags/[tag]`.
- **Post (`/blog/[slug]`)** — rendered Markdown body inside `PostLayout`.
- **Projects (`/projects`)** — every project as a card: title, status badge, tags, summary, links to its `relatedPosts`. No individual project detail pages in v1.
- **Tag (`/tags/[tag]`)** — posts filtered to one tag, statically generated for each enum value via `getStaticPaths`.
- **About (`/about`)** — fuller written bio (CE student at PSUT, transferred from Industrial Engineering, Amman-based, AI systems engineer trajectory, current focus areas).

## Starter content

- One placeholder post per tag (5 total): `homelab`, `ai-agents`, `pc-build`, `3d-printing`, `electronics`.
- Project entries seeded from known context: Jarvis (ai-agents, in-progress), Homelab (homelab, planned), PC Build (pc-build, done/in-progress as applicable), 3D Printer (3d-printing, planned — still deciding on hardware).
- About page drafted from the bio provided, not left as a placeholder.

## Deployment steps (manual, Mohammad's side)

1. Create a GitHub repo (empty) — Claude can do this via `gh repo create` with confirmation, or Mohammad creates it himself.
2. Push the local `blog/` repo to it.
3. In the Vercel dashboard: "Add New Project" → import the GitHub repo → Vercel auto-detects Astro → Deploy. No config file needed for a stock setup.
4. Future: point homelab reverse proxy and/or a custom domain at either the Vercel deployment or a self-hosted static build — no code changes required since output is a portable `dist/` folder.

## Testing

Static content site — no automated test suite planned for v1. Verification is: `npm run build` succeeds with zero Content Collection schema errors, and a manual pass through each route (`/`, `/blog`, `/blog/[slug]`, `/projects`, `/tags/[tag]`, `/about`) in the dev server before calling it done.
