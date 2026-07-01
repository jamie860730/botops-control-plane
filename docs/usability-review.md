# BotOps Control Plane 易用性測試紀錄

測試日期：2026-07-01  
測試角色：Support automation 管理員 / Bot Ops reviewer  
測試方式：Playwright 模擬管理員操作，並搭配桌面與手機截圖檢查。

## 測試任務

| 任務 | 結果 |
| --- | --- |
| 載入產品並確認品牌與主標題 | 通過 |
| 從 Overview 理解 bot management loop | 通過 |
| 從 Signal Intake 篩選 Telegram 訊號並開啟 reply trace review | 通過 |
| 在 Chat + Trace 檢查已送出回答、retained trace、citation | 通過 |
| 儲存對話為 eval case | 通過 |
| 在 Evaluation 執行 offline eval | 通過 |
| 匯出 `botops-eval-summary.csv` | 通過 |
| 在 Release Center 檢查 blocked reason 並執行 release decision | 通過 |
| 在 Ops Log 確認操作紀錄 | 通過 |
| 在手機尺寸開啟 Overview | 通過 |

## 管理員視角觀察

### 主要優點

- 流程順序符合管理員作業模型：先檢視 live 訊號，再審查 bot 已送出回答與 retained trace，接著進行 eval、badcase、release、audit。
- `Chat + Trace` 能同時看到回答與內部決策鏈，適合面試時說明「我不是只做 chatbot UI」。
- `Knowledge` 已補上 RAG 管理語意：KB snapshot、index status、retrieval config、citation chunks。
- `Evaluation` 的 offline eval 與 CSV export 讓產品更像真實 PM/Ops 工作流。
- 每頁的 compact page intent header 能快速說明該頁支援的管理決策。
- `Release Center` 已可執行 Promote / Block / Request review，並將決策寫入 audit trail。
- `Ops Log` 補足治理與 auditability，對後端設計也有延伸價值。
- 桌面版資訊密度合理，沒有明顯文字遮擋或卡片互相擠壓。

### 已發現並修正

| 嚴重度 | 問題 | 影響 | 修正 |
| --- | --- | --- | --- |
| P2 | 手機寬度下左側導覽變成單欄，主工作區進入視野前需要過多捲動。 | 管理員在手機或窄視窗操作時，主要內容呈現延遲。 | 手機導覽改成雙欄，並隱藏 sidebar note，保留 44px touch target。 |
| P1 | 每頁缺少 compact page intent header。 | 管理員切頁後需要自行推論本頁決策目的。 | Shell 層加入 page intent，標示本頁支援的決策。 |
| P2 | Release Center 缺少明確 CTA。 | 管理員只能看 gate，無法留下發布決策。 | 加入 Promote / Block / Request review，並寫入 Ops Log。 |

## 仍可改進

| 優先級 | 建議 | 原因 |
| --- | --- | --- |
| P1 | 加入首次使用 walkthrough 或 demo mode stepper。 | 面試時可以更穩定地引導對方走完 7 步 demo。 |
| P2 | Evaluation 的 CSV export 可加入 preview modal。 | 管理員下載前可確認欄位與範圍。 |
| P2 | Ops Log 可加入 event type filter。 | 事件變多後需要快速篩選 eval / release / handoff 類操作。 |

## 測試產物

- 桌面 Overview：`/tmp/botops-usability/01-overview.png`
- 桌面 Chat + Trace：`/tmp/botops-usability/02-chat-trace.png`
- 桌面 Evaluation：`/tmp/botops-usability/03-evaluation.png`
- 桌面 Ops Log：`/tmp/botops-usability/04-ops-log.png`
- 手機 Overview 修正前：`/tmp/botops-usability/05-mobile-overview.png`
- 手機 Overview 修正後：`/tmp/botops-usability/06-mobile-overview-after-nav-fix.png`

## 結論

目前產品已能支撐管理員完成核心審查任務：從多來源 live 訊號進入，審查 bot 已送出的 answer 與 retained trace，轉存 eval case，執行 offline eval，匯出結果，檢查 release gate，並透過 Audit Log 保留治理證據。

下一步應優先補「first-run walkthrough」與「CSV preview / Ops Log filter」，使面試展示與日常審查情境更穩定。
