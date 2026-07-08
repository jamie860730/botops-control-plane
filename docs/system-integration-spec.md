# 系統整合規格（System Integration Spec）

版本：v1.0
日期：2026-07-08
狀態：規格定稿，待實作
讀者：實作 agent 與後端工程師。本文件是可直接認領的工作包（WP）規格，不是概念介紹。

關聯文件：
- `docs/backend-api-contract.md` — API 與資料表契約（本文件引用其 endpoint 與 storage notes，不重複定義）
- `docs/production-readiness-plan.md` — RBAC 矩陣、signed export 流程、敏感資料遮罩表
- `docs/prd.md` 第 11.5 章 — 後端分期（P0 seed → P1 持久化 → P2 live agent → P3 通路整合）
- `src/services/seedBackendAdapter.ts` — 現況唯一資料入口，所有整合的前端掛載點

---

## 1. 缺口總覽：哪些層還沒做

現況是 seed-mode 原型：UI 與治理流程完整，但所有資料來自 `src/data/packs/crypto.ts`，狀態存 localStorage。以下是完整產品需要、目前不存在的層：

| # | 層 | 現況 | 缺口 | 對應 WP |
| --- | --- | --- | --- | --- |
| L1 | 通路接入 | 訊號是 seed 資料 | 無任何 channel connector：Telegram/LINE/Discord/X/Web Chat/內部通報都沒接 | WP-3 |
| L2 | Bot runtime 接入 | 對話與 trace 是 seed | bot 沒有把真實回覆與九節點 trace 寫進平台的機制（無 SDK、無 ingestion API 實作） | WP-4 |
| L3 | 知識管線 | 文件與 chunk 是 seed；「排入索引」只改本地狀態 | 無 KB 來源同步、無 chunking/embedding/索引 job、無 snapshot 產製 | WP-5 |
| L4 | 資料持久層 | localStorage + seed | 無資料庫、無 migration、audit 非 append-only | WP-1 |
| L5 | 身份與權限 | 無登入，全站管理員視角 | 無 SSO、無 RBAC enforcement（角色矩陣已定義未實作）、API 的 actor 由 client 自報 | WP-2 |
| L6 | 品質管線 | eval run 是 1.7 秒的模擬；judge 校準是 seed 數字 | 無 eval worker、無真實 LLM-as-judge 呼叫、無校準抽樣回寫 | WP-6 |
| L7 | Gap mining 管線 | 簇是 seed 的 `duplicateClusterId` | 無 embedding 聚類、無 LLM 草稿生成、審核結果不會真的進 KB 管線 | WP-7 |
| L8 | 企業系統整合 | 工單是 seed；狀態改動只在本地 | 無 Zendesk/Salesforce/Jira adapter、無雙向同步 | WP-8 |
| L9 | 座席輔助事件流 | 建議紀錄是 seed | 無座席桌面事件 ingestion（adopted/edited/discarded 無真實來源） | WP-9 |
| L10 | 通知與 SLA 警報 | SLA 只有畫面標示 | 無監控 job、無 Slack/Email/IM 告警 | WP-10 |
| L11 | 匯出治理 | 前端產 CSV | 無 signed export job、無過期與角色範圍控制 | WP-11 |
| L12 | 部署維運 | 本機 Vite + node server | 無容器化、無環境變數契約、無觀測（logs/metrics/alerts） | WP-12 |

UI 層面已知未做（非本文件範圍，列出避免誤認遺漏）：Settings 模組、語言×地區品質對等矩陣、badcase before/after 對照、conversation trace 事件抽屜的深層診斷。

---

## 2. 目標架構

