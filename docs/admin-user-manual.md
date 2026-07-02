# BotOps Control Plane 管理員操作手冊

## 使用者角色

本手冊以 support automation 管理人員的角度撰寫。管理人員負責監控多來源客服訊號、審查 bot 已送出回覆、檢視 retained trace、追蹤錯誤案例，並依據評測與發布門檻判定版本狀態。

## 操作前準備

1. 啟動本機產品：

```bash
npm run dev
```

2. 開啟：

```text
http://127.0.0.1:5173/
```

3. 建議先檢視 `Overview`，確認整體治理流程與品質門檻，再進入各功能頁操作。

## 管理員標準操作流程

### 1. Overview：檢視治理總覽

這一頁用來檢視整體 KPI、訊號來源分布，以及客服機器人治理流程的目前狀態。

操作：

1. 點擊左側 `Overview`。
2. 檢視 KPI：Overall Quality、Citation Support、Handoff Safety Recall、High-risk Auto-answer。
3. 檢視 Operating Model，確認流程涵蓋 signal intake、trace、knowledge、evaluation、error、handoff、release、audit。

管理員判斷重點：

- High-risk Auto-answer 應接近或等於 `0.00`。
- Handoff Safety Recall 應達到 `1.00`。

### 2. Signal Intake：篩選多來源客服訊號

這一頁彙整 Web/App Chat、X、LINE、Telegram、Discord、內部通報等來源的客服訊號。訓練完成的 bot 會即時回覆；管理員在此檢視已回覆互動與保留的處理紀錄。

操作：

1. 點擊 `Signal Intake`。
2. 使用來源 chip 篩選，例如 `Telegram` 或 `Internal Report`。
3. 在互動審查佇列點擊 `Inspect reply + trace`。

管理員判斷重點：

- 訊號是否有來源、地區、語言、產品、風險標籤。
- 是否能把公開社群、內部通報、客服對話合併成同一個問題群。
- 是否能快速定位需要稽核的已回覆 interaction。

### 3. Response Trace：審查 bot 回答與決策鏈

這一頁用來檢查 bot 已送出的回答、引用、檢索、驗證與人工交接等處理節點。

操作：

1. 從 Signal Intake 開啟 interaction record 後，系統會進入 `Response Trace`。
2. 審查 bot 已送出的回答是否符合 expected behavior。
3. 在 Trace Panel 檢查 Source Normalization、Metadata Retrieval、Verification Gate。
4. 點擊 citation button，確認引用 chunk 與回答內容一致。
5. 點擊 `Save trace as eval case`，將本次 interaction record 轉存至後續 replay / eval。

管理員判斷重點：

- 回答是否有引用政策來源。
- 高風險案例是否避免提供帳戶層級結論。
- trace 是否足以解釋 bot 為什麼這樣回答。

### 4. Knowledge Governance：確認可引用知識

這一頁管理 RAG 可使用的政策文件、chunks、KB snapshot、index status、retrieval config、有效期間、owner 與風險等級。

操作：

1. 點擊 `Knowledge`。
2. 檢視 RAG 管理摘要：Indexed Docs、Needs Re-index、Chunks、Retriever。
3. 檢視文件 lifecycle、index status、retrieval config。
4. 檢查 highlighted chunk 是否與剛才 citation 對應。

管理員判斷重點：

- 文件是否為 Published 且已 indexed。
- chunk 是否足夠具體，能支撐回答。
- 是否有 Needs re-index 的文件會影響 release confidence。

### 5. CS Bot KPI：審查客服營運指標

這一頁用來定期檢視 bot 對客服營運的影響，例如 auto-resolution、handoff、repeat contact、citation failure 與 SLA risk，並連回實際使用者案例群。

操作：

1. 點擊 `CS Bot KPI`。
2. 檢查上方 KPI cards，確認每個指標是否達標或進入 watch。
3. 在 Segment Drilldown 檢查不同來源與案例類型。
4. 根據 review focus 判斷下一步應改善 prompt、知識文件、handoff 或客服流程。

管理員判斷重點：

- Auto-resolution 是否提升但沒有犧牲高風險安全性。
- Handoff rate 是否落在合理區間。
- Repeat contact 是否指出回答不夠清楚。
- Citation failure 是否暴露知識庫缺口。

### 6. Evaluation：執行評測並匯出結果

這一頁用同一批 saved live interactions / eval cases 比較不同發布設定，避免只靠人工主觀判斷。

操作：

1. 點擊 `Evaluation`。
2. 點擊 `Run evaluation`。
3. 確認 Runner status 變成 `Completed`。
4. 點擊 `Export CSV` 開啟匯出預覽。
5. 確認欄位不包含客戶識別資訊、私人訊息或帳戶資料。
6. 點擊 `Download CSV` 下載 `botops-eval-summary.csv`。

