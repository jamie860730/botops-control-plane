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
| 預覽並匯出 `botops-eval-summary.csv` | 通過 |
| 在 Release Center 檢查 blocked reason 並執行 release decision | 通過 |
| 在 Ops Log 確認並篩選操作紀錄 | 通過 |
| 在手機尺寸開啟 Overview | 通過 |

## 管理員視角觀察

### 主要優點

- 流程順序符合管理員作業模型：先檢視 live 訊號，再審查 bot 已送出回答與 retained trace，接著進行 eval、badcase、release、audit。
- `Chat + Trace` 能同時看到回答與內部決策鏈，避免產品只停留在 chatbot 對話框層級。
- `Knowledge` 已補上 RAG 管理語意：KB snapshot、index status、retrieval config、citation chunks。
- `Evaluation` 的評測執行與 CSV export 符合真實 PM/Ops 工作流。
- `Evaluation` 已加入 CSV preview，下載前可確認欄位與資料範圍。
- `Release Center` 已可執行 Promote / Block / Request review，並將決策寫入 audit trail。
- `Ops Log` 已支援 event type filter，事件量增加後仍能快速定位發布、評測與匯出紀錄。
- `Ops Log` 補足治理與 auditability，對後端設計也有延伸價值。
- 桌面版資訊密度合理，沒有明顯文字遮擋或卡片互相擠壓。

### 已發現並修正

| 嚴重度 | 問題 | 影響 | 修正 |
| --- | --- | --- | --- |
| P2 | 窄視窗下左側導覽攤平成大型頂部區塊，主工作區進入視野前需要過多捲動。 | 管理員在手機、平板或窄桌面操作時，主要內容呈現延遲。 | 窄版改為 sticky top bar + hamburger drawer，保留 44px touch target，關閉時不進入 accessibility tree。 |
| P1 | 全域頁面說明文字偏 walkthrough。 | 正式產品介面看起來像展示流程，而非管理工作台。 | 移除 Shell 層 page intent，由各頁資料 panel 承擔上下文。 |
| P2 | Release Center 缺少明確 CTA。 | 管理員只能看 gate，無法留下發布決策。 | 加入 Promote / Block / Request review，並寫入 Ops Log。 |
| P2 | CSV export 沒有 preview。 | 管理員下載前無法確認欄位與是否含敏感資訊。 | 加入 CSV preview modal，確認後才下載。 |
| P2 | Ops Log 無法按事件類型篩選。 | 事件增加後不易快速定位發布或匯出紀錄。 | 加入 event type chips 與空狀態。 |

## 仍可改進

| 優先級 | 建議 | 原因 |
| --- | --- | --- |
| P1 | 將產品 walkthrough 拆成獨立展示模式，不放入正式管理介面。 | 正式產品應以管理員任務為主；展示導覽應獨立承載。 |
| P2 | Evaluation export 可改為後端 signed export job。 | 避免大型報表阻塞前端，並支援權限與到期時間。 |
| P2 | Ops Log 可加入日期區間與 actor filter。 | 真實審查環境會需要按人員與時間調查。 |

## 測試產物

- 桌面 Overview：`/tmp/botops-usability/01-overview.png`
- 桌面 Chat + Trace：`/tmp/botops-usability/02-chat-trace.png`
- 桌面 Evaluation：`/tmp/botops-usability/03-evaluation.png`
- 桌面 Ops Log：`/tmp/botops-usability/04-ops-log.png`
- 手機 Overview 修正前：`/tmp/botops-usability/05-mobile-overview.png`
- 窄版 Overview 漢堡導覽：`/tmp/botops-rwd-closed.png`
- 窄版 Overview 抽屜開啟：`/tmp/botops-rwd-open-final.png`

## 結論

目前產品已能支撐管理員完成核心審查任務：從多來源 live 訊號進入，審查 bot 已送出的 answer 與 retained trace，轉存 eval case，執行評測，匯出結果，檢查 release gate，並透過 Audit Log 保留治理證據。

下一步若需要展示情境，應另外建立 product walkthrough，不混入正式管理介面。
