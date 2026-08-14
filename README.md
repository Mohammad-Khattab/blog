# blog

Personal blog and project log — built with Astro, Tailwind CSS v4, and
Markdown content collections.

## Development

```bash
npm install
npm run dev      # http://localhost:4321
```

## Adding a post

Drop a new Markdown file into `src/content/posts/`, e.g.
`src/content/posts/my-new-post.md`:

```markdown
---
title: "My New Post"
date: 2026-08-20
tags: ["homelab"]
summary: "One or two sentences describing the post."
---

Post body in Markdown.
```

Valid `tags` values: `homelab`, `ai-agents`, `pc-build`, `3d-printing`,
`electronics`. Set `draft: true` to keep a post out of listing pages.

## Adding a project

Drop a new Markdown file into `src/content/projects/`, e.g.
`src/content/projects/my-project.md`:

```markdown
---
title: "My Project"
status: "planned"
tags: ["electronics"]
summary: "One or two sentences describing the project."
relatedPosts: ["my-new-post"]
---

Project body in Markdown (currently unused on the projects index, but
available for a future per-project page).
```

`status` must be one of: `planned`, `in-progress`, `done`. `relatedPosts`
is an array of post slugs (filenames without the `.md` extension).

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
```

## Deployment

Push this repo to GitHub, then in Vercel: **Add New Project** → import the
GitHub repo → Vercel auto-detects Astro → **Deploy**. No `vercel.json`
needed for this setup.
