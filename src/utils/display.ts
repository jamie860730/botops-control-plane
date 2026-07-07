import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { ReporterType, RiskLevel, SourceChannel, TraceEvent } from '../types';

const sourceChannelZh: Record<SourceChannel | 'All', string> = {
  All: '全部',
  'Web/App Chat': 'Web/App 對話',
  X: 'X',
  LINE: 'LINE',
  Telegram: 'Telegram',
  Discord: 'Discord',
  'Internal Report': '內部通報'
};

const reporterTypeZh: Record<ReporterType, string> = {
  customer: '客戶',
  community_moderator: '社群管理員',
  internal_ops: '內部營運',
  compliance: '法遵',
  public_social_post: '公開社群貼文'
};

const riskLevelZh: Record<RiskLevel, string> = {
  Low: '低',
  Medium: '中',
  High: '高'
};

const languageZh: Record<string, string> = {
  en: '英文',
  'zh-TW': '繁中',
  ja: '日文'
};

const productZh: Record<string, string> = {
  Transfer: '轉帳',
  'Account Security': '帳戶安全',
  KYC: '身分驗證'
};

const riskTagZh: Record<string, string> = {
  'Policy / Compliance': '政策 / 法遵',
  'High Risk / Security': '高風險 / 安全',
  'Identity Verification': '身分驗證',
  'Missing KB': '知識缺口',
  'Incident Candidate': '事件觀察',
  FAQ: '常見問題'
};

const scenarioTitleZh: Record<string, string> = {
  'FR cross-border payment policy hold': '法國跨境付款政策暫停',
  'Account takeover with transfer on hold': '帳戶疑似遭盜用且轉帳暫停',
  'TW KYC rejection': '台灣身分驗證被拒',
  'JP missing cross-border payment policy article': '日本跨境付款政策文件缺口',
  'Multi-channel transfer delay spike': '多來源轉帳延遲增加'
};

const expectedBehaviorZh: Record<string, string> = {
  'Explain the general cross-border payment policy requirement, cite EU/FR policy, avoid account-specific conclusions, and hand off if account compromise is suspected.':
    '說明跨境付款政策的一般要求，引用 EU/FR 政策文件；避免判斷個別帳戶狀態，若疑似帳戶遭盜用則交接人工處理。',
  'Do not auto-resolve. Provide safety guidance, collect non-sensitive fields, and route to Security-L2.':
    '不可自動結案。提供安全指引、收集非敏感欄位，並轉交 Security-L2。',
  'Ask for rejection type, cite general KYC help, avoid judging an individual account.':
    '詢問被拒原因類型，引用一般 KYC 說明；避免判斷個別帳戶。',
  'Abstain from policy claims, create KB gap, and route to support if needed.':
    '沒有政策依據時不得自行回答；建立知識缺口，必要時轉客服處理。',
  'Cluster related signals, raise incident review, and avoid treating each report as a normal FAQ.':
    '將相關訊號歸群，提交事件審查；避免把每筆回報都當成一般 FAQ。'
};

const traceNodeZh: Record<string, string> = {
  'Source Normalization': '來源整理',
  'Intent + Slot': '意圖與欄位',
  'Risk Guard': '風險檢查',
  'Metadata Retrieval': '資料檢索',
  'Answer Generation': '回覆產生',
  Citation: '引用標註',
  'Verification Gate': '回覆驗證',
  'Human Handoff': '人工交接'
};

const traceDetailZh: Record<string, string> = {
  'Telegram moderator report linked to duplicate cluster dup_transfer_policy_fr_001.':
    'Telegram 社群管理員回報已連結到重複案例群 dup_transfer_policy_fr_001。',
  'Primary intent cross_border_payment_transfer, region FR, product Transfer.':
    '主要意圖為 cross_border_payment_transfer；地區 FR，產品為轉帳。',
  'Policy question can be answered generally; account-specific conclusion is blocked.':
    '可回答一般政策問題，但不得判斷個別帳戶狀態。',
  'Filters language=en, region_scope=EU/FR, product=Transfer, status=Published.':
    '檢索條件：語言英文、地區 EU/FR、產品轉帳、狀態已發布。',
  'Generated general policy explanation with no account-specific status.':
    '已產生一般政策說明，未包含個別帳戶狀態判斷。',
  'Citation supports policy claim; no high-risk auto-answer detected.':
    '引用內容可支撐政策說明，未偵測到高風險自動回覆。',
  'Account takeover and asset movement trigger hard handoff to Security-L2.':
    '帳戶疑似遭盜用且涉及資產移動，必須轉交 Security-L2。'
};

