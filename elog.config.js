/**
 * elog 配置：飞书知识库 → 本地 Markdown
 * 凭证放在 .elog.env（已被 .gitignore 忽略），CI 里由 GitHub Secrets 注入。
 */
module.exports = {
  write: {
    platform: 'feishu',
    feishu: {
      // wiki = 知识库；space = 我的空间（配合 folderToken 指定文件夹）
      type: process.env.FEISHU_SOURCE_TYPE || 'wiki',
      wikiId: process.env.FEISHU_WIKI_ID || '',
      folderToken: process.env.FEISHU_FOLDER_TOKEN || '',
      appId: process.env.FEISHU_APP_ID || '',
      appSecret: process.env.FEISHU_APP_SECRET || '',
      // 不生成「知识库根节点」这篇额外文档
      disableParentDoc: true,
      // 图片下载并发
      limit: 5,
    },
  },
  deploy: {
    platform: 'local',
    local: {
      // Astro content collection 直接读这个目录
      outputDir: './src/content/posts',
      // 用文档标题当文件名；想要英文 URL 就在飞书侧把 urlname 改成英文短链
      filename: 'title',
      format: 'markdown',
      // 按知识库目录结构生成子文件夹；关掉则全部平铺
      catalog: false,
    },
  },
  image: {
    // 关键：飞书图片有鉴权防盗链，必须转存到本站
    enable: true,
    platform: 'local',
    local: {
      outputDir: './public/images',
      prefixKey: '/images',
      pathFollowDoc: false,
    },
  },
};
