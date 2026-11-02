/**
 * /projects 页面数据。
 *
 * 事实全部来自 Resume.astro 里的履历与本地工具本身，没写没验证过的数字。
 * 分组只按「受众关系」分两类：自己做的东西，和工作里交付的东西。
 */
export type ProjectItem = {
  name: string;
  desc: string;
  /** 有公开入口才给 href；没有就渲染成纯文本条目，点不动 */
  href?: string;
  /** 一行补充信息：状态、体量、技术栈，都写可核实的 */
  meta?: string[];
};

export type ProjectGroup = {
  label: string;
  note?: string;
  items: ProjectItem[];
};

export const projectGroups: ProjectGroup[] = [
  {
    label: "独立产品",
    note: "自己选题、自己写、自己部署",
    items: [
      {
        name: "AgentOS · 个人 agent 系统",
        desc: "部署在云端机器上的 agent 运行时，目标是每个人都能拥有、并自己部署一套属于自己的 agent。",
        meta: ["进行中", "云端服务"],
      },
      {
        name: "机票神操作 CLI",
        desc: "微信扫码登录小程序，查航线、随心飞与航班价格日历，结果导出 JSON / CSV。",
        meta: ["本地工具", "Node.js"],
      },
      {
        name: "海南航空 666PLUS 查询",
        desc: "对接海航官方接口查 666PLUS 会员价，按航线与日期比价，可导入自己浏览器的 HAR 会话。",
        meta: ["本地工具"],
      },
      {
        name: "这个博客",
        desc: "飞书云文档当写作端、Astro 当渲染层，同步即发布；正文图片在构建期统一转 WebP。",
        href: "https://sean.englife.space",
        meta: ["Astro", "飞书"],
      },
    ],
  },
  {
    label: "工作中交付",
    note: "在公司做的东西，多数不对外，这里只写结论",
    items: [
      {
        name: "MasterGo Agent / MCP",
        desc: "自然语言生成、编辑设计稿，并让 AI 读取设计数据生成代码；核心是 Agent Loop、工具调度与流式消息解析。",
        href: "https://www.npmjs.com/package/@mastergo/magic-mcp",
        meta: ["magic-mcp 18 万+ 下载"],
      },
      {
        name: "MasterGo 本地字体服务",
        desc: "用 Rust + Tokio + TTF-parser 重写插件底层，解决解析低效与内存泄漏。",
        meta: ["安装包 65MB → 3MB", "内存 700MB → 15MB"],
      },
      {
        name: "TikTok 素材库与创编流程",
        desc: "统一 Video / Image / Post 三类素材的筛选、日期、自定义列、下载与删除，并设计前端灰度、回滚与新旧链路隔离。",
        meta: ["2026"],
      },
      {
        name: "CreativeRelations · 素材绑品",
        desc: "基于 Module Federation 封装远程组件供多项目复用，统一业务白名单 Hook 管理多条业务线准入。",
        meta: ["覆盖 4,000+ 广告主"],
      },
    ],
  },
];