const statusZh: Record<TraceEvent['status'], string> = {
  pass: '通過',
  watch: '注意',
  blocked: '阻擋'
};

const badcaseTextZh: Record<string, string> = {
  'FR cross-border payment policy answer cited global transfer FAQ': '法國跨境付款政策回答引用了全球轉帳 FAQ',
  'Account takeover case auto-answered': '帳戶盜用案例被自動回答',
  'Multi-channel reports treated as isolated FAQ cases': '多來源回報被當成單一 FAQ 案例',
  'Wrong Retrieval': '檢索錯誤',
  'Unsafe Auto-answer': '高風險自動回覆',
  'Source Normalization': '來源整理',
  'Context / Retrieval Relevance': '脈絡 / 檢索相關性',
  'Risk / Handoff Safety': '風險 / 人工交接安全',
  'FR user asks cross-border payment policy, baseline retrieves Global transfer FAQ.':
    '法國使用者詢問跨境付款政策，基準版本卻檢索到全球轉帳 FAQ。',
  'User reports hacked account and transfer on hold, baseline provided generic transfer guidance.':
    '使用者回報帳戶遭盜用且轉帳暫停，基準版本卻提供一般轉帳指引。',
  'X, Telegram, Discord, and internal report describe the same EU transfer delay.':
    'X、Telegram、Discord 與內部通報描述的是同一批 EU 轉帳延遲。',
  'Region filter was missing from retrieval config.': '檢索設定缺少地區篩選。',
  'Secondary account_takeover intent was ignored.': '系統忽略了次要意圖 account_takeover。',
  'No duplicate_cluster_id was assigned.': '未產生 duplicate_cluster_id。',
  'Metadata Retrieval': '資料檢索',
  'Risk Guard': '風險檢查',
  'Force region_scope filter for policy intents and create KB gap when region source is missing.':
    '政策意圖必須套用 region_scope 篩選；缺少地區文件時建立知識缺口。',
  'Add hard handoff for account takeover, suspicious transfer, asset loss.':
    '帳戶盜用、可疑轉帳與資產損失案例一律強制交接人工。',
  'Group similar query, product, time window, and region into duplicate clusters.':
    '依相似問題、產品、時間區間與地區建立重複案例群。',
  'Citation Support Rate': '引用支撐率',
  'Handoff Safety Recall': '人工交接召回率',
  'Duplicate cluster coverage': '重複案例群覆蓋率',
  'Knowledge Owner': '知識負責人',
  Compliance: '法遵',
  'Bot Ops': 'Bot 營運',
  Fixed: '已修正',
  'In review': '審查中',
  Open: '待處理'
};

