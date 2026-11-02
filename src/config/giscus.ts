/**
 * giscus（GitHub Discussions 评论）配置。
 *
 * repoId / categoryId 不是自造标识，是 GitHub 的 GraphQL node id：
 *   repoId     仓库 node_id，公开 API 就能取：
 *              curl -s https://api.github.com/repos/Seann0824/blog | grep node_id
 *   categoryId Discussions 分类 node id，必须装完 giscus App 才有：
 *              curl -s "https://giscus.app/api/discussions/categories?repo=Seann0824/blog"
 *
 * 任一为空时评论组件整体不渲染 —— 宁可暂时没有评论区，也不在页面上挂一个报错的 iframe。
 */
export const giscus = {
  repo: "Seann0824/blog",
  repoId: "R_kgDOVd1yFQ",
  // 用 Announcements：只有仓库维护者能新建讨论，读者照常评论，天然挡掉批量刷帖
  category: "Announcements",
  categoryId: "",
};
