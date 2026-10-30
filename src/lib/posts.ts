import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/** 把 elog 可能输出的各种日期形态统一成 Date | null */
/**
 * YAML 里写成 `2026-09-18 21:30:00` 的裸时间，会被解析成「UTC 语义」的 Date；
 * 而飞书是北京时间产品，所以这里把 Date 的 UTC 墙钟时间重解释为 +08:00，
 * 否则 21:30 发布的中文文章会显示成第二天。
 * 携带显式时区的时间戳（数字）不受影响。
 */
const BEIJING_OFFSET_MIN = 8 * 60;

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const wallClockAsUtc = Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate(),
      value.getUTCHours(),
      value.getUTCMinutes(),
      value.getUTCSeconds(),
    );
    return new Date(wallClockAsUtc - BEIJING_OFFSET_MIN * 60 * 1000);
  }
  if (typeof value === 'number') {
    // 兼容「秒级时间戳」和「毫秒级时间戳」
    const ms = value < 1e12 ? value * 1000 : value;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const raw = value.trim().replace(/\//g, '-');
    // 飞书/Astro 出来的「2026-09-18 21:30:00」这类无时区写法，按北京时间解析，
    // 否则 V8 会当成 UTC，再按 Asia/Shanghai 格式化就会跨天。
    const naive = /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/.test(raw);
    const iso = naive
      ? `${raw.replace(' ', 'T')}${raw.length === 10 ? 'T00:00:00' : ''}+08:00`
      : raw;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function postDate(post: Post): Date {
  return toDate(post.data.date) ?? toDate(post.data.updated) ?? new Date(0);
}

/** 标签统一成数组，兼容 elog 写成字符串或数组两种形态 */
export function postTags(post: Post): string[] {
  const raw = post.data.tags;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((t) => String(t).trim()).filter(Boolean);
  return String(raw)
    .split(/[,，、]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function formatDate(date: Date): string {
  if (!date.getTime()) return '';
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai',
  }).replace(/\//g, '-');
}

/** 中英混排的粗略阅读时长 */
export function readingTime(body: string): number {
  const text = body.replace(/```[\s\S]*?```/g, '');
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const words = text.replace(/[\u4e00-\u9fa5]/g, ' ').split(/\s+/).filter((w) => /[a-zA-Z0-9]/.test(w)).length;
  return Math.max(1, Math.round(cjk / 400 + words / 200));
}

/**
 * elog 会把没有显式 urlname 的文档自动填成 obj_token（22 位字母数字），
 * 直接当 slug 会生成 /posts/WS2JdNyIEoEdrhx3sMqckciHnWg/ 这种链接。
 * 所以只接受「像人写的」urlname，否则退回文件名。
 */
const TOKEN_LIKE = /^[A-Za-z0-9_-]{20,}$/;

export function postSlug(post: Post): string {
  const urlname = (post.data.urlname || '').trim();
  if (urlname && !TOKEN_LIKE.test(urlname)) return urlname;
  return post.id.replace(/\.md$/, '');
}

export function postHref(post: Post): string {
  return `/posts/${postSlug(post)}/`;
}

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => {
    if (data.draft === true) return false;
    return true;
  });
  return posts.sort((a, b) => postDate(b).getTime() - postDate(a).getTime());
}

export async function getAllTags(): Promise<Map<string, Post[]>> {
  const posts = await getPosts();
  const map = new Map<string, Post[]>();
  for (const post of posts) {
    for (const tag of postTags(post)) {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(post);
    }
  }
  return new Map([...map.entries()].sort((a, b) => b[1].length - a[1].length));
}
