# Tasks · submetrics Deep-Data Moat

> Spec Kit 第 3 步（Tasks）。原子化、每任务有 DoD。按顺序执行，逐步打勾。

## T1 · 写 MRR/ARR 策展数据集 `mrr.json`
- 目标：覆盖 MRR 定义/归一化/运动分解、ARR 定义/估值、ARPU/ARPA/ACV/CMRR、常见错误、负净流失、增长基准，共 12 条。
- 文件：`submetrics/submetrics-agent/lib/governance-data/mrr.json`
- DoD：每条含 `id`/`ref`(权威 URL)/`title`/`body`/`tags`/`verify:true`；顶层 `version:'mrr@2026-07-24'`。

## T2 · 写 Churn 策展数据集 `churn.json`
- 目标：Logo/Revenue churn、月度/分阶段基准、净 vs 毛、首 90 天、非自愿流失、队列、红旗、Quick Ratio，共 12 条。
- 文件：`submetrics/submetrics-agent/lib/governance-data/churn.json`
- DoD：每条含 `id`/`ref`(OpenView/ChartMogul 等权威 URL)/`title`/`body`/`tags`/`verify:true`。

## T3 · 写 NDR/NRR 策展数据集 `ndr.json`
- 目标：NRR/NDR 定义与同一性、NRR 基准、ChartMogul 分位、GRR 定义与基准、聚合基准、leaky bucket、负净流失、公式，共 12 条。
- 文件：`submetrics/submetrics-agent/lib/governance-data/ndr.json`
- DoD：每条含 `id`/`ref`(ChartMogul/OpenView/Stripe/KeyBanc/SaaS Capital)/`title`/`body`/`tags`/`verify:true`。

## T4 · 写效率/估值基准 `benchmarks.json`
- 目标：Rule of 40 / Rule of X、LTV 定义与毛利润调整、LTV:CAC、CAC 定义、CAC 回款、Magic Number、SaaS Capital Index、毛利率、Burn Multiple，共 11 条。
- 文件：`submetrics/submetrics-agent/lib/governance-data/benchmarks.json`
- DoD：每条含 `id`/`ref`(SaaS Capital/Bessemer/KeyBanc 等)/`title`/`body`/`tags`/`verify:true`。

## T5 · 写检索索引 `index.ts`
- 目标：读 4 个 JSON → 扁平化 GovEntry；`retrieve()` 语义分词评分（ref 加权）；`loadGovernanceIndex()` / `invalidateGovernanceCache()` / `GOVERNANCE_SOURCES`。
- 文件：`submetrics/submetrics-agent/lib/governance-data/index.ts`
- DoD：`retrieve('normalize annual contract value mrr')` 命中 `mrr-normalize`；合并 `getAcceptedContributed()`。

## T6 · 写诚实护栏 `guardrails.ts`
- 目标：G1 引用接地 / G2 禁绝对保证 / G3 基准不承诺 / G4 英文 B2B 定位 / G5 非认证估值；`applyGuardrails()` 返回 `{ok,violations,note,needsHumanReview}`。
- 文件：`submetrics/submetrics-agent/lib/guardrails.ts`
- DoD：对含 "guaranteed to hit 120% NDR" / "certify your exact valuation" 的文本返回 `ok:false` 且含对应 code；无引用返回 `G1_NO_CITATION`。

## T7 · 写编排核 `agent-core.ts`
- 目标：`runAgent()` 5 步；`chooseScope()`；`buildContext()`；STEP5 后非致命飞轮捕获；红线条 `enforceRedline()`。
- 文件：`submetrics/submetrics-agent/lib/agent-core.ts`
- DoD：导出 `runAgent` / `AGENT_STEP_ORDER` / `AGENT_SOURCES`；复用 NIM endpoint 与 `PRODUCT.systemPrompt`。

## T8 · 写数据飞轮 `data-flywheel.ts` + `flywheel-demo.mjs`
- 目标：`captureRunSignals()`（benchmark/uncertainty/citation_gap/feedback 启发式）+ `writeback()`（append-only，`verify:true`）+ `setStatus()` 状态机 + `getAcceptedContributed()`。
- 文件：`submetrics/submetrics-agent/lib/data-flywheel.ts` + `submetrics/submetrics-agent/flywheel-demo.mjs`
- DoD：demo 幂等跑通「捕获→回写→accept→再索引→检索命中」；生产存储回归空。

## T9 · 接入 `pages/api/tool.ts`
- 目标：quota 检查后插入 `if (body.agent && !useMock)` 分支，动态 import agent-core，返回 Agent 结果；失败→502。
- 文件：`submetrics/pages/api/tool.ts`（surgical）
- DoD：`agent=1` 返回 `agent:true`/`citations`/`redlineNote`/`source:'Model-assisted'`；P0 矩阵与无 `agent` 路径完全不变。

## T10 · 离线确定性自测 `__selftest.ts`
- 目标：`retrieve` 命中断言 + `applyGuardrails` 拒绝断言 + 飞轮「accept 后索引命中」断言。
- 文件：`submetrics/submetrics-agent/lib/__selftest.ts`
- DoD：`tsx` 跑全绿（先验逻辑，先于 build/deploy）。

## T11 · 验证 Verify
- 目标：`node flywheel-demo.mjs` 通过 → `tsx __selftest.ts` 全绿 → `next build` exit 0。
- DoD：三项均 PASS；P0 抽核（503/429/502/200+source）经静态核验确认。

## T12 · 文档 + 来源
- 目标：新建 `lib/rules/SOURCES.md` 追加 SaaS 指标权威来源；Spec Kit 文档落盘。
- DoD：SOURCES.md 含新 ref；`.specify/.../submetrics-deep-moat/` 三件套完整。