```text
┌─ 通路 ──────────────────────────────┐
│ Web/App Chat  Telegram  LINE        │
│ Discord  X  Internal Report         │
└──────┬──────────────────────────────┘
       │ webhook / event stream
┌──────▼──────────────────────────────┐      ┌────────────────────┐
│ Ingestion Gateway                   │      │ Bot Runtime（外部） │
│ 驗簽 → 去重 → PII 遮罩 → 正規化      │      │ trace SDK / webhook │
└──────┬──────────────────────────────┘      └─────────┬──────────┘
       │ SupportSignal                                 │ Message + TraceEvent
┌──────▼─────────────────────────────────────────────▼───────────┐
│ Core Services（backend-api-contract.md 定義的 API 面）          │
│ signals / scenarios / knowledge / eval / tickets / release /    │
│ audit / assist-events / gap-mining                              │
├─────────────────────────────────────────────────────────────────┤
│ PostgreSQL │ Vector Store │ Object Storage │ Job Queue │ Cache  │
└──────┬──────────────────────────────────────────────────────────┘
       │ HTTPS + OIDC session
┌──────▼──────────────────┐    ┌──────────────────────────────────┐
│ Control Plane UI（本 repo）│    │ Workers：eval / index / cluster / │
│ BackendAdapter 介面切換    │    │ sla-monitor / export             │
└─────────────────────────┘    └──────────────────────────────────┘
外部整合：Zendesk／Salesforce／Jira（WP-8）、Slack／Email（WP-10）
```

三個不可妥協的架構原則：

1. **Adapter 隔離**：UI 只依賴 `BackendAdapter` 介面（WP-0 抽取）。seed 與 live 用同一介面，前端零改動切換。任何 WP 不得讓元件直接 fetch。
2. **Stable ID 契約**：所有實體 ID 由後端產生且永不變更（格式見 §4.1）。trace/message/chunk 的關聯全靠 ID，UI 多輪互動不得互相覆蓋。
3. **PII 邊界在 ingestion 層**：raw payload 與 normalized 資料物理分離（不同表、不同存取權限）。核心服務之後的所有層只見遮罩後資料。遮罩規則以 `production-readiness-plan.md` 的 Sensitive Data Policy 表為準。

---

## 3. 工作包規格

每個 WP 含：目標、介面契約、現有掛載點、驗收標準。依賴圖見 §5。

### WP-0 BackendAdapter 介面抽取（所有 WP 的前置）

**目標**：把 `SeedBackendAdapter` 的公開方法抽成 `BackendAdapter` interface，新增 `HttpBackendAdapter` 實作，用環境變數切換。

**契約**：
- `src/services/backendAdapter.ts`：interface 定義，方法簽名與現有 `SeedBackendAdapter` 完全一致（`listSignals`、`getInteractionReview`、`listDocuments`、`listSupportTickets`、`listEvalResults`、`getFlowVersionDiff`、`listGapClusters`、`listAssistSuggestions`、`listJudgeCalibrations`、`listSopRecords` 等，以現檔為準逐一列入）。
- `HttpBackendAdapter`：每個方法對應 `backend-api-contract.md` 的 endpoint；contract 缺的 endpoint（gap clusters、assist suggestions、SOP、judge calibrations、flow diffs）在本 WP 一併補進 contract 文件，路徑規則 `GET /api/{resource}`，回傳 shape 即 `src/types.ts` 對應 interface 的 JSON。
- 切換：`VITE_BACKEND_MODE=seed|live` + `VITE_API_BASE_URL`。預設 seed，CI 與 demo 不受影響。
- 寫入操作（目前散在 App.tsx 的 localStorage 邏輯：工單狀態、索引狀態、審核結果、audit event）在 interface 上補對應的 `update*/append*` 方法；seed 實作沿用 localStorage，live 實作走 API。

**驗收**：seed 模式下 65 unit tests + 15 e2e 全綠不動；`HttpBackendAdapter` 對 `server/server.mjs` 跑通 `signals/scenarios/review/eval` 四條路徑（本地 API 已實作這些）。

### WP-1 資料持久層

**目標**：PostgreSQL schema + migration，落地 `backend-api-contract.md` Storage Notes 的 15 張表，外加 v2.0 新實體五張：`gap_clusters`、`faq_candidates`、`sop_records`（steps 用 JSONB）、`assist_suggestions`、`judge_calibrations`。

