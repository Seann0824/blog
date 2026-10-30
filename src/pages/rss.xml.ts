import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postDate, postHref } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  const site = context.site ?? new URL(context.url.origin);

  return rss({
    title: process.env.SITE_NAME || 'Sean 的博客',
    description: process.env.SITE_TAGLINE || '记录一些想法、工具与生活。',
    site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: postDate(post),
      description: post.data.description ?? '',
      link: new URL(postHref(post), site).toString(),
    })),
    customData: '<language>zh-cn</language>',
  });
}
