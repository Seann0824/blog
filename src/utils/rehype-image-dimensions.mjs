import { readFile, stat } from "node:fs/promises";
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

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

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

    /*
     * 文章首图换成 jpg 并立即加载。
     *
     * 起因：微信分享出去的链接只有「小卡片」没有缩略图。微信拼卡片时读的是页面里
     * 第一张能加载的图，而它不认 WebP、也不会为 loading="lazy" 的图去下载。飞书同步
     * 下来的插图全被压成了 webp + 懒加载，微信什么都抓不到；而别家开源博客的首图是
     * jpg 且直接可见，所以它们能出卡片。
     *
     * 所以每篇文章的首图在同步阶段会多留一份 <name>.share.jpg（见
     * scripts/images-to-webp.mjs），这里把它换上去、去掉懒加载。其余插图保持 webp。
     */
    const first = images[0];
    if (first) {
      const src = first.properties?.src;
      if (
        typeof src === "string" &&
        src.startsWith("/") &&
        /\.webp$/i.test(src)
      ) {
        const share = src.replace(/\.webp$/i, ".share.jpg");
        const shareFile = path.join(process.cwd(), "public", share);
        if (await exists(shareFile)) {
          const size = await dimensions(shareFile);
          first.properties.src = share;
          if (size) {
            first.properties.width = size.width;
            first.properties.height = size.height;
          }
          first.properties.loading = "eager";
          first.properties.fetchpriority = "high";
        }
      }
    }

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
