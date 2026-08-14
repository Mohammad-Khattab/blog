import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://blog-lemon-chi-16.vercel.app',
  vite: {
    plugins: [tailwindcss()],
  },
});
