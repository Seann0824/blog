import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import config from "@/config";

/** elog 把飞书文档写到这个目录，路径前缀也被 getPostPaths 用来算 slug */
export const BLOG_PATH = "src/content/posts";

/**
 * 飞书是北京时间产品，elog 写出来的 `2026-09-18 21:30:00` 这种裸时间
 * 会被解析成 UTC 语义，直接展示会跨到第二天，所以统一按 +08:00 重解释。
 */
const BEIJING_OFFSET_MIN = 8 * 60;

function toBeijingDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const wallClockAsUtc = Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate(),
      value.getUTCHours(),
      value.getUTCMinutes(),
      value.getUTCSeconds()
    );
    return new Date(wallClockAsUtc - BEIJING_OFFSET_MIN * 60 * 1000);
  }
  if (typeof value === "number") {
    const ms = value < 1e12 ? value * 1000 : value;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "string") {
    const raw = value.trim().replace(/\//g, "-");
    const naive = /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/.test(raw);
    const iso = naive
      ? `${raw.replace(" ", "T")}${raw.length === 10 ? "T00:00:00" : ""}+08:00`
      : raw;
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

/** 飞书的标签可能写成数组，也可能写成「a, b」字符串 */
function normalizeTags(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(tag => String(tag).trim()).filter(Boolean);
  }
  return String(raw)
    .split(/[,，、]/)
    .map(tag => tag.trim())
    .filter(Boolean);
}

const dateLike = z
  .union([z.string(), z.date(), z.number()])
  .optional()
  .nullable();

/**
 * 飞书文档属性不完全可控：缺字段不报错、多字段不报错，
 * 这里只把主题需要的字段归一化出来（pubDatetime / modDatetime / tags / description）。
 */
const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: z
    .object({
      title: z.string(),
      date: dateLike,
      updated: dateLike,
      pubDatetime: dateLike,
      modDatetime: dateLike,
      // 飞书文档的 urlname，留作自定义 slug 的备用字段
      urlname: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      tags: z.union([z.array(z.string()), z.string()]).optional().nullable(),
      draft: z.boolean().optional().nullable(),
      featured: z.boolean().optional().nullable(),
      cover: z.string().optional().nullable(),
      ogImage: z.string().optional().nullable(),
      author: z.string().optional().nullable(),
      canonicalURL: z.string().optional().nullable(),
      hideEditPost: z.boolean().optional().nullable(),
      timezone: z.string().optional().nullable(),
    })
    .passthrough()
    .transform(data => {
      const publishedAt =
        toBeijingDate(data.pubDatetime) ??
        toBeijingDate(data.date) ??
        toBeijingDate(data.updated) ??
        new Date(0);

      return {
        ...data,
        author: data.author || config.site.author,
        pubDatetime: publishedAt,
        modDatetime:
          toBeijingDate(data.modDatetime) ?? toBeijingDate(data.updated) ?? null,
        description: data.description?.trim() || "",
        // 主题侧类型是 string | undefined，这里把 null 收掉
        canonicalURL: data.canonicalURL || undefined,
        ogImage: data.ogImage || undefined,
        tags: normalizeTags(data.tags),
        featured: data.featured === true,
        draft: data.draft === true,
        hideEditPost: data.hideEditPost === true,
        timezone: data.timezone || config.site.timezone,
      };
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    canonicalURL: z.string().optional(),
  }),
});

export const collections = { posts, pages };
