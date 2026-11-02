/**
 * /projects 页面数据。
 *
 * 铁律：只放能真跳转的条目。没有公开入口的项目（公司内部系统、本地私有工具）
 * 一个都不列 —— 卡片点不动比没有这张卡片更糟。每个 href 都实际请求过：
 * 仓库返回 200，npm 包能解析出版本号。
 */
export type Project = {
  name: string;
  desc: string;
  href: string;
  /** 一行补充信息：语言、星标、体量，都可核实 */
  meta?: string[];
};

/** 大致按「分量 + 新鲜度」排，不分组：能点开的只有这几个，硬分组反而显空 */
export const projects: Project[] = [
  {
    name: "Shirley",
    desc: "用 Rust 写的 coding agent：可复用的 Agent SDK（协议适配、ReAct 运行时、沙箱、工具宏），上面再搭 TUI 和 Tauri 桌面端。",
    href: "https://github.com/Seann0824/Shirley",
    meta: ["Rust", "Agent SDK"],
  },
  {
    name: "deepseek-harness-for-codex",
    desc: "Codex 插件兼 MCP server：在本机跑 DeepSeek Harness，通过可见的网页会话派任务，再让 Codex 独立复核结果。",
    href: "https://github.com/Seann0824/deepseek-harness-for-codex",
    meta: ["TypeScript", "★ 12"],
  },
  {
    name: "TubeGate",
    desc: "用自然语言规则过滤 YouTube 推荐：自定义主题、保留条件和一键恢复，不想看的东西不再反复出现。",
    href: "https://github.com/Seann0824/TubeGate",
    meta: ["TypeScript"],
  },
  {
    name: "movies-search-mcp",
    desc: "影视搜索的 MCP Server，给支持 MCP 的客户端直接挂上检索能力。",
    href: "https://github.com/Seann0824/movies-search-mcp",
    meta: ["TypeScript", "★ 5"],
  },
  {
    name: "MasterGo Agent / MCP",
    desc: "自然语言生成、编辑设计稿，并让 AI 读取设计数据生成代码；公开部分是这个 npm 包，接的是 MasterGo 的云端服务。",
    href: "https://www.npmjs.com/package/@mastergo/magic-mcp",
    meta: ["npm 18 万+ 下载", "v0.2.12"],
  },
  {
    name: "这个博客",
    desc: "飞书云文档当写作端、Astro 当渲染层，同步即发布；正文图片在构建期统一转 WebP。",
    href: "https://sean.englife.space",
    meta: ["Astro", "正在运行"],
  },
];
