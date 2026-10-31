#!/usr/bin/env node
/**
 * 把 public/images 下的 png/jpg 转成 webp，并把 content 里 markdown 的引用改成 .webp。
 *
 * 为什么放在同步之后：
 *   飞书同步每次都会把插图重新下成 PNG，md 里也因此写回 /images/xxx.png。
 *   所以这个脚本必须同时做两件事——
 *     1) 有新图就转 webp 并删掉原图；
 *     2) 不管转没转，只要 webp 在，就把 md 里的 .png/.jpg 引用改成 .webp。
 *   两步都幂等：没有新图、引用已是 .webp 时什么都不改。
 *
 * 只处理 public/images（elog 的 image.local.outputDir）。public/default-og.jpg
 * 是 og:image，不能被转，所以不放进这个目录来扫。
 */
import { readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const IMAGE_DIR = path.join(ROOT, "public", "images");
const CONTENT_DIR = path.join(ROOT, "src", "content");
const QUALITY = 80;
const SOURCE_RE = /\.(png|jpe?g)$/i;

const kb = n => `${Math.round(n / 1024)}K`;

async function listFiles(dir, filter) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listFiles(full, filter)));
    else if (filter(entry.name)) out.push(full);
  }
  return out;
}

async function mtime(file) {
  try {
    return (await stat(file)).mtimeMs;
  } catch {
    return 0;
  }
}

// 1) 转 webp
const sources = await listFiles(IMAGE_DIR, name => SOURCE_RE.test(name));
let converted = 0;
let before = 0;
let after = 0;

for (const src of sources) {
  const dest = src.replace(SOURCE_RE, ".webp");
  if ((await mtime(dest)) >= (await mtime(src))) {
    // webp 已比原图新（同一张图重复同步），直接删掉回流的原图
    await unlink(src);
    continue;
  }
  try {
    const from = (await stat(src)).size;
    await sharp(src).webp({ quality: QUALITY, effort: 5 }).toFile(dest);
    const to = (await stat(dest)).size;
    before += from;
    after += to;
    converted += 1;
    await unlink(src);
    console.log(`  转码 ${path.basename(src)} → ${path.basename(dest)}  ${kb(from)} → ${kb(to)}`);
  } catch (error) {
    console.warn(`  跳过 ${path.basename(src)}：${error.message}`);
  }
}

// 2) 回写 markdown 引用
const posts = await listFiles(CONTENT_DIR, name => /\.mdx?$/i.test(name));
const webpNames = new Set(
  (await listFiles(IMAGE_DIR, name => /\.webp$/i.test(name))).map(f => path.basename(f))
);
let rewritten = 0;

for (const file of posts) {
  const original = await readFile(file, "utf8");
  let next = original;
  const pattern = /(\/images\/)([^"'\s)\]]+?)\.(png|jpe?g)/gi;
  next = next.replace(pattern, (match, prefix, name) =>
    webpNames.has(`${name}.webp`) ? `${prefix}${name}.webp` : match
  );
  if (next !== original) {
    await writeFile(file, next, "utf8");
    rewritten += 1;
    console.log(`  改引用 ${path.relative(ROOT, file)}`);
  }
}

if (converted === 0 && rewritten === 0) {
  console.log("图片已是 webp，无需处理");
} else if (converted > 0) {
  console.log(
    `共转码 ${converted} 张：${kb(before)} → ${kb(after)}（省 ${Math.round((1 - after / before) * 100)}%）`
  );
}
