import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import mermaid from 'astro-mermaid';

export default defineConfig({
  site: 'https://claude-code-harness-blog.vercel.app',
  integrations: [
    mermaid({
      autoTheme: true,
    }),
    starlight({
      title: 'Claude Code Harness Engineering',
      defaultLocale: 'root',
      locales: {
        root: {
          label: '繁體中文',
          lang: 'zh-TW',
        },
      },
      sidebar: [
        {
          label: '章節',
          autogenerate: { directory: 'chapters' },
        },
      ],
      customCss: ['./src/styles/custom.css'],
      expressiveCode: {
        themes: ['github-dark', 'github-light'],
      },
    }),
    react(),
  ],
});