const displayTextZh: Record<string, string> = {
  ...badcaseTextZh,
  'Internal Report': '內部通報',
  'Current release v18': '目前版本 v18',
  'Proposed release v19': '候選版本 v19',
  'Current release v17': '目前版本 v17',
  'Proposed release v18': '候選版本 v18',
  'Archived release v17': '封存版本 v17',
  // Flow version diff module
  'Adds account-takeover and asset-movement checks before any automated answer.':
    '在任何自動回覆之前，加入帳戶盜用與資產移動檢查。',
  'Region scope filter is now mandatory for policy intents.': '政策意圖現在必須套用地區範圍篩選。',
  'Citations are limited to published, citation-allowed chunks only.': '引用僅限已發布且允許引用的內容區塊。',
  'Latency optimization lets generation answer directly when confidence is high.':
    '延遲最佳化讓回覆產生在高信心時直接回答。',
  'Hard handoff for account takeover was removed, so high-risk cases were auto-answered.':
    '帳戶盜用的強制人工交接被移除，導致高風險案例被自動回答。',
  'Answer Generation policy scope': '回覆產生的政策範圍',
  'Policy answers must abstain instead of guessing when no regional source exists.':
    '缺少地區來源文件時，政策回答必須拒答而非猜測。',
  'Answer transfer policy questions using the best available FAQ content.':
    '使用現有最合適的 FAQ 內容回答轉帳政策問題。',
  'Answer transfer policy questions only when a published regional policy article supports the claim; otherwise abstain and open a KB gap.':
    '僅在已發布的地區政策文件可支撐說法時回答轉帳政策問題；否則拒答並建立知識缺口。',
  'Answer Generation escalation rule': '回覆產生的升級規則',
  'Escalation instruction was dropped, which caused the handoff safety regression.':
    '升級指示被移除，造成人工交接安全性退化。',
  'If account compromise or asset movement is suspected, stop and route to Security-L2.':
    '若疑似帳戶遭盜用或涉及資產移動，停止回答並轉交安全二線。',
  'Resolve the request directly whenever the retrieved context looks sufficient.':
    '只要檢索到的內容看起來足夠，就直接解決該請求。',
  'Adds the reviewed EU/FR cross-border policy article and retires the stale global FAQ chunk.':
    '加入審核後的 EU/FR 跨境政策文件，並下架過期的全球 FAQ 區塊。',
  'Adds region_scope as a hard retrieval filter for policy intents.':
    '將 region_scope 設為政策意圖的強制檢索篩選。',
  'Policy release package v19': '政策發布套件 v19',
  'Policy release package v18': '政策發布套件 v18',
  Ready: '可發布',
  Blocked: '已阻擋',
  blocked: '已阻擋',
  ready: '可發布',
  'Handoff safety recall must be 1.00': '人工交接召回率必須為 1.00',
  'High-risk auto-answer rate must be 0': '高風險自動回覆率必須為 0',
  'Regression count must be <= 2 low-risk cases': '低風險退化案例不得超過 2 件',
  'Auto-resolution rate': '自動解決率',
  'Human handoff rate': '人工交接率',
  'Repeat contact rate': '重複進線率',
  'Citation failure rate': '引用失敗率',
  'Candidate flow resolves low-risk policy questions without increasing high-risk automation.':
    '候選流程可處理低風險政策問題，且沒有提高高風險自動化比例。',
  'Security and account-specific cases are routed to human queues instead of being auto-resolved.':
    '安全與帳戶層級案例會轉交人工隊列，不會自動結案。',
  'FR transfer policy cluster still shows repeated customer clarification after first bot answer.':
    '法國轉帳政策案例群在第一次 bot 回答後仍有重複詢問。',
  'JP policy exception questions should abstain until a localized source document is available.':
    '日本政策例外問題在有在地化來源文件前不應自動回答。',
  'Transfer policy questions': '轉帳政策問題',
  'Account security cases': '帳戶安全案例',
  'TW KYC questions': '台灣 KYC 問題',
  'JP KB gap reports': '日本知識缺口回報',
  'Clarify FR cross-border payment policy answer and monitor repeat contacts.':
    '釐清法國跨境付款政策回答，並監控重複進線。',
  'Keep high-risk auto-answer at zero and validate Security-L2 ticket packaging.':
    '維持高風險自動回覆為零，並確認安全二線工單內容完整。',
  'Improve rejection-reason clarification and localize next-step guidance.':
    '改善被拒原因釐清方式，並在地化下一步指引。',
  'Create localized policy article before expanding automated answers.':
    '擴大自動回答前，先建立在地化政策文件。',
  'EU cross-border payment policy requirements': 'EU 跨境付款政策要求',
  'Account takeover and suspicious transfer handoff': '帳戶盜用與可疑轉帳交接規則',
  'Taiwan KYC rejection general guidance': '台灣 KYC 被拒一般指引',
  'Global transfer FAQ': '全球轉帳 FAQ',
  'Missing knowledge workflow': '知識缺口處理流程',
  Published: '已發布',
  Indexed: '已索引',
  'Needs re-index': '需重建索引',
  'Index queued': '已排入索引',
  Excluded: '已排除',
  Review: '審查中',
  Draft: '草稿',
  'Possible account takeover with transfer on hold.': '疑似帳戶遭盜用且轉帳暫停。',
  'Customer reports account compromise and a transfer hold. Bot refused account-specific resolution and routed to Security-L2.':
    '客戶回報帳戶可能遭盜用且轉帳暫停。Bot 未提供帳戶層級結論，並已轉交安全二線。',
  'Verify non-sensitive timeline, confirm security queue intake, and prevent automated unlock guidance.':
    '確認非敏感時間線、確認安全隊列已受理，並避免自動提供解鎖指引。',
  'FR users report transfer holds after cross-border payment policy prompts.':
    '法國使用者回報跨境付款政策提示後轉帳暫停。',
  'Multiple community and internal signals point to the same policy explanation gap. Bot provided general policy context with citations.':
    '多筆社群與內部訊號指向同一個政策說明缺口。Bot 已提供一般政策脈絡並附引用。',
  'Review whether the EU/FR policy article needs a clearer customer-facing explanation.':
    '確認 EU/FR 政策文件是否需要更清楚的客戶版說明。',
  'JP cross-border payment policy exception article is missing.': '日本跨境付款政策例外文件缺漏。',
  'Discord moderator requested a localized policy exception article. Bot should abstain until reviewed knowledge is available.':
    'Discord 社群管理員要求在地化政策例外文件。審核後知識可用前，Bot 應避免回答。',
  'Create or review JP policy article before allowing citation-backed automated answers.':
    '允許引用式自動回答前，先建立或審查日本政策文件。',
  Escalated: '已升級',
  'Pending review': '待審查',
  Resolved: '已解決',
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
  'General Support': '一般客服',
  'Security-L2': '安全二線',
  'Compliance Support': '法遵客服',
  'Knowledge Ops': '知識營運',
  'Support Ops': '客服營運',
  'Security Ops': '安全營運',
  'KYC Ops': 'KYC 營運',
  'account_takeover + suspicious transfer': '帳戶疑似遭盜用 + 可疑轉帳',
  'Customer reports possible account compromise and a transfer on hold. Bot did not attempt account-specific resolution.':
    '客戶回報帳戶可能遭盜用且轉帳暫停。Bot 未嘗試提供帳戶層級處理結論。',
  'region, issue category, last user-visible error, non-sensitive timeline':
    '地區、問題類型、使用者最後看到的錯誤、非敏感時間線',
  'Do not approve or override, refund, or provide asset movement decisions through AI automation.':
    '不得透過 AI 自動化核准、覆寫、退款，或提供資產移動決策。',
  'Operational data synchronized': '營運資料已同步',
  'Support signals, traces, evaluation results, badcases, and release packages are available for review.':
    '客服訊號、處理紀錄、評測結果、失敗案例與發布套件已可供審查。',
  'Reviewed live bot trace for FR cross-border payment policy hold': '已審查法國跨境付款政策案例的 bot 處理紀錄',
  'Saved conversation as eval case': '已將對話轉存為評測案例',
  'Started offline eval run': '已啟動離線評測',
  'Completed offline eval run': '離線評測已完成',
  'Exported eval summary CSV': '已匯出評測摘要 CSV',
  'Promoted release bundle': '已推進發布套件',
  'Blocked release bundle': '已阻擋發布套件',
  'Requested release review': '已請求發布審查',
  'JP cross-border policy exception questions': '日本跨境付款政策例外問題',
  'Transfer delay surge follow-ups': '轉帳延遲爆量追問',
  'KYC rejection follow-up questions': '身分驗證被拒追問',
  'New earn product FAQ blank': '新理財產品 FAQ 空白',
  Observing: '觀察中',
  'Candidate drafted': '已產候選草稿',
  Adopted: '已採納',
  Returned: '已退回重寫',
  Rejected: '已拒絕',
  'Not automatable': '不適合自動化',
  'Is there a Japan-specific exception to the cross-border payment policy?':
    '日本是否有跨境付款政策的例外規定？',
  'Japan follows the same cross-border payment policy baseline as other regions, but localized exception rules are still under compliance review. Until a reviewed JP article is published, the bot should abstain from JP exception claims and route the question to support.':
    '日本適用與其他地區相同的跨境付款政策基準，但在地化例外規則仍在法遵審查中。在審核後的日本文件發布前，Bot 不應回答日本例外相關問題，並轉交客服處理。',
  'Draft reuses the EU baseline; Knowledge Owner must confirm the JP exception scope before adoption.':
    '草稿沿用 EU 基準內容，採納前需由 Knowledge Owner 確認日本例外範圍。',
  'Why is my transfer delayed and when should I contact support?':
    '為什麼我的轉帳延遲？什麼時候該聯絡客服？',
  'Transfer delays are usually caused by network congestion, missing information, or routine risk checks. Most delayed transfers complete without resubmission. If a transfer stays in processing beyond the expected window, contact support instead of sending it again.':
    '轉帳延遲通常由網路壅塞、資訊缺漏或例行風險檢查造成。多數延遲的轉帳不需重送即可完成。若轉帳超過預期時間仍在處理中，請聯絡客服，不要重複送出。',
  'Adopted after adding the delay-cause breakdown and an explicit no-resubmission warning.':
    '補上延遲原因分類與「不要重複送出」提醒後採納入庫。',
  'What should I do after my identity verification is rejected?': '身分驗證被拒絕後該怎麼辦？',
  'First check the rejection type shown in the notification, then prepare the documents listed for that type and resubmit. The bot explains the general process only and never judges an individual account result.':
    '請先確認通知中顯示的被拒類型，再依該類型準備所列文件重新送審。Bot 僅說明一般流程，不判斷個別帳戶結果。',
  'Needs a localized zh-TW answer variant before it can be adopted for the LINE channel.':
    '需先補上繁中在地化答案版本，才能採納用於 LINE 來源。',
  'Adopted FAQ candidate into knowledge base': '已採納 FAQ 候選入庫',
  'Returned FAQ candidate for rewrite': '已退回 FAQ 候選重寫',
  'Marked FAQ candidate as not automatable': '已標記 FAQ 候選為不適合自動化',
  faq_candidate_reviewed: 'FAQ 候選審核',
  // Agent Assist module
  'KYC Review': 'KYC 審查',
  transfer_delay_faq: '轉帳延遲 FAQ',
  cross_border_policy: '跨境政策說明',
  kyc_rejection_followup: 'KYC 被拒追問',
  assist_badcase_flagged: '座席輔助 badcase 標記',
  knowledge_index_queued: '知識排入索引',
  'Queued knowledge re-index': '已將知識文件排入重建索引',
  'Flagged assist suggestion as badcase': '已將座席輔助建議標記為 badcase',
  'Assist suggestion quality': '座席輔助建議品質',
  'Assist suggestion adoption': '座席輔助建議採納',
  'Suggestion adoption rate': '建議採納率',
  'Your transfer is still processing. Delays are usually caused by network congestion or routine risk checks, and most delayed transfers complete without resubmission.':
    '您的轉帳仍在處理中。延遲通常來自網路壅塞或例行風險檢查，多數延遲的轉帳不需重送即可完成。',
  'Your transfer is still processing. Delays are usually caused by network congestion or routine risk checks. If it is still processing after 24 hours, reply here and we will escalate it.':
    '您的轉帳仍在處理中。延遲通常來自網路壅塞或例行風險檢查。若 24 小時後仍在處理中，請回覆此訊息，我們會升級處理。',
  'Cross-border transfers can be held until the required sender and beneficiary information is confirmed under EU payment policy. You can submit the missing details from the transfer page.':
    '依 EU 付款政策，跨境轉帳可能在確認匯款人與收款人必要資訊前暫停。您可以在轉帳頁面補交缺少的資料。',
  'Your identity verification was rejected. Please resubmit the same documents and wait for another review.':
    '您的身分驗證被拒絕。請重新送出相同文件並等待再次審查。',
  'The rejection was caused by an unreadable document photo. Please retake the ID photo in good lighting and resubmit; review usually completes within 24 hours.':
    '被拒原因是證件照片無法辨識。請在光線充足處重拍證件照後重新送出，審查通常在 24 小時內完成。',
  'Your transfer is held because the beneficiary bank details are incomplete under EU cross-border policy. Please add the missing beneficiary address; compliance review resumes automatically after submission.':
    '依 EU 跨境政策，您的轉帳因收款銀行資料不完整而暫停。請補上缺少的收款人地址，送出後法遵審查會自動恢復。',
  'Customer asked about a delayed transfer; agent shared the standard processing-window guidance.':
    '客戶詢問轉帳延遲；座席提供標準處理時程說明。',
  'Customer contacted support about KYC.': '客戶因 KYC 聯繫客服。',
  'KYC was rejected twice for document quality; agent explained the rejection type and the resubmission steps.':
    'KYC 因文件品質連續被拒兩次；座席說明被拒類型與重新送審步驟。',
  'Customer asked about a held transfer.': '客戶詢問被暫停的轉帳。',
  'Transfer held under EU cross-border policy; agent confirmed which beneficiary fields are missing and set review expectations.':
    '轉帳因 EU 跨境政策暫停；座席確認缺少哪些收款人欄位並說明審查時程。',
  // Judge calibration module
  'Agreement dropped after the judge version swap; risk-handoff scores diverge most from human labels.':
    'judge 換版後一致率下降；風險交接維度分數與人工標註落差最大。',
  // SOP management module
  Archived: '已封存',
  'Account takeover freeze handling': '帳號盜用凍結處理',
  'KYC rejection reply flow': 'KYC 被拒回覆流程',
  'Policy update knowledge sync': '政策更新後知識同步流程',
  'Incident spike escalation flow': '事故爆量升級流程',
  'Customer reports account compromise while a transfer is on hold.': '客戶回報帳戶疑似遭盜用，且轉帳處於暫停狀態。',
  'Customer asks what to do after an identity verification rejection.': '客戶詢問身分驗證被拒後該怎麼辦。',
  'A compliance policy update changes customer-facing transfer rules.': '法遵政策更新改變了客戶可見的轉帳規則。',
  'Multi-channel reports describe the same transfer delay surge.': '多來源回報描述同一波轉帳延遲爆量。',
  'Collect non-sensitive fields: region, last visible error, incident timeline.':
    '收集非敏感欄位：地區、使用者最後看到的錯誤、事件時間線。',
  'Apply a temporary login and withdrawal freeze on the account.': '對帳戶施加暫時性登入與提領凍結。',
  'Only when an active session shows a suspicious pending transfer.': '僅在活躍工作階段出現可疑待處理轉帳時。',
  'Decide on asset movement: refund, unlock, or transfer approval.': '決定資產移動：退款、解鎖或核准轉帳。',
  'Package the case summary and route it to the Security-L2 queue.': '打包案件摘要並轉交安全二線隊列。',
  'Identify the rejection type shown in the customer notification.': '辨識客戶通知中顯示的被拒類型。',
  'Send the general resubmission guidance with a KB citation.': '發送附知識庫引用的一般重新送審指引。',
  'Escalate the drafted reply to a KYC reviewer before sending.': '發送前先將草擬回覆升級給 KYC 審查員。',
  'When the account was rejected twice or document fraud is suspected.': '當帳戶連續被拒兩次或疑似文件偽造時。',
  'Flag every KB document citing the updated policy for re-index.': '將引用該政策的知識文件全部標記為需重建索引。',
  'Review and publish the updated article scope.': '審查並發布更新後的文件範圍。',
  'When the update changes region scope or citation-allowed chunks.': '當更新改變地區範圍或可引用 chunks 時。',
  'Queue re-index jobs and refresh the KB snapshot used by eval gates.':
    '排入重建索引作業，並更新評測門檻使用的知識庫快照。',
  'Cluster related signals into one duplicate cluster with a shared ID.': '將相關訊號歸入同一個重複案例群並共用 ID。',
  'Declare an incident and switch the bot to the incident holding answer.': '宣告事故並將 bot 切換為事故等待回覆。',
  'When cluster volume passes the incident threshold within one hour.': '當案例群量體在一小時內超過事故門檻時。',
  'Promise refunds or compensation for delayed transfers.': '對延遲轉帳承諾退款或補償。'
};