**契約**：
- Migration 工具：node-pg-migrate 或 Prisma Migrate（選定後寫入 README，之後不換）。
- `audit_events` 為 append-only：資料庫層 `REVOKE UPDATE, DELETE`，應用層無對應 API；可選 hash chain（每筆存前筆 hash）供竄改偵測。
- 所有表帶 `created_at`／`updated_at`（audit 除外，只有 created_at）；軟刪除一律不用，知識文件生命週期走 `status` 欄位。
- Vector store：pgvector extension 起步（chunk embedding 存 `knowledge_chunks.embedding vector(1536)`），量級超過 500 萬 chunk 再評估外部向量庫。

**驗收**：migration 可重複執行（up/down）；`server/server.mjs` 改為可選讀 DB（`API_STORAGE=memory|postgres`）；seed 資料有一支 `scripts/seed-db.mjs` 可灌入。

### WP-2 身份與權限（AuthN/AuthZ）

**目標**：OIDC SSO 登入 + 四角色 RBAC enforcement。

**契約**：
- OIDC Authorization Code + PKCE，session 用 httpOnly cookie；IdP 可配置（Google Workspace／Azure AD／Okta 皆為標準 OIDC，不寫死廠牌）。
- 角色矩陣以 `production-readiness-plan.md` 的 RBAC Model 表為準：Viewer／Operator／PM Admin／Compliance。角色來源：IdP group claim 映射，映射表放環境設定。
- API middleware：每個寫入 endpoint 檢查角色（例：`POST /api/release/bundles/{id}/decisions` 需 PM Admin，高風險 bundle 需 Compliance）；`actor` 欄位一律從 session 取，**拒絕 client 自報 actor**（現 contract 的 seed-mode 例外條款到此失效）。
- 前端：`BackendAdapter` 加 `getCurrentUser()`；UI 依角色隱藏不可用操作（隱藏是 UX，enforcement 在 API）。

**驗收**：未登入請求 401；Viewer 呼叫寫入 endpoint 403 且不產生副作用；audit event 的 actor 與 session 一致。

### WP-3 通路接入層（Channel Connectors）

**目標**：六個通路的 inbound signal 接入，統一經過 Ingestion Gateway 正規化為 `SupportSignal`。

**共通 pipeline**（每個 connector 都走）：
```text
raw payload → 驗簽 → 去重 → PII 遮罩 → 正規化映射 → POST /api/signals → 聚類標記
```

**共通正規化映射表**（目標欄位 = `src/types.ts` 的 `SupportSignal`）：

| 目標欄位 | 規則 |
| --- | --- |
| `id` | `sig_{channel縮寫}_{ulid}`，gateway 產生 |
| `sourceChannel` | connector 固定值 |
| `reporterType` | 依來源推斷：官方 chat=`customer`、社群管理員名單=`community_moderator`、內部表單=`internal_ops` |
| `rawText` | 遮罩後全文；raw payload 另存 `raw_payloads` 表（存取權限僅 ingestion 服務） |
| `sourceTrust` | 規則表：內部=High、官方 chat=High、已驗證 moderator=Medium、公開社群貼文=Low |
| `duplicateClusterId` | 聚類 worker 非同步回填（見下） |
| `region`/`language` | 通路 metadata（LINE 地區、Telegram language_code）優先，缺失時語言偵測 fallback |
| `priority` | 風險關鍵字規則 + 分類器，High 立即觸發 WP-10 告警 |

**Per-connector 規格**：

| 通路 | 接入方式 | 驗證 | 去重鍵 | 備註 |
| --- | --- | --- | --- | --- |
| Web/App Chat | bot runtime 直接以服務憑證呼叫 ingestion API | mTLS 或 service token | `message_id` | 與 WP-4 同源，不經公網 webhook |
| Telegram | Bot API webhook | `X-Telegram-Bot-Api-Secret-Token` 比對 | `update_id` | 需處理 group 與 private chat 兩型；media 只存參照不下載 |
| LINE | Messaging API webhook | `X-Line-Signature` HMAC-SHA256 驗簽 | `webhookEventId` | redelivery 旗標要冪等處理 |
| Discord | Gateway bot（指定 support channel）或 interaction webhook | Ed25519 簽章 | `message id (snowflake)` | 只訂閱設定過的 channel 清單，不做全 server 掃描 |
| X | Filtered stream（規則：@官方帳號 + 客訴關鍵字）；降級方案 mentions timeline polling | OAuth2 app token | `tweet id` | rate limit 429 退避（見 §4.3）；只取公開貼文 |
| Internal Report | 內部表單 / Slack workflow → gateway API | 內網 service token | 表單 submission id | reporterType 固定 `internal_ops`，trust=High |

