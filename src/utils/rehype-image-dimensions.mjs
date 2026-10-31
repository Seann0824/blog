import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * 给 markdown 里的 <img> 补上 width/height 与懒加载属性。
 *
 * 起因：文章插图是飞书同步下来的 1408x768 PNG，不带尺寸信息。移动端 4G 下
 * 图片还没下载完时，<img> 会塌成一条空框（还带着 1px 边框），正文被顶来顶去。
 * 有了宽高，浏览器就能先把位置占住。
 */
const cache = new Map();

async function dimensions(file) {
  if (cache.has(file)) return cache.get(file);
  let size = null;
  try {
    const { width, height } = await sharp(await readFile(file)).metadata();
    if (width && height) size = { width, height };
  } catch {
    // 文件不存在或不是图片，忽略即可
  }
  cache.set(file, size);
  return size;
}

export function rehypeImageDimensions() {
  return async tree => {
    const images = [];
    const walk = node => {
      if (node.type === "element" && node.tagName === "img") images.push(node);
      for (const child of node.children ?? []) walk(child);
    };
    walk(tree);

    await Promise.all(
      images.map(async node => {
        const src = node.properties?.src;
        if (typeof src === "string" && src.startsWith("/")) {
          const size = await dimensions(path.join(process.cwd(), "public", src));
          if (size) {
            node.properties.width ??= size.width;
            node.properties.height ??= size.height;
          }
        }
        node.properties.loading ??= "lazy";
        node.properties.decoding ??= "async";
      })
    );
  };
}
