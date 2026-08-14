# Blog/Portfolio Site Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a working, deployable Astro + Tailwind v4 static blog/portfolio foundation with typed Markdown content collections, dark-only theme, starter content across five tag categories, and a projects index — ready to push to GitHub and deploy on Vercel.

**Architecture:** Astro static site (`output: 'static'`, the default), styled with Tailwind CSS v4 via the official `@tailwindcss/vite` plugin, content authored as Markdown files validated against Zod schemas through Astro's Content Layer (`glob()` loader). No client-side JS framework, no toggle/auth/CMS/database.

**Tech Stack:** Astro `^5.0.0`, Tailwind CSS `^4.0.0` (`@tailwindcss/vite`, `@tailwindcss/typography`), TypeScript `^5.5.0` (types/schema only), npm.

## Global Constraints

- Astro latest 5.x line; Tailwind v4 via `@tailwindcss/vite` (NOT the older `@astrojs/tailwind` v3-era integration).
- Dark-only theme: no `dark:` Tailwind variants, no toggle, no system-preference detection. Colors are hardcoded (zinc/emerald palette).
- Tag taxonomy is fixed to exactly: `homelab`, `ai-agents`, `pc-build`, `3d-printing`, `electronics`. Do not add tags outside this set anywhere in code or content.
- No per-project detail pages in v1 — projects render as cards on a single `/projects` index only.
- No automated test framework is added (per spec's Testing section). Verification per task is `npm run build` succeeding plus, where noted, grepping build output for expected strings. A full manual browser pass through every route is the final human-facing check (Task 11), not something an agent can perform headlessly.
- Commit after every task, using the working directory `C:\Users\Mohammad Khattab\Documents\Main_Brain\blog`.
- Git identity for this repo is already configured locally (`user.name "Mohammad Khattab"`, `user.email "[redacted-email]"`) — do not touch global git config.

---

### Task 1: Scaffold Astro project with Tailwind v4 base setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `astro.config.mjs`
- Create: `.gitignore`
- Create: `src/styles/global.css`
- Create: `src/pages/index.astro` (temporary placeholder — fully replaced in Task 5)

**Interfaces:**
- Produces: an installable npm project with `npm run dev`, `npm run build`, `npm run preview` scripts; `src/styles/global.css` importable by any layout via `import '../styles/global.css'` (relative path adjusts by depth).

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "blog",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "@tailwindcss/typography": "^0.5.0",
    "tailwindcss": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 3: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://example.com',
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 4: Create `.gitignore`**

```
node_modules/
dist/
.astro/
.env
.DS_Store
```

- [ ] **Step 5: Create `src/styles/global.css`**

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

- [ ] **Step 6: Create placeholder `src/pages/index.astro`**

```astro
---
import '../styles/global.css';
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Scaffold check</title>
  </head>
  <body class="min-h-screen bg-zinc-950 text-zinc-200 antialiased">
    <main class="mx-auto max-w-3xl px-4 py-10">
      <h1 class="text-3xl font-bold text-zinc-100">Scaffold OK</h1>
    </main>
  </body>
</html>
```

- [ ] **Step 7: Install dependencies**

Run: `npm install`
Expected: exits 0, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 8: Verify the build**

Run: `npm run build`
Expected: exits 0, creates `dist/index.html`. Grep `dist/index.html` for `Scaffold OK` — must be present.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tsconfig.json astro.config.mjs .gitignore src/styles/global.css src/pages/index.astro
git commit -m "chore: scaffold Astro project with Tailwind v4"
```

---

### Task 2: Content collections — schema + starter posts & projects

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/posts/homelab-planning-a-3-node-proxmox-cluster.md`
- Create: `src/content/posts/ai-agents-starting-jarvis.md`
- Create: `src/content/posts/pc-build-white-matx-build.md`
- Create: `src/content/posts/3d-printing-choosing-a-first-printer.md`
- Create: `src/content/posts/electronics-getting-started.md`
- Create: `src/content/projects/jarvis.md`
- Create: `src/content/projects/homelab.md`
- Create: `src/content/projects/pc-build.md`
- Create: `src/content/projects/3d-printer.md`

**Interfaces:**
- Produces: `TAGS` (readonly array of the 5 tag strings) and `collections` (`posts`, `projects`) exported from `src/content/config.ts`, importable as `import { TAGS } from '../content/config'` (path depth varies by caller) and consumed via `astro:content`'s `getCollection('posts' | 'projects', filterFn?)`.
- Post entry shape: `{ id: string, data: { title: string, date: Date, tags: string[], summary: string, draft: boolean } }`.
- Project entry shape: `{ id: string, data: { title: string, status: 'planned' | 'in-progress' | 'done', tags: string[], summary: string, relatedPosts: string[] } }`.

- [ ] **Step 1: Create `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const TAGS = ['homelab', 'ai-agents', 'pc-build', '3d-printing', 'electronics'] as const;

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.enum(TAGS)).min(1),
    summary: z.string(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    status: z.enum(['planned', 'in-progress', 'done']),
    tags: z.array(z.enum(TAGS)).min(1),
    summary: z.string(),
    relatedPosts: z.array(z.string()).default([]),
  }),
});

export const collections = { posts, projects };
```

- [ ] **Step 2: RED — prove the schema rejects bad frontmatter**

Create a throwaway file `src/content/posts/_schema-check.md`:

```markdown
---
title: "Schema check"
date: 2026-08-01
tags: ["not-a-real-tag"]
summary: "This should fail validation."
---

Throwaway content.
```

Run: `npm run build`
Expected: FAILS — error output mentions an invalid enum value for `tags` (e.g. references `"not-a-real-tag"` against the `TAGS` enum).

- [ ] **Step 3: GREEN — fix the throwaway file and confirm the schema accepts valid data**

Edit `src/content/posts/_schema-check.md`, change `tags: ["not-a-real-tag"]` to `tags: ["homelab"]`.

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 4: Delete the throwaway file**

Delete `src/content/posts/_schema-check.md` (it was only scratch to exercise the schema — never staged in git).

- [ ] **Step 5: Create the 5 starter posts**

`src/content/posts/homelab-planning-a-3-node-proxmox-cluster.md`:

```markdown
---
title: "Planning a 3-Node Proxmox Cluster"
date: 2026-08-01
tags: ["homelab"]
summary: "Laying out the goals and hardware plan for a 3-node Proxmox homelab before buying anything."
---

I'm starting my homelab before I own most of the hardware for it, on purpose —
writing the plan down first forces me to actually decide what I want instead of
buying gear and figuring it out later.

## The plan

Three nodes running Proxmox VE, split across a mix of services:

- DNS-level ad-blocking (Pi-hole or AdGuard Home)
- A WireGuard VPN for remote access
- File and photo storage
- Jellyfin for media
- A small Minecraft server
- General app hosting (containers for whatever I'm tinkering with)
- Home Assistant, once I have smart-home gear and a 3D printer to integrate
- A local LLM, once I have the hardware to run one reasonably

## Why document this now

Future posts in this series will cover node selection, networking (VLANs, DNS,
VPN setup), and the actual service rollout — each as its own post, tagged
`homelab`, so this page can act as an index once there's more than one.
```

`src/content/posts/ai-agents-starting-jarvis.md`:

```markdown
---
title: "Starting Jarvis: A Personal AI Agent"
date: 2026-08-03
tags: ["ai-agents"]
summary: "Kicking off a personal AI agent project, currently in the Claude API integration phase."
---

Jarvis is my attempt at building a personal AI agent from the ground up, rather
than just wiring together an off-the-shelf assistant.

## Where it's at

I'm in the second phase of the project: integrating the Claude API as the
reasoning core. Earlier phases focused on scoping what "personal agent" should
actually mean for me — what it should have access to, what it shouldn't, and how
much autonomy it gets by default.

## What's next

Once the API integration is solid, the next milestones are giving it real tools
to act with and deciding how it should persist context between sessions. I'll
write those up as they land.
```

`src/content/posts/pc-build-white-matx-build.md`:

```markdown
---
title: "Building a White mATX PC"
date: 2026-08-05
tags: ["pc-build"]
summary: "Notes from planning and assembling a compact white mATX build."
---

I wanted a build that was compact, quiet, and didn't look like a gaming rig from
2012 — so I went with a white mATX case and matched components.

## What I learned

Component selection for a themed small-form-factor build is more constrained
than a full-tower ATX build: clearance, cable routing, and airflow all matter
more when there's less case to work with. I hit a few compatibility snags along
the way that are worth writing up in more detail as their own posts.

## Next

A dedicated post with the full parts list and the troubleshooting steps I went
through is coming next.
```

`src/content/posts/3d-printing-choosing-a-first-printer.md`:

```markdown
---
title: "Choosing My First 3D Printer"
date: 2026-08-07
tags: ["3d-printing"]
summary: "Working through printer candidates and constraints before buying my first 3D printer."
---

I don't own a 3D printer yet, but I want to document the decision process, not
just the result.

## Constraints

- Budget: keeping this affordable as a student
- Space: needs to fit in a homelab-adjacent setup, ideally networked
- Use case: mostly homelab and electronics enclosures, not fine-detail
  miniatures

## Status

Still undecided between a few candidate printers. Once Home Assistant is up
and running in the homelab, I'd like the printer integrated into it for
monitoring. A follow-up post will cover the final choice and why.
```

`src/content/posts/electronics-getting-started.md`:

```markdown
---
title: "Getting Started with Electronics"
date: 2026-08-09
tags: ["electronics"]
summary: "An early look at picking up electronics and Arduino as the next skill area."
---

Electronics is the piece of the AI-systems-engineer stack I've touched the
least so far — most of my background is software and, increasingly,
infrastructure via the homelab.

## The plan

Start with the basics: an Arduino kit, simple circuits, and connecting a
microcontroller to something the homelab already has running (probably Home
Assistant, once both exist). No hardware yet, so this tag will stay quiet
until that changes.
```

- [ ] **Step 6: Create the 4 starter projects**

`src/content/projects/jarvis.md`:

```markdown
---
title: "Jarvis"
status: "in-progress"
tags: ["ai-agents"]
summary: "A personal AI agent, currently integrating the Claude API as its reasoning core."
relatedPosts: ["ai-agents-starting-jarvis"]
---

Personal AI agent project. See the linked posts for progress notes.
```

`src/content/projects/homelab.md`:

```markdown
---
title: "Homelab"
status: "planned"
tags: ["homelab"]
summary: "A 3-node Proxmox cluster for DNS ad-blocking, VPN, storage, media, and eventually a local LLM."
relatedPosts: ["homelab-planning-a-3-node-proxmox-cluster"]
---

3-node Proxmox homelab. Hardware not yet acquired; planning is underway.
```

`src/content/projects/pc-build.md`:

```markdown
---
title: "PC Build"
status: "done"
tags: ["pc-build"]
summary: "A custom white mATX PC build."
relatedPosts: ["pc-build-white-matx-build"]
---

Compact white mATX build. See the linked post for parts and troubleshooting
notes.
```

`src/content/projects/3d-printer.md`:

```markdown
---
title: "3D Printer"
status: "planned"
tags: ["3d-printing"]
summary: "Choosing and setting up a first 3D printer, eventually integrated with Home Assistant."
relatedPosts: ["3d-printing-choosing-a-first-printer"]
---

Still deciding on hardware. See the linked post for the candidates under
consideration.
```

- [ ] **Step 7: Verify the full content set builds**

Run: `npm run build`
Expected: exits 0 (9 valid content entries: 5 posts + 4 projects).

- [ ] **Step 8: Commit**

```bash
git add src/content
git commit -m "feat: add content collections schema and starter posts/projects"
```

---

### Task 3: Base layout, Header, Footer (site chrome)

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Modify: `src/pages/index.astro` (swap placeholder body for `BaseLayout` usage, still temporary — replaced again in Task 5)

**Interfaces:**
- Consumes: `src/styles/global.css` from Task 1.
- Produces: `BaseLayout` component with `Props: { title: string; description?: string }` and a default `<slot />`, importable as `import BaseLayout from '../layouts/BaseLayout.astro'` (adjust relative depth per caller).

- [ ] **Step 1: Create `src/components/Header.astro`**

```astro
---
const links = [
  { href: '/', label: 'Home' },
  { href: '/blog/', label: 'Blog' },
  { href: '/projects/', label: 'Projects' },
  { href: '/about/', label: 'About' },
];
---
<header class="border-b border-zinc-800">
  <nav class="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
    <a href="/" class="font-semibold text-zinc-100">Mohammad Khattab</a>
    <ul class="flex gap-4 text-sm text-zinc-400">
      {links.map((link) => (
        <li><a href={link.href} class="hover:text-emerald-400">{link.label}</a></li>
      ))}
    </ul>
  </nav>
</header>
```

- [ ] **Step 2: Create `src/components/Footer.astro`**

```astro
---
const year = new Date().getFullYear();
---
<footer class="mt-16 border-t border-zinc-800 py-6">
  <p class="mx-auto max-w-3xl px-4 text-center text-sm text-zinc-600">
    &copy; {year} Mohammad Khattab. Built with Astro.
  </p>
</footer>
```

- [ ] **Step 3: Create `src/layouts/BaseLayout.astro`**

```astro
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}
const { title, description = 'Personal blog and project log.' } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} · Mohammad Khattab</title>
    <meta name="description" content={description} />
  </head>
  <body class="min-h-screen bg-zinc-950 text-zinc-200 antialiased">
    <Header />
    <main class="mx-auto max-w-3xl px-4 py-10">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 4: Wire the placeholder page through `BaseLayout`**

Replace `src/pages/index.astro` entirely with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Home">
  <h1 class="text-3xl font-bold text-zinc-100">Layout OK</h1>
</BaseLayout>
```

- [ ] **Step 5: Verify**

Run: `npm run build`
Expected: exits 0. Grep `dist/index.html` for `Layout OK` and for a `<header` tag and a `<footer` tag — all must be present.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/BaseLayout.astro src/components/Header.astro src/components/Footer.astro src/pages/index.astro
git commit -m "feat: add base layout, header, and footer"
```

---

### Task 4: Shared display components — TagBadge, PostCard, ProjectCard

**Files:**
- Create: `src/components/TagBadge.astro`
- Create: `src/components/PostCard.astro`
- Create: `src/components/ProjectCard.astro`
- Modify: `src/pages/index.astro` (temporary smoke test rendering one real post card — replaced again in Task 5)

**Interfaces:**
- Consumes: post/project entry shapes from Task 2 (`{ id, data: {...} }`), `TAGS`-based routing convention `/tags/[tag]/`.
- Produces: `TagBadge` (`Props: { tag: string }`), `PostCard` (`Props: { post: CollectionEntry<'posts'> }`), `ProjectCard` (`Props: { project: CollectionEntry<'projects'> }`) — all importable from `../components/<Name>.astro`.

- [ ] **Step 1: Create `src/components/TagBadge.astro`**

```astro
---
interface Props {
  tag: string;
}
const { tag } = Astro.props;
---
<a
  href={`/tags/${tag}/`}
  class="inline-block rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
>
  {tag}
</a>
```

- [ ] **Step 2: Create `src/components/PostCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import TagBadge from './TagBadge.astro';

interface Props {
  post: CollectionEntry<'posts'>;
}
const { post } = Astro.props;
const formattedDate = post.data.date.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
---
<article class="border-b border-zinc-800 py-6">
  <a href={`/blog/${post.id}/`} class="text-xl font-semibold text-zinc-100 hover:text-emerald-400">
    {post.data.title}
  </a>
  <p class="mt-1 text-sm text-zinc-500">{formattedDate}</p>
  <p class="mt-2 text-zinc-400">{post.data.summary}</p>
  <div class="mt-3 flex flex-wrap gap-2">
    {post.data.tags.map((tag) => <TagBadge tag={tag} />)}
  </div>
</article>
```

- [ ] **Step 3: Create `src/components/ProjectCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import TagBadge from './TagBadge.astro';

interface Props {
  project: CollectionEntry<'projects'>;
}
const { project } = Astro.props;
const statusColor: Record<string, string> = {
  planned: 'bg-zinc-700 text-zinc-300',
  'in-progress': 'bg-amber-900 text-amber-300',
  done: 'bg-emerald-900 text-emerald-300',
};
---
<article class="rounded-lg border border-zinc-800 p-5">
  <div class="flex items-center justify-between">
    <h3 class="text-lg font-semibold text-zinc-100">{project.data.title}</h3>
    <span class={`rounded-full px-2 py-1 text-xs ${statusColor[project.data.status]}`}>
      {project.data.status}
    </span>
  </div>
  <p class="mt-2 text-zinc-400">{project.data.summary}</p>
  <div class="mt-3 flex flex-wrap gap-2">
    {project.data.tags.map((tag) => <TagBadge tag={tag} />)}
  </div>
  {project.data.relatedPosts.length > 0 && (
    <div class="mt-3 text-sm text-zinc-500">
      Related posts:
      <ul class="mt-1 list-inside list-disc">
        {project.data.relatedPosts.map((slug) => (
          <li><a class="text-emerald-400 hover:underline" href={`/blog/${slug}/`}>{slug}</a></li>
        ))}
      </ul>
    </div>
  )}
</article>
```

- [ ] **Step 4: Smoke-test all three components together**

Replace `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import PostCard from '../components/PostCard.astro';
import ProjectCard from '../components/ProjectCard.astro';
import { getCollection } from 'astro:content';

const posts = await getCollection('posts');
const projects = await getCollection('projects');
---
<BaseLayout title="Home">
  <h1 class="text-3xl font-bold text-zinc-100">Components OK</h1>
  <PostCard post={posts[0]} />
  <ProjectCard project={projects[0]} />
</BaseLayout>
```

- [ ] **Step 5: Verify**

Run: `npm run build`
Expected: exits 0. Grep `dist/index.html` for `Components OK`, for one of the post titles (e.g. `Planning a 3-Node Proxmox Cluster`), and for one of the project statuses (e.g. `planned` or `in-progress` or `done`) — all must be present.

- [ ] **Step 6: Commit**

```bash
git add src/components/TagBadge.astro src/components/PostCard.astro src/components/ProjectCard.astro src/pages/index.astro
git commit -m "feat: add TagBadge, PostCard, and ProjectCard components"
```

---

### Task 5: Home page

**Files:**
- Modify: `src/pages/index.astro` (final version — replaces the Task 4 smoke test)

**Interfaces:**
- Consumes: `BaseLayout` (Task 3), `PostCard` (Task 4), `getCollection('posts', ...)` (Task 2).

- [ ] **Step 1: Write the final home page**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import PostCard from '../components/PostCard.astro';
import { getCollection } from 'astro:content';

const recentPosts = (await getCollection('posts', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  .slice(0, 3);
---
<BaseLayout title="Home" description="Personal blog and project log for Mohammad Khattab.">
  <section>
    <h1 class="text-3xl font-bold text-zinc-100">Hey, I'm Mohammad.</h1>
    <p class="mt-4 text-zinc-400">
      I'm a Computer Engineering student in Amman, Jordan, working toward
      becoming an AI systems engineer — sitting at the intersection of AI,
      software, and hardware. This site is a running log of what I'm
      building along the way: a homelab, a personal AI agent, a custom PC,
      and eventually 3D printing and electronics.
    </p>
    <p class="mt-4">
      <a href="/projects/" class="text-emerald-400 hover:underline">See what I'm working on &rarr;</a>
    </p>
  </section>

  <section class="mt-12">
    <h2 class="text-xl font-semibold text-zinc-100">Recent posts</h2>
    <div class="mt-4">
      {recentPosts.map((post) => <PostCard post={post} />)}
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: exits 0. Grep `dist/index.html` for `Hey, I'm Mohammad.` and for exactly 3 occurrences of `border-b border-zinc-800` (one per rendered `PostCard` — confirms the slice(0, 3) worked and no more).

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: build final home page with recent posts"
```

---

### Task 6: Blog index page

**Files:**
- Create: `src/pages/blog/index.astro`

**Interfaces:**
- Consumes: `BaseLayout`, `PostCard`, `getCollection('posts', ...)`.

- [ ] **Step 1: Create `src/pages/blog/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import { getCollection } from 'astro:content';

const posts = (await getCollection('posts', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---
<BaseLayout title="Blog" description="All posts.">
  <h1 class="text-3xl font-bold text-zinc-100">Blog</h1>
  <div class="mt-6">
    {posts.map((post) => <PostCard post={post} />)}
  </div>
</BaseLayout>
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: exits 0, creates `dist/blog/index.html`. Grep it for all 5 post titles: `Planning a 3-Node Proxmox Cluster`, `Starting Jarvis: A Personal AI Agent`, `Building a White mATX PC`, `Choosing My First 3D Printer`, `Getting Started with Electronics` — all must be present.

- [ ] **Step 3: Commit**

```bash
git add src/pages/blog/index.astro
git commit -m "feat: add blog index page"
```

---

### Task 7: Post detail page

**Files:**
- Create: `src/layouts/PostLayout.astro`
- Create: `src/pages/blog/[slug].astro`

**Interfaces:**
- Consumes: `BaseLayout`, `TagBadge`, `getCollection`/`render` from `astro:content`.
- Produces: `PostLayout` (`Props: { post: CollectionEntry<'posts'> }`, wraps `BaseLayout`, exposes `<slot />` for rendered Markdown body).

- [ ] **Step 1: Create `src/layouts/PostLayout.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import BaseLayout from './BaseLayout.astro';
import TagBadge from '../components/TagBadge.astro';

interface Props {
  post: CollectionEntry<'posts'>;
}
const { post } = Astro.props;
const formattedDate = post.data.date.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
---
<BaseLayout title={post.data.title} description={post.data.summary}>
  <article class="prose prose-invert max-w-none">
    <h1 class="mb-1 text-3xl font-bold text-zinc-100">{post.data.title}</h1>
    <p class="text-sm text-zinc-500">{formattedDate}</p>
    <div class="mt-3 mb-8 flex flex-wrap gap-2">
      {post.data.tags.map((tag) => <TagBadge tag={tag} />)}
    </div>
    <slot />
  </article>
</BaseLayout>
```

- [ ] **Step 2: Create `src/pages/blog/[slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import PostLayout from '../../layouts/PostLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---
<PostLayout post={post}>
  <Content />
</PostLayout>
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: exits 0, creates `dist/blog/ai-agents-starting-jarvis/index.html` (and 4 sibling post directories). Grep that file for `Starting Jarvis: A Personal AI Agent` and for `Claude API` (body content) — both must be present.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/PostLayout.astro src/pages/blog/[slug].astro
git commit -m "feat: add post detail page and PostLayout"
```

---

### Task 8: Projects index page

**Files:**
- Create: `src/pages/projects/index.astro`

**Interfaces:**
- Consumes: `BaseLayout`, `ProjectCard`, `getCollection('projects')`.

- [ ] **Step 1: Create `src/pages/projects/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ProjectCard from '../../components/ProjectCard.astro';
import { getCollection } from 'astro:content';

const projects = await getCollection('projects');
---
<BaseLayout title="Projects" description="A running index of what I'm building.">
  <h1 class="text-3xl font-bold text-zinc-100">Projects</h1>
  <div class="mt-6 grid gap-4 sm:grid-cols-2">
    {projects.map((project) => <ProjectCard project={project} />)}
  </div>
</BaseLayout>
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: exits 0, creates `dist/projects/index.html`. Grep it for all 4 project titles: `Jarvis`, `Homelab`, `PC Build`, `3D Printer` — all must be present.

- [ ] **Step 3: Commit**

```bash
git add src/pages/projects/index.astro
git commit -m "feat: add projects index page"
```

---

### Task 9: Tags dynamic route page

**Files:**
- Create: `src/pages/tags/[tag].astro`

**Interfaces:**
- Consumes: `BaseLayout`, `PostCard`, `TAGS` from `../../content/config`, `getCollection('posts', ...)`.

- [ ] **Step 1: Create `src/pages/tags/[tag].astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import { getCollection } from 'astro:content';
import { TAGS } from '../../content/config';

export async function getStaticPaths() {
  return TAGS.map((tag) => ({ params: { tag } }));
}

const { tag } = Astro.params;
const posts = (
  await getCollection('posts', ({ data }) => !data.draft && data.tags.includes(tag as (typeof TAGS)[number]))
).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---
<BaseLayout title={`Tag: ${tag}`} description={`Posts tagged ${tag}.`}>
  <h1 class="text-3xl font-bold text-zinc-100">Tag: {tag}</h1>
  <div class="mt-6">
    {posts.map((post) => <PostCard post={post} />)}
  </div>
</BaseLayout>
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: exits 0, creates `dist/tags/homelab/index.html`, `dist/tags/ai-agents/index.html`, `dist/tags/pc-build/index.html`, `dist/tags/3d-printing/index.html`, `dist/tags/electronics/index.html` (5 directories, one per tag). Grep `dist/tags/homelab/index.html` for `Planning a 3-Node Proxmox Cluster` — must be present. Grep the same file for `Starting Jarvis` — must NOT be present (cross-tag leakage check).

- [ ] **Step 3: Commit**

```bash
git add src/pages/tags/[tag].astro
git commit -m "feat: add per-tag post listing page"
```

---

### Task 10: About page

**Files:**
- Create: `src/pages/about.astro`

**Interfaces:**
- Consumes: `BaseLayout`.

- [ ] **Step 1: Create `src/pages/about.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="About" description="About Mohammad Khattab.">
  <h1 class="text-3xl font-bold text-zinc-100">About</h1>
  <div class="prose prose-invert mt-6 max-w-none">
    <p>
      I'm a Computer Engineering student at Princess Sumaya University for
      Technology (PSUT) in Amman, Jordan, having transferred in from
      Industrial Engineering. I'm early in my CS/CE journey, but I already
      know where I'm headed: I want to become an AI systems engineer,
      working at the intersection of AI, software, and hardware rather than
      picking just one lane.
    </p>
    <p>
      This site is where I document that path as I build it — not after
      the fact. Right now that means:
    </p>
    <ul>
      <li>
        <strong>Homelab</strong> — a 3-node Proxmox cluster I'm building
        out for DNS ad-blocking, a VPN, file/photo storage, Jellyfin, a
        Minecraft server, general app hosting, Home Assistant, and
        eventually a local LLM.
      </li>
      <li>
        <strong>Jarvis</strong> — a personal AI agent project, currently
        integrating the Claude API.
      </li>
      <li>
        <strong>PC build</strong> — a custom white mATX build.
      </li>
      <li>
        <strong>3D printing &amp; electronics</strong> — not started yet,
        but planned as I pick up the hardware.
      </li>
    </ul>
    <p>
      I write things up here as I go, mistakes included, mostly so
      future-me (and anyone else on a similar path) has a real record
      instead of a polished after-the-fact summary.
    </p>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: exits 0, creates `dist/about/index.html`. Grep it for `Princess Sumaya University` and `AI systems engineer` — both must be present.

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: add about page"
```

---

### Task 11: README and full-site verification pass

**Files:**
- Create: `README.md`

**Interfaces:**
- None (documentation + verification only).

- [ ] **Step 1: Create `README.md`**

```markdown
# blog

Personal blog and project log — built with Astro, Tailwind CSS v4, and
Markdown content collections.

## Development

\`\`\`bash
npm install
npm run dev      # http://localhost:4321
\`\`\`

## Adding a post

Drop a new Markdown file into `src/content/posts/`, e.g.
`src/content/posts/my-new-post.md`:

\`\`\`markdown
---
title: "My New Post"
date: 2026-08-20
tags: ["homelab"]
summary: "One or two sentences describing the post."
---

Post body in Markdown.
\`\`\`

Valid `tags` values: `homelab`, `ai-agents`, `pc-build`, `3d-printing`,
`electronics`. Set `draft: true` to keep a post out of listing pages.

## Adding a project

Drop a new Markdown file into `src/content/projects/`, e.g.
`src/content/projects/my-project.md`:

\`\`\`markdown
---
title: "My Project"
status: "planned"
tags: ["electronics"]
summary: "One or two sentences describing the project."
relatedPosts: ["my-new-post"]
---

Project body in Markdown (currently unused on the projects index, but
available for a future per-project page).
\`\`\`

`status` must be one of: `planned`, `in-progress`, `done`. `relatedPosts`
is an array of post slugs (filenames without the `.md` extension).

## Build

\`\`\`bash
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
\`\`\`

## Deployment

Push this repo to GitHub, then in Vercel: **Add New Project** → import the
GitHub repo → Vercel auto-detects Astro → **Deploy**. No `vercel.json`
needed for this setup.
```

- [ ] **Step 2: Full-site automated verification**

Run: `npm run build`
Expected: exits 0. Verify the following files all exist in `dist/`: `index.html`, `blog/index.html`, `blog/ai-agents-starting-jarvis/index.html`, `projects/index.html`, `tags/homelab/index.html`, `about/index.html`.

- [ ] **Step 3: Manual browser pass (human step, not agent-automatable)**

Run: `npm run preview`, open the printed local URL, and click through `/`, `/blog/`, one post, `/projects/`, one `/tags/<tag>/`, and `/about/`. Confirm: dark background throughout, header nav works on every page, tag badges link correctly, mobile width (browser dev tools responsive mode) doesn't overflow or clip the nav.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add README with content-authoring instructions"
```

---

### Task 12: GitHub repository and Vercel deployment

**Files:**
- None (repository/hosting operations only).

**Interfaces:**
- None.

> **This task performs actions visible to others (creating a public/private GitHub repo, pushing code) — confirm the repo name and visibility with Mohammad before running the `gh repo create` / `git push` steps, per standing policy on actions affecting shared state.**

- [ ] **Step 1: Confirm repo name and visibility with Mohammad**

Ask: repo name (default `blog`), visibility (`private` or `public`).

- [ ] **Step 2: Create the GitHub repo and push**

```bash
gh repo create <owner>/<repo-name> --<visibility> --source=. --remote=origin
git push -u origin master
```

- [ ] **Step 3: Deploy on Vercel (manual, Mohammad's side)**

In the Vercel dashboard: **Add New Project** → **Import Git Repository** → select the repo just pushed → Vercel auto-detects the Astro framework preset → **Deploy**. No manual config needed for this setup. Report back the deployment URL once live.

- [ ] **Step 4: Update `site` in `astro.config.mjs` once the URL is known**

Modify `astro.config.mjs`, replacing `site: 'https://example.com'` with the real Vercel URL (or custom domain, once set up). Commit:

```bash
git add astro.config.mjs
git commit -m "chore: set production site URL"
git push
```