**聚類（duplicate cluster）**：獨立 worker，對新訊號取 embedding，與近 72 小時訊號做相似度（cosine > 0.85）+ 同 `product` 才入同簇；簇 ID 格式 `dup_{topic}_{yyyymmdd}`。同簇量體超過閾值（預設 10/小時）升級 incident 候選並觸發告警。此欄位同時是 Gap mining（WP-7）的輸入。

**驗收**：每個 connector 有 replay 測試（錄製的 raw payload fixture → 斷言正規化輸出）；重送同一 payload 不產生第二筆 signal；PII fixture（含電話、email、帳號 ID）進入後 `rawText` 已遮罩。

### WP-4 Bot Runtime Trace 接入

**目標**：讓外部 bot runtime 把已送出的回覆與九節點 trace 寫進平台，供 Conversations 審查。

**契約**：
- 寫入 API（補進 contract）：
  - `POST /api/ingest/conversations`：`{ scenarioId?, messages: ConversationMessage[], idempotencyKey }`
  - `POST /api/ingest/trace-events`：`{ traceId, scenarioId, events: TraceEvent[], idempotencyKey }`
- Trace SDK 慣例（提供 TypeScript/Python 薄封裝，本質是 HTTP）：bot flow 每個節點結束時 emit 一筆，`eventType` 限定九節點 enum（`source_normalization | intent | risk | rewrite | retrieval | generation | citation | verification | handoff`），`status` 限定 `pass | watch | blocked`。與 OpenTelemetry 並存的做法：SDK 內部可同時發 OTel span（span name = nodeName、attributes 帶 eventType/status），平台 ingestion 只認自己的 API，不解析 OTel。
- 冪等：`idempotencyKey = {traceId}:{seq}`，重送覆蓋而非新增。
- 引用契約：`generation` 節點產生的 message 必須帶 `citationIds`，且每個 id 必須存在於當前 KB snapshot——ingestion 驗證失敗時仍收下但標 `status=watch` 並寫 audit（引用完整性是治理指標，不是丟棄理由）。
- Scenario 歸併：ingestion 依 signal 的 `duplicateClusterId` 或 bot session id 掛到既有 scenario，找不到就建新 scenario。

**驗收**：模擬 bot 以 SDK 送一輪完整九節點 trace 後，Conversations 審查層可完整呈現（訊息、trace 時間軸、引用高亮）；重送同 trace 不產生重複節點。

### WP-5 知識管線

**目標**：KB 從「seed 靜態檔」變成「有來源、有版本、可重建索引」的管線。

**契約**：
- 來源同步 adapter（擇一起步，介面統一）：Confluence space／Zendesk Guide／git repo 的 markdown。介面：`syncSource(sourceConfig) → KnowledgeDocument[]`（不含 chunk）。
- Chunking job：文件 → chunk（預設 500 token、10% overlap，政策文件依 heading 切）；每 chunk 產 embedding 入 vector store；`citationAllowed` 依文件 `riskClass` 與人工標記決定，預設 Published 才允許。
- Snapshot：`kb_{yyyy_mm}_{seq}` 不可變快照 = 一組 chunk id 集合；eval run 與 release bundle 引用 snapshot id（現 UI 已顯示此欄位）。發布新文件不影響既有 snapshot。
- Re-index job：UI「排入重建索引」（現只改本地狀態）改為 `POST /api/knowledge/documents/{id}/reindex` → queue → worker 完成後更新 `indexStatus=Indexed` 與 `lastIndexedAt`，UI 輪詢或 SSE 更新。狀態機：`Needs re-index → Index queued → Indexed | Index failed`（`Index failed` 為新增值，UI 需補顯示）。
- 過期治理：`effectiveTo` 過期的文件由 nightly job 自動轉 `Archived` 並從 active snapshot 排除，寫 audit。

