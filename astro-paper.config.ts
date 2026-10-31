import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    // 线上由 caddy 直接托管在 sean.englife.space；SITE_URL 仅作临时覆盖用。
    // 这个值进 canonical / og:url / RSS / sitemap 和分享二维码，错了别人点进来就是死链。
    url: process.env.SITE_URL || "https://sean.englife.space",
    title: "Sean 的博客",
    // 直接沿用 README 的自述句子（README.md:3），不再另编一版
    description: "以飞书云文档为写作端、Astro 为渲染层的个人博客。",
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