管理員判斷重點：

- Proposed release 是否優於目前 release。
- Citation Support、Handoff Safety Recall 是否達標。
- High-risk Auto-answer 是否為 `0.00`。

### 7. Error Analysis：將失敗案例轉為修正任務

這一頁將低分 eval rows 轉換為 PM / Bot Ops / Knowledge Owner / Compliance 可處理的失敗案例。

操作：

1. 點擊 `Error Analysis`。
2. 查看失敗案例來源、failure label、目前狀態與觀察到的問題。
3. 以管理員身分調整狀態：`Open`、`In review` 或 `Fixed`。
4. 點擊 `View detail` 開啟失敗案例詳情，查看 low score dimension、trace diagnosis、modification 與 retest metric。

管理員判斷重點：

- 問題是 prompt、retrieval、knowledge、risk routing 還是 handoff。
- 是否有 owner 和 retest metric。

### 8. Ticket Center：管理客服工單隊列

這一頁追蹤 bot 已處理或已審查的客服工單，包含 queue、owner、priority、SLA、case summary 與 next action。

操作：

1. 點擊 `Ticket Center`。
2. 檢查高優先或已升級工單。
3. 檢查每張工單的 queue、owner、SLA 時間與狀態。
4. 閱讀 AI case summary 與 next action，確認人工團隊知道下一步。

管理員判斷重點：

- 高風險安全案例是否進入 `Security-L2`。
- 法遵或知識缺口是否被分派給正確 owner。
- SLA watch 數量是否需要升級處理。
- next action 是否具體且不要求 bot 做帳戶層級決策。

### 9. Handoff：檢查人工交接品質

這一頁檢查高風險案例的人工交接內容，確保人工隊列能接手處理。

操作：

1. 在 Intake 啟動 account takeover 類型 scenario。
2. 點擊 `Handoff`。
3. 檢查 queue、required fields、summary、risk warning。

管理員判斷重點：

- 是否有明確交接原因。
- 是否要求必要欄位。
- 是否禁止 bot 做不該做的帳戶操作或安全結論。

### 10. Release Center：執行發布決策

這一頁將 eval 結果轉換為 release gate，並對每個 bundle 做出可稽核的發布決策。

操作：

1. 點擊 `Release Center`。
2. 檢查每個 bundle 的狀態。
3. 若所有 gate 通過，可點擊 `Promote` 將 bundle 推進至 canary 或利害關係人審查。
4. 若仍有 blocked reasons，點擊 `Block release`，確認該版本不可進入 rollout。
5. 若需要法遵、PM 或 Support Ops 確認，點擊 `Request review`。

管理員判斷重點：

- Regression count 是否超標。
- High-risk auto-answer 是否為 0。
- Handoff safety recall 是否達到 1.00。
- 決策後是否出現 bundle 內的 decision banner。
- `Audit Log` 是否留下對應的 release decision event。

### 11. Audit Log：檢查操作稽核紀錄

這一頁確認重要管理動作皆已留存紀錄，包含 trace review、eval case saved、offline eval、CSV export 與 release decision。

操作：

1. 點擊 `Audit Log`。
2. 檢查最新事件是否出現在列表最上方。
3. 使用 event type chip 篩選 `CSV export`、`Release decision` 或其他事件。
4. 對照剛才操作是否都有紀錄。

管理員判斷重點：

- 是否能追溯操作者、操作對象、操作時間與影響範圍。
- 未來後端應將此處事件寫入正式 audit log。
- 篩選後是否仍能看到正確事件數與事件內容。

## 審查建議流程

1. `Overview`：確認產品定位為 bot management control plane，而非單一 chatbot UI。
2. `Signal Intake`：檢視多來源訊號與互動紀錄。
3. `Response Trace`：審查回覆、引用、trace 與 eval case 轉存。
4. `CS Bot KPI`：檢查客服營運指標與 user case segment。
5. `Evaluation`：執行 offline eval 並匯出 CSV。
6. `Error Analysis`：從失敗案例定位產品修正項目。
7. `Ticket Center`：檢查客服工單、SLA、owner 與 next action。
8. `Release Center`：依 release gate 執行 Promote / Block / Request review。
9. `Audit Log`：檢視治理與稽核軌跡。

## 目前限制

- 本機開發版本使用 local development data，不連接真實 channel、ticket system 或 LLM。
- localStorage 僅供本機流程驗證，不是正式資料儲存。
- CSV export 是前端產生，未來應由後端提供 signed export 或 report job。
- 後端 API、資料表與 eval runner job flow 請參考 `docs/backend-api-contract.md`。