**驗收**：改一份來源文件 → 同步 → 重建索引 → 新 snapshot 中該 chunk 內容更新且舊 snapshot 不變；過期文件不再出現在新回覆的引用中。

### WP-6 Eval Worker 與 LLM-as-Judge

**目標**：把「啟動評測」從 1.7 秒模擬變成真實 async job。

**契約**：
- Job flow 依 `backend-api-contract.md` 的 Eval Runner Job Flow 八步驟，不重複描述。補充實作規格：
- Queue：BullMQ（Redis）或雲端等價物；一個 run = 一個 parent job，每個 eval case 一個 child job，並發上限可配置（預設 8，尊重 LLM rate limit）。
- Replay 引擎：用 run 的 `versionConfig`（flow/prompt/kbSnapshot/retrievalConfig）呼叫 bot runtime 的 replay endpoint（WP-4 的反向：平台呼叫 bot），輸入 eval case 的 `input`，取回 messages + trace。
- Judge：LLM 呼叫，prompt 版本化（`judgeVersion` 即 prompt 版本），輸出 `DimensionScores` 七維 + `failureLabel`，JSON schema 強制。judge prompt 草稿在 `docs/prd.md` §8.7。
- 校準迴路：每個 run 抽樣 10%（上限 20 件）進人工複核佇列；人工分數與 judge 分數的一致率寫回 `judge_calibrations`，低於 threshold（預設 0.85）時該 judge 版本的後續 run 自動標「待人工複核」（UI 已實作此標記，吃真資料即可）。
- Gate 計算：run 完成時算 `EvaluationSummary` 與 regression（對照 baseline run），寫回 `release_bundles.regression_count`。

**驗收**：一個 40 case 的 run 端到端完成並在 UI 呈現七維分數；判失敗的 case 一鍵轉 badcase；kill worker 中途重啟後 run 可續跑（job 冪等）。

### WP-7 Gap Mining 管線

**目標**：把缺口挖掘從 seed 展示變成真實「未解決對話 → FAQ 候選」飛輪。

**契約**：
- 輸入：近 7 天 `handoffPerformed=true` 或 `repeat_contact` 的對話 + 低信心回覆（trace `verification` 節點 status=watch/blocked）。
- 聚類：與 WP-3 共用 embedding 基建；HDBSCAN 或近鄰圖聚類，最小簇 5 件；簇統計（volume、週趨勢、關聯 KB 有無）寫 `gap_clusters`。
- 草稿生成：簇樣本 + 現有 KB 相關 chunk → LLM 起草 question/answer/citations，寫 `faq_candidates`（status=Pending review）。樣本不足（<5）只建簇不產草稿（UI 已有「觀察中」狀態）。
- 審核 API：`POST /api/gap-clusters/{id}/candidates/{cid}/review`，body `{ decision: adopted|returned|not_automatable, note }`；adopted 時自動建 Draft `knowledge_document`（進 WP-5 生命週期，不直接 Published）。
- 成效追蹤：adopted 候選入庫並發布後，nightly job 比對該簇 deflection before/after，寫回簇紀錄（UI 已有對照顯示）。

**驗收**：灌入 100 筆模擬未解決對話 → 產生 ≥2 個簇與草稿 → 審核採納 → 知識清冊出現 Draft 文件 → 發布後 deflection 欄位開始累積。

### WP-8 Ticket／CRM 整合

**目標**：bot 建單與工單狀態與企業 ticket 系統雙向同步。

