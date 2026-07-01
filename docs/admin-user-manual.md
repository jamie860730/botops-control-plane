# BotOps Control Plane 管理員操作手冊

## 使用者角色

本手冊以 support automation 管理人員的角度撰寫。你負責監控多來源客服訊號、抽查 bot 已即時送出的回覆、檢查 retained trace、追蹤錯誤案例、決定是否允許新版 bot flow 進入 release。

## Demo 前準備

1. 啟動本機產品：

```bash
npm run dev
```

2. 開啟：

```text
http://127.0.0.1:5173/
```

3. 建議從 `Overview` 開始講，先建立整體 product loop，再進入實際操作。

## 管理員標準操作流程

### 1. Overview：理解產品管理閉環

用途：查看整體 KPI、訊號來源分布，以及每個頁面在 bot management loop 裡的角色。

操作：

1. 點擊左側 `Overview`。
2. 先看 KPI：Overall Quality、Citation Support、Handoff Safety Recall、High-risk Auto-answer。
3. 再看 Product Map，確認流程涵蓋 intake、trace、knowledge、eval、error、handoff、release、audit。

管理員判斷重點：

- High-risk Auto-answer 應接近或等於 `0.00`。
- Handoff Safety Recall 應達到 `1.00`。

### 2. Intake：篩選多來源客服訊號

用途：監控 Web/App Chat、X、LINE、Telegram、Discord、內部通報等來源的真實訊號。訓練好的 bot 會即時回覆；此頁讓管理員打開已回覆 interaction 並檢查 trace。

操作：

1. 點擊 `Intake`。
2. 使用來源 chip 篩選，例如 `Telegram` 或 `Internal Report`。
3. 在 Scenario Launcher 點擊 `Review live reply + trace`。

管理員判斷重點：

- 訊號是否有來源、地區、語言、產品、風險標籤。
- 是否能把公開社群、內部通報、客服對話合併成同一個問題群。
- 是否能快速找到需要抽查的已回覆 interaction。

### 3. Chat + Trace：檢查 bot 回答與決策鏈

用途：檢查 bot 已即時送出的回答、引用、retrieval、verification、handoff 等 retained trace 節點。

操作：

1. 從 Intake 打開 live interaction 後，系統會進入 `Chat + Trace`。
2. 閱讀 bot 已送出的回答是否符合 expected behavior。
3. 在 Trace Panel 檢查 Source Normalization、Metadata Retrieval、Verification Gate。
4. 點擊 citation button，確認引用 chunk 與回答內容一致。
5. 點擊 `Save trace as eval case`，把這次 live interaction 加入後續 replay / eval。

管理員判斷重點：

- 回答是否有引用政策來源。
- 高風險案例是否避免提供帳戶層級結論。
- trace 是否足以解釋 bot 為什麼這樣回答。

### 4. Knowledge：確認可引用知識

用途：管理 bot RAG 可使用的政策文件、chunks、KB snapshot、index status、retrieval config、有效期間、owner、風險等級。

操作：

1. 點擊 `Knowledge`。
2. 查看 RAG 管理摘要：Indexed Docs、Needs Re-index、Chunks、Retriever。
3. 查看文件 lifecycle、index status、retrieval config。
4. 檢查 highlighted chunk 是否與剛才 citation 對應。

管理員判斷重點：

- 文件是否為 Published 且已 indexed。
- chunk 是否足夠具體，能支撐回答。
- 是否有 Needs re-index 的文件會影響 release confidence。

### 5. Evaluation：跑 offline eval 並匯出結果

用途：用 saved live interactions / eval cases replay baseline 與 candidate，避免只靠人工主觀判斷。

操作：

1. 點擊 `Evaluation`。
2. 點擊 `Run offline eval`。
3. 確認 Runner status 變成 `Completed`。
4. 點擊 `Export CSV` 下載 `botops-eval-summary.csv`。

管理員判斷重點：

- Candidate 是否優於 baseline。
- Citation Support、Handoff Safety Recall 是否達標。
- High-risk Auto-answer 是否為 `0.00`。

### 6. Error Analysis：把失敗案例轉成修正任務

用途：把低分 eval rows 變成 PM / Bot Ops / Knowledge Owner / Compliance 可處理的 badcase。

操作：

1. 點擊 `Error Analysis`。
2. 查看 failure label、low score dimension、trace diagnosis、modification。

管理員判斷重點：

- 問題是 prompt、retrieval、knowledge、risk routing 還是 handoff。
- 是否有 owner 和 retest metric。

### 7. Handoff：檢查人工交接品質

用途：高風險案例不能只讓 bot 自動回答，必須包裝成可交接給人工隊列的資訊。

操作：

1. 在 Intake 啟動 account takeover 類型 scenario。
2. 點擊 `Handoff`。
3. 檢查 queue、required fields、summary、risk warning。

管理員判斷重點：

- 是否有明確交接原因。
- 是否要求必要欄位。
- 是否禁止 bot 做不該做的帳戶操作或安全結論。

### 8. Release Center：檢查是否允許發布

用途：把 eval 結果轉成 release gate，阻擋不安全版本。

操作：

1. 點擊 `Release Center`。
2. 檢查每個 bundle 的狀態。
3. 如果看到 blocked reasons，代表該版本不可發布。

管理員判斷重點：

- Regression count 是否超標。
- High-risk auto-answer 是否為 0。
- Handoff safety recall 是否達到 1.00。

### 9. Ops Log：檢查操作稽核紀錄

用途：確認重要管理動作都有留下紀錄，包含 scenario run、eval case saved、offline eval、CSV export。

操作：

1. 點擊 `Ops Log`。
2. 檢查最新事件是否出現在列表最上方。
3. 對照剛才操作是否都有紀錄。

管理員判斷重點：

- 是否能追溯誰做了什麼、對哪個 entity 做、何時做。
- 未來後端應把這裡的事件寫入正式 audit log。

## 面試展示建議路徑

1. `Overview`：先講產品不是 chatbot UI，而是 bot management control plane。
2. `Intake`：展示多來源訊號。
3. `Chat + Trace`：展示回答、引用、trace、save eval case。
4. `Evaluation`：跑 offline eval，匯出 CSV。
5. `Error Analysis`：展示如何從失敗案例推回產品修正。
6. `Release Center`：展示用 gate 阻擋 unsafe release。
7. `Ops Log`：收尾講 governance 與後端擴充方向。

## 目前限制

- P1 使用 deterministic seed data，不連接真實 channel、ticket system 或 LLM。
- localStorage 只適合本機 demo，不是正式資料儲存。
- CSV export 是前端產生，未來應由後端提供 signed export 或 report job。
