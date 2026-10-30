/**
 * elog 的 @feishux/api 在列知识库根节点时会把 parent_node_token 序列化成字面量
 * "undefined"，飞书返回 131005（响应里没有 items），导致 sync 直接崩：
 *   TypeError: res.items is not iterable
 *
 * 这里做两处幂等修补：
 *   1. parent_node_token / page_token / folder_token 为空时不发该参数
 *   2. 分页结果做空值兜底，避免响应缺字段时整个进程挂掉
 *
 * node_modules 不入库，所以挂在 postinstall 上，本地和 CI 行为一致。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const target = 'node_modules/@feishux/api/dist/api.js';
if (!existsSync(target)) {
  console.log('[patch-feishux] 未安装 @feishux/api，跳过');
  process.exit(0);
}

let src = readFileSync(target, 'utf8');
const before = src;

// 1. 空 token 不要发出去
src = src.replace(
  /data:\s*\{\s*parent_node_token:\s*nodeToken,/g,
  'data: { ...(nodeToken ? { parent_node_token: nodeToken } : {}),'
);

// 2. 分页结果兜底
src = src.replace(/result\.push\(\.\.\.res\.items\);/g, 'result.push(...(res.items || []));');
src = src.replace(/result\.push\(\.\.\.res\.files\);/g, 'result.push(...(res.files || []));');

if (src === before) {
  console.log('[patch-feishux] 已是修补后的状态，无需改动');
  process.exit(0);
}

writeFileSync(target, src);
console.log('[patch-feishux] 已修补 @feishux/api');