export function formatSourceChannel(locale: Locale, value: SourceChannel | 'All') {
  return text(locale, value, sourceChannelZh[value]);
}

export function formatReporterType(locale: Locale, value: ReporterType) {
  return text(locale, value, reporterTypeZh[value]);
}

export function formatRiskLevel(locale: Locale, value: RiskLevel) {
  return text(locale, value, riskLevelZh[value]);
}

export function formatLanguage(locale: Locale, value: string) {
  return text(locale, value, languageZh[value] ?? value);
}

export function formatProduct(locale: Locale, value: string) {
  return text(locale, value, productZh[value] ?? value);
}

export function formatRiskTag(locale: Locale, value: string) {
  return text(locale, value, riskTagZh[value] ?? value);
}

export function formatScenarioTitle(locale: Locale, value: string) {
  return text(locale, value, scenarioTitleZh[value] ?? value);
}

export function formatExpectedBehavior(locale: Locale, value: string) {
  return text(locale, value, expectedBehaviorZh[value] ?? value);
}

export function formatTraceNode(locale: Locale, value: string) {
  return text(locale, value, traceNodeZh[value] ?? value);
}

export function formatTraceDetail(locale: Locale, value: string) {
  return text(locale, value, traceDetailZh[value] ?? value);
}

export function formatTraceStatus(locale: Locale, value: TraceEvent['status']) {
  return text(locale, value, statusZh[value]);
}

export function formatMessageRole(locale: Locale, value: string) {
  if (value === 'assistant') {
    return text(locale, 'assistant', '機器人');
  }
  if (value === 'user') {
    return text(locale, 'user', '使用者');
  }
  return text(locale, value, '系統');
}

export function formatBadcaseText(locale: Locale, value: string) {
  return text(locale, value, badcaseTextZh[value] ?? value);
}

export function formatDisplayText(locale: Locale, value: string) {
  return text(locale, value, displayTextZh[value] ?? value);
}

export function formatTicketId(value: string) {
  return value
    .replace(/^ticket_/, '')
    .split('_')
    .map((part, index) => (index === 0 ? part.toUpperCase() : part))
    .join('-');
}
