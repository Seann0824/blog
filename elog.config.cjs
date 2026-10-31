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
      // 用飞书文档 token（urlname）当文件名：文档改名不会让 URL 漂移。
      // 曾用 'title'，但标题一改就生成新文件，旧链接直接 404。
      filename: 'urlname',
      format: 'markdown',
      // 按知识库目录结构生成子文件夹；关掉则全部平铺
      catalog: false,
      // 不开这个，elog 只写正文、不写 frontmatter，Astro 会拿不到标题/日期
      frontMatter: {
        enable: true,
      },
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
