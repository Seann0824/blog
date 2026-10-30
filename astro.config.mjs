import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 站点地址：本地开发用 localhost，线上由 Cloudflare Pages 的 SITE_URL 环境变量注入
const site = process.env.SITE_URL || 'https://blog.example.com';

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [sitemap()],
  markdown: {
    // 飞书同步过来的文档以中文为主，行长控制交给我们自己的 CSS
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
