# BotOps Control Plane 易用性測試紀錄

測試日期：2026-07-01  
測試角色：Support automation 管理員 / Bot Ops reviewer  
測試方式：Playwright 模擬管理員操作，並搭配桌面與手機截圖檢查。

## 測試任務

| 任務 | 結果 |
| --- | --- |
| 載入產品並確認品牌與主標題 | 通過 |
| 從 Overview 理解 bot management loop | 通過 |
| 從 Intake 篩選 Telegram 訊號並打開 live reply + trace | 通過 |
| 在 Chat + Trace 檢查已送出回答、retained trace、citation | 通過 |
| 儲存對話為 eval case | 通過 |
| 在 Evaluation 跑 offline eval | 通過 |
| 匯出 `botops-eval-summary.csv` | 通過 |
| 在 Release Center 檢查 blocked reason | 通過 |
| 在 Ops Log 確認操作紀錄 | 通過 |
| 在手機尺寸開啟 Overview | 通過 |

## 管理員視角觀察

### 做得好的地方

- 流程順序符合管理員心智模型：先看 live 訊號，再看 bot 已送出回答與 retained trace，接著 eval、badcase、release、audit。
- `Chat + Trace` 能同時看到回答與內部決策鏈，適合面試時說明「我不是只做 chatbot UI」。
- `Knowledge` 已補上 RAG 管理語意：KB snapshot、index status、retrieval config、citation chunks。
- `Evaluation` 的 offline eval 與 CSV export 讓產品更像真實 PM/Ops 工作流。
- `Ops Log` 補足治理與 auditability，對後端設計也有延伸價值。
- 桌面版資訊密度合理，沒有明顯文字遮擋或卡片互相擠壓。

### 已發現並修正

| 嚴重度 | 問題 | 影響 | 修正 |
| --- | --- | --- | --- |
| P2 | 手機寬度下左側導覽變成單欄，進入主內容前需要滑太久。 | 管理員在手機或窄視窗 demo 時，主工作區出現太晚。 | 手機導覽改成雙欄，並隱藏 sidebar note，保留 44px touch target。 |

## 仍可改進

| 優先級 | 建議 | 原因 |
| --- | --- | --- |
| P1 | 加入首次使用 walkthrough 或 demo mode stepper。 | 面試時可以更穩定地引導對方走完 7 步 demo。 |
| P1 | 在每頁加一個 compact page intent header。 | 管理員切頁後能快速確認「這頁要做什麼決策」。 |
| P2 | Evaluation 的 CSV export 可加入 preview modal。 | 管理員下載前可確認欄位與範圍。 |
| P2 | Ops Log 可加入 event type filter。 | 事件變多後需要快速篩選 eval / release / handoff 類操作。 |
| P2 | Release Center 可加入明確 CTA：Promote / Block / Request review。 | 現在能看 gate，但管理員決策動作還不完整。 |

## 測試產物

- 桌面 Overview：`/tmp/botops-usability/01-overview.png`
- 桌面 Chat + Trace：`/tmp/botops-usability/02-chat-trace.png`
- 桌面 Evaluation：`/tmp/botops-usability/03-evaluation.png`
- 桌面 Ops Log：`/tmp/botops-usability/04-ops-log.png`
- 手機 Overview 修正前：`/tmp/botops-usability/05-mobile-overview.png`
- 手機 Overview 修正後：`/tmp/botops-usability/06-mobile-overview-after-nav-fix.png`

## 結論

目前產品已能支撐一位管理員完成核心 demo 任務：從多來源 live 訊號進入，檢查 bot 已即時送出的 answer + retained trace，保存 eval case，跑 offline eval，匯出結果，檢查 release gate，最後用 Ops Log 證明治理能力。

下一步應優先補「demo walkthrough」與「release decision action」，讓產品更像可交付的內部平台，而不是靜態分析 dashboard。
