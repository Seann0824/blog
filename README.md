# 飞书 → 博客

以飞书云文档为写作端、Astro 为渲染层的个人博客。

```
飞书知识库  ──elog sync──▶  src/content/posts/*.md   ──astro build──▶  dist/  ──▶  Cloudflare Pages
（写作）        (每小时)       public/images/*          (静态 HTML)              （你的域名）
```

## 目录结构

```
src/
├── content.config.ts        # 文章 schema（宽松，兼容 elog 的 frontmatter）
├── content/posts/           # elog 同步输出目录，勿手改
├── lib/posts.ts             # 排序 / 日期 / 标签 / 阅读时长
├── layouts/BaseLayout.astro # SEO meta、主题切换
├── components/              # Header、Footer、PostList
├── pages/
│   ├── index.astro          # 首页（按年份分组的文章列表）
│   ├── posts/[...slug].astro# 文章页
│   ├── tags/                # 标签云 + 标签页
│   ├── about.astro
│   └── rss.xml.ts
└── styles/global.css        # 全部样式，无 UI 框架
elog.config.js               # 飞书拉取 + 图片转存配置
.github/workflows/sync.yml   # 每小时同步
```

## 一、飞书侧准备（一次性）

1. 打开 [飞书开放平台](https://open.feishu.cn/page/launcher?from=backend_oneclick) → 创建**企业自建应用**
2. 「凭证与基础信息」里拿 `App ID` 和 `App Secret`
3. 「权限管理」勾选下面三个**只读**权限：
   - `docx:document:readonly` — 读文档内容
   - `wiki:wiki:readonly` — 读知识库节点
   - `drive:drive:readonly` — 下载文档里的图片
4. 「版本管理与发布」→ 创建版本并发布
5. **关键一步**：打开你的知识库 → 右上角「···」→ 添加应用/成员 → 把你的应用加进去
   > 漏了第 5 步，同步会全程 403。这是最常见的卡点。

6. 把知识库 URL 里 `/wiki/space/` 后面那段记下来，就是 `FEISHU_WIKI_ID`

## 二、本地跑通

```bash
cp .elog.env.example .elog.env   # 填入 App ID / Secret / Wiki ID
npm install
npm run sync                     # 从飞书拉文章
npm run dev                      # http://localhost:4321
```

看到文章出现说明链路通了。

## 三、部署到自己的域名

**Cloudflare Pages：**

1. 仓库推到 GitHub
2. Cloudflare Dashboard → Workers & Pages → 创建 Pages → 连接 Git 仓库
3. 构建配置：
   - Framework preset：`Astro`
   - Build command：`npm run build`
   - Build output directory：`dist`
   - 环境变量：`SITE_URL=https://你的域名`、`SITE_NAME=你的站点名`
4. 自定义域名 → 填域名 → 按提示加 CNAME 记录（Cloudflare 托管的域名自动配好 HTTPS）

**开启自动同步：** 在 GitHub 仓库 Settings → Secrets and variables → Actions 里加：

| 类型 | 名称 | 值 |
| --- | --- | --- |
| Secret | `FEISHU_APP_ID` | 应用 ID |
| Secret | `FEISHU_APP_SECRET` | 应用秘钥 |
| Secret | `FEISHU_WIKI_ID` | 知识库 ID |
| Variable | `FEISHU_SOURCE_TYPE` | `wiki`（或用 space） |

加完之后，`sync.yml` 每小时自动拉一次；内容有变化才提交，没变化不动仓库（也就不会触发重复构建）。

## 四、写文章的约定

飞书没有 frontmatter，所以约定是：

- **放哪里**：只有知识库里挂着的文档会被同步。想发一篇，就放到知识库；想下架，就移出知识库。
- **标题**：文档标题就是文章标题，也是默认 URL（中文会被转义）。
- **固定链接**：想要英文短链，在文档里写一行 `urlname: my-post`（elog 会写进 frontmatter），改标题也不会让链接失效。
- **标签**：文档里写 `tags: 设计, 前端` 这一行，会被前端解析成标签数组（逗号/顿号都支持）。
- **日期**：用文档自身的创建/更新时间；想手动指定就在文档里写 `date: 2026-10-30`。
- **草稿**：写 `draft: true` 就不出现在列表和 RSS 里。

## 五、常见问题

**同步后图片裂开？**
图片没有转存成功。检查 `drive:drive:readonly` 权限是否开通，以及 `public/images/` 下有没有文件。图片走本地图床，跟着仓库一起部署，不依赖飞书外链。

**异步下来的文件名是中文，URL 很丑？**
两种解法：一是在文档里写 `urlname`；二是把 `elog.config.js` 里的 `filename: 'title'` 改成 `'docId'`（URL 变成稳定的 doc token，但不可读）。

**改完飞书多久生效？**
最多 1 小时（cron 周期）。想立刻发，去 Actions 页面手动点 `Run workflow`，或本地 `npm run sync && git push`。

**能换渲染层吗？**
能。文章是纯 Markdown，躺在 `src/content/posts/`。换成 Hexo / VitePress / Hugo 只需处理 frontmatter 字段，同步脚本不用动。