**契約**：
- Adapter 介面：`createTicket(handoffPackage) → externalId`、`updateStatus(externalId, status)`、`onExternalUpdate(webhook) → SupportTicket patch`。首發 adapter 選 Zendesk（API 成熟、webhook 完整），Salesforce Service Cloud / Jira Service Management 依同介面後補。
- 欄位映射（平台 → Zendesk 示例）：`queue → group`、`priority → priority`、`caseSummary → 首則 internal note`、`sourceSignalIds + traceScenarioId → custom fields`（供 CS 回查 trace）。
- 方向規則：**建單只有平台 → 外部**（bot 產生的 handoff）；**狀態雙向**——外部系統是狀態的 source of truth，平台的行內編輯改為呼叫 adapter，失敗時回滾 UI 並提示。webhook 回流用 `external_updated_at` 判新舊，衝突 last-write-wins + 兩邊都寫 audit。
- Handoff package 完整性：`requiredFields` 缺漏時不建單，退回 handoff 佇列並標記（UI 的「交接品質標記」吃此結果）。

**驗收**：平台建單在 Zendesk sandbox 出現且欄位映射正確；Zendesk 側改狀態 → 平台 5 秒內同步；斷線期間的外部變更在重連後補齊（webhook redelivery 或輪詢對帳）。

### WP-9 座席輔助事件流

**目標**：Agent Assist 指標吃真實座席行為。

**契約**：
- 事件 API：`POST /api/ingest/assist-events`，事件型別 `suggestion_shown | suggestion_adopted | suggestion_edited | suggestion_discarded | summary_shown | summary_rewritten`，帶 `caseRef`、`suggestionId`、`agentId`（假名化）、最終文本。
- 來源：座席桌面（Zendesk app / 自建 console）埋點；若座席工具是 Zendesk，用 Zendesk App framework 的事件橋接。
- 衍生計算在平台側：edit distance 分桶（Levenshtein / 長度正規化，none<5%、light<30%、heavy≥30%）、handle time 取自 ticket 系統的處理時長欄位。
- 隱私：`agentId` 假名化（HMAC），不進 UI；平台只呈現 queue/intent 聚合。

**驗收**：模擬事件流打入後，四張指標卡與明細表數字正確；同一 `suggestionId` 的重複事件冪等。

### WP-10 通知與 SLA 警報

**目標**：SLA 風險與 incident 爆量主動告警，不再依賴 PM 盯儀表板。

**契約**：
- SLA monitor：每分鐘掃 `support_tickets` 中 `sla_due_at - now < 30min` 且未 Resolved 的單 → 告警；已告警的單不重複（告警紀錄表去重）。
- Incident 爆量：WP-3 聚類 worker 的閾值事件直接進告警通道。
- 通道 adapter：Slack incoming webhook 起步（訊息含工單/簇連結，deep link 到平台對應 drawer——URL routing 目前是 SPA state，需補 query param 路由 `?view=tickets&ticket=...`，此為本 WP 的前端子任務）；Email/Telegram 依同介面後補。

**驗收**：造一張 25 分鐘後到期的單 → Slack 收到一次且僅一次告警，點連結直達該工單 drawer。

### WP-11 Signed Export

**目標**：CSV 匯出從前端 Blob 改為後端簽名任務。流程依 `production-readiness-plan.md` 的 Signed Export Jobs 六步驟。

**補充規格**：簽名 URL 有效期 15 分鐘；export job 記錄 actor/role/filters/row_count；欄位白名單在後端硬編碼（run-level 指標，見現有 CSV 預覽欄位），任何新欄位需改 code 過 review，不做動態欄位選擇。

**驗收**：Viewer 角色無法建 export job；下載連結過期後 403；audit 有 created + downloaded 兩筆。

### WP-12 部署與觀測

**目標**：可部署、可觀測的最小生產形態。

**契約**：
- 容器：UI（靜態檔 + nginx）、API、workers 三個 image；docker-compose 供自架，K8s manifest 後補。
- 環境變數契約（單一 `docs/env-reference.md` 維護）：DB/Redis/vector 連線、OIDC 參數、各通路 secret、LLM API key——全部走 secret manager 注入，**repo 內永遠不出現實值**。
- 觀測：結構化 log（pino）、RED metrics（Prometheus 格式）、ingestion 與 worker 的 dead letter queue 有告警。
- 健康檢查：`/api/health` 擴充為依賴檢查（DB/queue/vector 可達性）。

