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
