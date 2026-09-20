# Spec · submetrics Deep-Data Moat (Vertical SaaS-Metrics Agent)

> Spec Kit 第 1 步（Specify · WHAT）。来源：薄产品富集组深度优化任务（用户指令 2026-07-24），
> 推广 R11 垂直 AI 治理 Agent 的「深数据 + 深合规 + 多步引用」护城河范式到 data-analytics 集群 submetrics。

## 背景 / 意图（一句话）
把 submetrics 从「确定性 MRR/ARPU/LTV 计算器」升级为「垂直 SaaS 指标 Agent」：
在已有规则层之上，叠加一个**专有、版本化、可引用的 SaaS 指标数据集**（MRR/ARR、Churn、NRR/NDR/GRR、效率与估值基准）
+ **5 步编排**（retrieve → crossref → assess → cite → report）+ **诚实护栏（G1–G5）** + **数据飞轮（动态富集回写）**，
使其成为通用 AI/电子表格工具够不到的「深指标护城河」。

## 功能需求（用户故事式）
1. 作为 SaaS-Metrics Agent 用户，我在 `/api/tool` 传 `agent=1`，能得到一份**基于权威指标定义与基准**的 SaaS 指标解读，
   每条结论都带 `[ref]` 引用（ChartMogul / OpenView / SaaS Capital / Bessemer / KeyBanc 官方/权威来源）。
2. 作为用户，我得到的解读必须明确标注「**决策辅助，非财务/估值意见、非认证估值**」，永不声称"保证你达到 120% NDR"或"这是你的精确估值"。
3. 作为用户，Agent 能从专有数据集中**检索适用定义**（按查询语义匹配），并跨指标交叉参考基准（MRR↔Churn↔NDR↔效率/估值）。
4. 作为用户，每次运行产出的不确定性/引用缺口/基准信号会被**写入贡献库（pending_review）**，
   经人工 accept 后才进入可检索索引——绝不自动污染策展集。
5. 作为维护者，数据集是**版本化、带 `verify` 标记、每条含权威 `ref`** 的 JSON，可被离线自测与冷载入索引。

## 非功能需求
- 复用既有 P0 矩阵（`pages/api/tool.ts` 已有：无密钥→503 / 配额→429 / 上游失败→502 / 成功→200 `source:'Model-assisted'`），
  Agent 分支不得破坏既有管线。
- Agent 分支与既有「经典模型调用」互斥（`agent=1` 且非 `useMock` 时走 Agent；否则走原管线）。
- 数据集检索为纯本地确定性逻辑（不依赖 LLM），可用 `tsx` 离线自测。
- 类型安全：不引入 `any`，tsconfig 不放松；`next build` 须 PASS。

## 明确边界（不做什么）
- **不**修改/替换既有 `lib/product.ts` 的 `mock` 计算器（确定性规则保持不变）。
- **不**改变定价、Waffo 上架、Vercel 部署配置（本 spec 仅做 Agent 能力层）。
- **不**引入新的第三方依赖（仅用 Node 内置 `fs`/`path` + 既有 fetch）。
- **不**把贡献库条目自动合并进策展集（红线条：仅人工 accept 后可见）。
- **不**在 Agent 输出中声称"certified valuation / guarantee"（G5 护栏拒绝）。

## 验收标准（可测的 Done 定义）
1. `submetrics/submetrics-agent/lib/governance-data/` 含 `mrr.json` + `churn.json` + `ndr.json` + `benchmarks.json` + `index.ts`，
   每个策展条目带 `ref`（权威 URL）与 `verify:true`。
2. `index.ts` 导出 `retrieve()` / `loadGovernanceIndex()` / `invalidateGovernanceCache()`，离线单测可命中已知条目
   （如查询 "normalize annual contract value mrr" → 命中 `mrr-normalize`；查询 "churn 5% critical" → 命中 `churn-red-flag`）。
3. `agent-core.ts` 导出 `runAgent()`，5 步齐全；`guardrails.ts` 导出 `applyGuardrails()` 覆盖 G1–G5。
4. `data-flywheel.ts` 导出 `captureRunSignals()` / `writeback()` / `setStatus()` / `getAcceptedContributed()`，
   `flywheel-demo.mjs` 可幂等跑通「运行→捕获→回写→accept→再索引→检索命中」。
5. `pages/api/tool.ts` 新增 `if (body.agent && !useMock)` 分支，动态 import `submetrics-agent/lib/agent-core`，
   返回含 `agent:true` / `citations` / `redlineNote` / `source:'Model-assisted'` 的 200；Agent 失败走 502（不污染 P0 矩阵）。
6. `tsx` 确定性自测（`submetrics-agent/lib/__selftest.ts`）全绿；`next build` exit 0。
7. P0 抽核：无密钥→503、配额→429、上游失败→502、成功 200 带 `source:'Model-assisted'`（既有行为不变）。