**驗收**：`docker compose up` 起全套並通過 e2e；殺掉 worker 容器不掉資料（queue 補跑）。

---

## 4. 通用契約（所有 WP 遵守）

### 4.1 ID 與時間
- ID 格式：`{entity前綴}_{語意段}_{ulid|序號}`，由後端產生，永不重用；前綴表沿用 `backend-api-contract.md` Core Entities。
- 時間一律 UTC ISO-8601（`2026-07-08T02:00:00.000Z`），顯示時區是 UI 的事。

### 4.2 冪等與去重
- 所有 ingestion API 必收 `idempotencyKey`，重送回 200 + 原結果，不產生新資料。
- Webhook handler 先寫 `webhook_receipts`（key = 通路去重鍵）再處理，重複 receipt 直接 ack。

### 4.3 重試與退避
- 平台呼叫外部（LLM、CRM、通路 API）：指數退避 1s/4s/16s，3 次後入 dead letter queue 並告警；429 尊重 `Retry-After`。
- 外部呼叫平台：回 5xx 讓對方重送（配合冪等），永不因暫時性錯誤回 2xx。

### 4.4 錯誤格式
```json
{ "error": { "code": "VALIDATION_FAILED", "message": "citationIds[0] not in active snapshot", "requestId": "req_..." } }
```

### 4.5 PII 分級
| 級別 | 例 | 處理 |
| --- | --- | --- |
| P0 禁入 | 帳號 ID、交易 ID、KYC 文件、憑證 | ingestion 層丟棄或 hash，任何表不落原值 |
| P1 遮罩 | email、電話、姓名 | 正規化時以 `[email]`/`[phone]` 取代，原文只在 `raw_payloads` |
| P2 可存 | 對話語意內容、地區、語言 | 正常入庫 |

### 4.6 測試基線
每個 WP 交付含：fixture replay 測試、冪等測試、失敗路徑測試（外部 5xx／驗簽失敗／schema 不符）。合入前 `npm run test`、`npm run build`、`npm run test:e2e` 必須全綠——seed 模式是永久保留的展示與測試形態，任何 WP 不得破壞。

---

## 5. 實作順序與依賴

```text
WP-0 Adapter 抽取
 └─ WP-1 持久層 ── WP-2 AuthN/Z
      ├─ WP-3 通路接入 ──┐
      ├─ WP-4 Trace 接入 ─┼─ WP-7 Gap mining（需 3+4 的資料與 5 的 KB）
      ├─ WP-5 知識管線 ──┘
      ├─ WP-6 Eval worker（需 4 replay + 5 snapshot）
      ├─ WP-8 Ticket/CRM（需 4 的 handoff package）
      ├─ WP-9 Assist 事件（需 8 的 handle time 才有時長差）
      ├─ WP-10 告警（需 3 聚類 + 8 工單）
      └─ WP-11 Export ── WP-12 部署（最後收斂）
```

建議批次：**批次一** WP-0/1/2（平台變成真服務）→ **批次二** WP-4/5/6（品質閉環吃真資料，面試與內部價值最高）→ **批次三** WP-3/8（對外整合）→ **批次四** WP-7/9/10/11/12。

---

## 6. 給實作 agent 的認領守則

1. 認領一個 WP 前先讀：本文件該節、`backend-api-contract.md` 對應段、`src/types.ts` 對應實體、`src/services/seedBackendAdapter.ts` 對應方法。
2. Contract 有缺的 endpoint／欄位，先改 `backend-api-contract.md` 再寫 code——文件是契約源頭。
3. 不改 UI 行為語意：live 模式下 UI 的既有互動（drawer、審核、決策、audit）必須與 seed 模式一致，差異只在資料來源。
4. 交付物：code + 測試 + contract 文件更新 + 本文件該 WP 的狀態標記（規格定稿 → 已實作）。
5. 秘密管理：任何 token/key 走環境變數，發現硬編碼立即修正並回報。
