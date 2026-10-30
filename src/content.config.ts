import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * elog 从飞书同步时会原样写入文档属性，格式不完全可控，
 * 所以这里除了 title 之外全部宽松处理：缺字段不报错、多字段不报错。
 */
const dateLike = z
  .union([z.string(), z.date(), z.number()])
  .optional()
  .nullable();

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z
    .object({
      title: z.string(),
      date: dateLike,
      updated: dateLike,
      // 飞书文档的 urlname 可当自定义 slug 用
      urlname: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      tags: z.union([z.array(z.string()), z.string()]).optional().nullable(),
      draft: z.boolean().optional().nullable(),
      cover: z.string().optional().nullable(),
    })
    .passthrough(),
});

export const collections = { posts };
