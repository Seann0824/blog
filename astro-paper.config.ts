import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    // 线上由 Cloudflare Pages 的 SITE_URL 环境变量注入，本地回落到占位域名
    url: process.env.SITE_URL || "https://blog.example.com",
    title: "Sean 的博客",
    description: "Sean 的个人博客：前端工程师，做 AI 应用与 Agent 方向的产品工程。",
    author: "Sean",
    ogImage: "default-og.jpg",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 10,
    perIndex: 10,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    // 动态 OG 用 satori 生成，中文需要额外字体，先用静态图
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: true,
    editPost: { enabled: false },
    search: "pagefind",
  },
  socials: [],
  shareLinks: [],
});
