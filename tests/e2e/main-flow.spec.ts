import { expect, type Page, test } from '@playwright/test';

test('support quality operations flow works end to end', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /BotOps Control Plane/i })).toBeVisible();
  await expect(page.getByText('Stable IDs enforced')).toHaveCount(0);
  await expect(page.getByText('Offline eval ready')).toHaveCount(0);
  await expect(page.getByText('Live Bot P2')).toHaveCount(0);
  await expectOverviewFirstAndActive(page);
  await expect(page.getByText('Bot quality, knowledge coverage, handoff exposure, and release status')).toBeVisible();
  await expect(
    page.getByText('See the current state of bot operations and decide what to handle first today.')
  ).toBeVisible();

  await page.getByRole('button', { name: '切換語言為繁體中文' }).click();
  await expect(page.getByRole('heading', { name: '儀表板' })).toBeVisible();
  await expectLocalizedNav(page);
  await expect(page.getByText('Bot 品質、知識覆蓋、交接風險與發布狀態')).toBeVisible();
  await navigateTo(page, '品質與發布');
  await clickQualityTab(page, '評測批次');
  await expect(page.getByRole('button', { name: /啟動評測/ })).toBeVisible();
  await navigateTo(page, '工單與交接');
  await expect(page.getByTestId('ticket-center')).toContainText('處理狀態');
  await expect(page.getByTestId('ticket-center')).toContainText('SLA 關注');
  await page.getByRole('button', { name: 'Switch language to English' }).click();

  await navigateTo(page, 'Dashboard');
  await expect(page.getByTestId('pm-dashboard')).toContainText('Operations Dashboard');
  await expect(page.getByTestId('pm-dashboard')).toContainText('Priority queue');
  await expect(page.getByTestId('pm-dashboard')).toContainText('Knowledge gaps');
  await expect(page.getByTestId('pm-dashboard')).toContainText('Release readiness');

  // Operational queue cards drive a computed detail panel from real ticket data.
  await page.getByRole('button', { name: /Active support tickets/ }).click();
  await expect(page.getByTestId('queue-detail-panel')).toContainText('Active support tickets');
  await expect(page.getByTestId('queue-ticket-count')).toHaveText('3 tickets');
  await expect(page.getByTestId('queue-detail-panel')).toContainText('Highest priority');
  await page.getByRole('button', { name: /Knowledge items to re-index/ }).click();
  await expect(page.getByTestId('queue-ticket-count')).toHaveText('1 ticket');
  await page.getByTestId('queue-open-tickets').click();
  // Cross-view CTA: landing on Tickets with a target opens the detail drawer directly.
  await expect(page.getByTestId('drawer-panel')).toContainText('KB-20260701-003');
  await expect(page.getByTestId('ticket-detail-panel')).toBeVisible();
  await closeDrawer(page);

  await navigateTo(page, 'Conversations');
  await expect(page.getByTestId('support-signal-list')).toContainText('Telegram');
  await page.getByRole('button', { name: 'Telegram', exact: true }).click();
  await expect(page.getByTestId('scenario-list')).toContainText('FR cross-border payment policy hold');

  // Signals are expandable and expose their metadata plus the related reply record.
  await page.getByTestId('signal-toggle-sig_tg_transfer_policy_fr_001').click();
  const signalDetail = page.getByTestId('signal-detail-sig_tg_transfer_policy_fr_001');
  await expect(signalDetail).toContainText('dup_transfer_policy_fr_001');
  await expect(signalDetail).toContainText('Source trust');
  await expect(signalDetail.getByRole('button', { name: /View related reply record/ })).toBeVisible();
  await page.getByTestId('signal-toggle-sig_tg_transfer_policy_fr_001').click();
  await expect(signalDetail).toHaveCount(0);

  await page.getByRole('button', { name: /Review live reply and trace for FR cross-border payment policy hold/i }).click();
  // Progressive disclosure: the review layer replaces the list layer entirely.
  await expect(page.getByTestId('conversation-review-layer')).toBeVisible();
  await expect(page.getByTestId('conversation-list-layer')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Conversations');
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText(
    'FR cross-border payment policy hold'
  );
  await expect(page.getByTestId('live-reply-review')).toContainText('Why is my transfer on hold');
  await expect(page.getByTestId('live-reply-review')).toContainText('Your transfer may require cross-border payment policy');
  await expect(page.getByTestId('live-reply-review')).toContainText('If the issue involves a suspicious transfer');

  await expect(page.getByTestId('trace-panel')).toContainText('Source Normalization');
  await expect(page.getByTestId('trace-panel')).toContainText('Metadata Retrieval');
  await expect(page.getByTestId('trace-panel')).toContainText('Verification Gate');

  await page.getByRole('button', { name: /Open citation chunk_payment_policy_eu_001/i }).click();
  await expect(page.getByTestId('highlighted-citation')).toContainText('cross-border payment policy requirements');

  await page.getByRole('button', { name: /Create eval case/i }).click();
  await expect(page.getByTestId('eval-save-status')).toContainText('eval_saved_scn_cross_border_payment_fr');

  // Back to list restores the intake queue and the compact delivered-replies list.
  await page.getByTestId('back-to-conversation-list').click();
  await expect(page.getByTestId('conversation-list-layer')).toBeVisible();
  await expect(page.getByTestId('conversation-review-layer')).toHaveCount(0);
  await expect(page.getByTestId('scenario-list')).toContainText('FR cross-border payment policy hold');
  await expect(page.getByRole('button', { name: 'Telegram', exact: true })).toHaveAttribute('aria-pressed', 'true');

  await navigateTo(page, 'Quality & Release');
  await expect(page.getByTestId('release-center')).toContainText('Policy release package v19');
  await clickQualityTab(page, 'KPI');
  await expect(page.getByTestId('cs-bot-kpi')).toContainText('Auto-resolution rate');
  await expect(page.getByTestId('cs-bot-kpi')).toContainText('Repeat contact rate');
  await expect(page.getByTestId('cs-bot-kpi')).toContainText('Account security cases');
  await expect(page.getByTestId('cs-bot-kpi')).toContainText('Keep high-risk auto-answer at zero');

  // KPI watchlist lists off-target metrics and focuses the matching card.
  await expect(page.getByTestId('kpi-watchlist')).toContainText('Repeat contact rate');
  await expect(page.getByTestId('kpi-watchlist')).toContainText('Citation failure rate');
  await page.getByTestId('kpi-watchlist-kpi_repeat_contact_rate').click();
  await expect(page.getByTestId('kpi-card-kpi_repeat_contact_rate')).toHaveClass(/focused/);

  // Segment drilldown jumps to Conversations with the source filter applied.
  // A source-only target stays on the list layer instead of opening a review.
  await page.getByTestId('segment-drilldown-segment_line_kyc_tw').click();
  await expect(page.getByTestId('conversation-list-layer')).toBeVisible();
  await expect(page.getByTestId('conversation-review-layer')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'LINE', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('scenario-list')).toContainText('TW KYC rejection');
  await expect(page.getByTestId('support-signal-list')).not.toContainText('Telegram');

  await navigateTo(page, 'Quality & Release');
  await clickQualityTab(page, 'Eval Runs');
  await expect(page.getByTestId('evaluation-center')).toContainText('Proposed release v19');
  await expect(page.getByTestId('evaluation-center')).toContainText('High-risk to human');
  await page.getByRole('button', { name: /Start eval run/i }).click();
  // The run transitions through Running (button disabled) before completing.
  await expect(page.getByTestId('eval-runner-status')).toContainText('Running');
  await expect(page.getByRole('button', { name: /Running/ })).toBeDisabled();
  await expect(page.getByTestId('eval-runner-status')).toContainText('Completed');
  await expect(page.getByTestId('eval-run-result-summary')).toContainText(
    'Proposed release v19 overall 1.00 vs Current release v18 0.87 (+0.13 overall)'
  );

  await page.getByRole('button', { name: /Export CSV/i }).click();
  await expect(page.getByTestId('csv-preview-modal')).toContainText('run_id');
  await expect(page.getByTestId('csv-preview-modal')).toContainText('run_v19_candidate');
  await expect(page.getByTestId('csv-preview-modal')).toContainText('does not include customer identifiers');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download CSV/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('botops-eval-summary.csv');

  await clickQualityTab(page, 'Badcases');
  await expect(page.getByTestId('error-analysis')).toContainText('Account takeover case auto-answered');
  await expect(page.getByTestId('error-analysis')).toContainText('Failed cases requiring product fixes');
  await expect(page.getByTestId('error-analysis')).not.toContainText('Region filter was missing from retrieval config.');
  await page.getByLabel(/Status for Account takeover case auto-answered/i).selectOption('Open');
  await expect(page.getByLabel(/Status for Account takeover case auto-answered/i)).toHaveValue('Open');
  await page.getByRole('button', { name: 'Open record' }).first().click();
  await expect(page.getByTestId('badcase-detail-modal')).toContainText('Region filter was missing from retrieval config.');
  await page.getByRole('button', { name: /Close failure detail/i }).click();
  await expect(page.getByTestId('badcase-detail-modal')).toHaveCount(0);

  await navigateTo(page, 'Tickets & Handoff');
  await expect(page.getByTestId('ticket-center')).toContainText('Security-L2');
  await expect(page.getByTestId('ticket-center')).toContainText('Possible account takeover with transfer on hold');
  await expect(page.getByTestId('ticket-center')).toContainText('Bot-created support cases');
  await expect(page.getByTestId('ticket-center')).toContainText('SLA watch');
  await page.getByRole('button', { name: /Open detail/ }).first().click();
  await expect(page.getByTestId('ticket-detail-panel')).toContainText('Trace reference');
  // The drawer also carries the handoff package for the escalated ticket.
  await expect(page.getByTestId('handoff-preview')).toContainText('Security-L2');
  await closeDrawer(page);
  // Inline status/PIC editing stays on the table rows.
  await page.getByLabel(/Status for SEC-20260701-001/i).selectOption('Resolved');
  await page.getByLabel(/PIC for SEC-20260701-001/i).selectOption('Compliance');
  await expect(page.getByLabel(/Status for SEC-20260701-001/i)).toHaveValue('Resolved');
  await expect(page.getByLabel(/PIC for SEC-20260701-001/i)).toHaveValue('Compliance');
  await navigateTo(page, 'Dashboard');
  // Cross-view sync: resolving the ticket moves the dashboard counters.
  await expect(page.getByTestId('pm-dashboard')).toContainText('0 high-risk cases');
  await page.getByRole('button', { name: /Active support tickets/ }).click();
  await expect(page.getByTestId('queue-ticket-count')).toHaveText('2 tickets');
  await navigateTo(page, 'Tickets & Handoff');
  await expect(page.getByLabel(/Status for SEC-20260701-001/i)).toHaveValue('Resolved');
  await expect(page.getByLabel(/PIC for SEC-20260701-001/i)).toHaveValue('Compliance');

  await navigateTo(page, 'Quality & Release');
  await expect(page.getByTestId('release-center')).toContainText('Policy release package v19');
  await expect(page.getByTestId('release-center')).toContainText('Policy release package v18');
  await expect(page.getByTestId('release-center')).toContainText('The bot must not answer any high-risk case');
  await page
    .getByLabel(/Decision reason for Policy release package v19/i)
    .fill('Citation and handoff gates passed; ready for canary owner review.');
  await expect(page.getByRole('button', { name: /Promote Policy release package v19/i })).toBeEnabled();
  await page.getByRole('button', { name: /Promote Policy release package v19/i }).click();
  await expect(page.getByTestId('release-decision-rel_mvp_019')).toContainText('Promoted');
  await expect(page.getByTestId('release-decision-rel_mvp_019')).toContainText(
    'Citation and handoff gates passed; ready for canary owner review.'
  );
  await expect(page.getByRole('button', { name: /Promote Policy release package v18/i })).toBeDisabled();
  await page
    .getByLabel(/Decision reason for Policy release package v18/i)
    .fill('High-risk auto-answer gate still blocks rollout.');
  await page.getByRole('button', { name: /Block release Policy release package v18/i }).click();
  await expect(page.getByTestId('release-decision-rel_mvp_018_blocked')).toContainText('Release blocked');
  await expect(page.getByTestId('release-decision-rel_mvp_018_blocked')).toContainText(
    'High-risk auto-answer gate still blocks rollout.'
  );

  await navigateTo(page, 'Conversations');
  await page.getByRole('button', { name: /Review live reply and trace for Account takeover with transfer on hold/i }).click();
  await navigateTo(page, 'Tickets & Handoff');
  // The handoff package now lives inside the ticket detail drawer.
  await page.getByRole('button', { name: /Open detail/ }).first().click();
  await expect(page.getByTestId('handoff-preview')).toContainText('Security-L2');
  await expect(page.getByTestId('handoff-preview')).toContainText('Do not approve or override');
  await closeDrawer(page);

  await navigateTo(page, 'Quality & Release');
  await clickQualityTab(page, 'Audit');
  await expect(page.getByTestId('ops-log')).toContainText('Completed offline eval run');
  await expect(page.getByTestId('ops-log')).toContainText('Exported eval summary CSV');
  await expect(page.getByTestId('ops-log')).toContainText('Promoted release bundle');
  await expect(page.getByTestId('ops-log')).toContainText('Blocked release bundle');
  await expect(page.getByTestId('ops-log')).toContainText('Citation and handoff gates passed; ready for canary owner review.');
  await page.getByRole('button', { name: 'Release decision' }).click();
  await expect(page.getByTestId('ops-log')).toContainText('Promoted release bundle');
  await expect(page.getByTestId('ops-log')).toContainText('Blocked release bundle');
  await expect(page.getByTestId('ops-log')).toContainText('High-risk auto-answer gate still blocks rollout.');
  await expect(page.getByTestId('ops-log')).not.toContainText('Exported eval summary CSV');
  await page.getByRole('button', { name: 'CSV export' }).click();
  await expect(page.getByTestId('ops-log')).toContainText('Exported eval summary CSV');
});

test('knowledge gap mining and SOP workflows govern the FAQ lifecycle', async ({ page }) => {
  await page.goto('/');

  await navigateTo(page, 'Knowledge', true);
  await page.getByRole('tab', { name: 'Gap mining' }).click();
  await expect(page.getByTestId('gap-mining')).toBeVisible();
  await expect(page.getByTestId('gap-mining')).toContainText('JP cross-border policy exception questions');
  await expect(page.getByTestId('gap-mining')).toContainText('Transfer delay surge follow-ups');

  // Cluster rows open the detail drawer; review actions live in its footer.
  await page.getByRole('button', { name: /KYC rejection follow-up questions/ }).click();
  await expect(page.getByTestId('gap-mining')).toContainText(
    'What should I do after my identity verification is rejected?'
  );
  await page.getByRole('button', { name: 'Adopt into KB' }).click();
  await expect(page.getByRole('status')).toContainText('Candidate adopted into the knowledge base');
  await closeDrawer(page);
  // The adoption is reflected on the cluster list immediately after the drawer closes.
  await expect(page.getByRole('button', { name: /KYC rejection follow-up questions/ })).toContainText('Adopted');

  await page.getByRole('button', { name: /Transfer delay surge follow-ups/ }).click();
  await expect(page.getByTestId('gap-mining')).toContainText('Deflection tracking');
  await expect(page.getByTestId('gap-mining')).toContainText('58%');
  await closeDrawer(page);

  // Adopted candidate materializes as a Draft document in the inventory.
  await page.getByRole('tab', { name: 'Knowledge inventory' }).click();
  const adoptedRow = page.getByTestId('knowledge-row-doc_faq_kyc_followup_003');
  await expect(adoptedRow).toContainText('What should I do after my identity verification is rejected?');
  await expect(adoptedRow).toContainText('Draft');

  // Queue re-index from the table action: row, record pill, and tiles update together.
  await expect(page.getByTestId('reindex-count-tile')).toContainText('1');
  await page.getByRole('button', { name: /Re-index Global transfer FAQ/ }).click();
  await expect(page.getByTestId('knowledge-row-doc_global_transfer_faq_v4')).toContainText('Index queued');
  await expect(page.getByTestId('reindex-count-tile')).toContainText('0');
  await expect(page.getByTestId('index-queued-tile')).toContainText('1');

  // The retrieval policy explainer moved into a small dialog next to the table heading.
  await page.getByTestId('retrieval-policy-button').click();
  await expect(page.getByTestId('retrieval-policy-modal')).toContainText('Grounding controls');
  await page.getByRole('button', { name: 'Close retrieval policy' }).click();
  await expect(page.getByTestId('retrieval-policy-modal')).toHaveCount(0);

  // Open record opens the drawer; the evidence block shows only that document's chunks.
  await page.getByRole('button', { name: /Open record Global transfer FAQ/ }).click();
  await expect(page.getByTestId('knowledge-record-panel')).toContainText('Index queued');
  await expect(page.getByTestId('drawer-panel')).toContainText('Global transfer FAQ');
  await expect(page.getByTestId('chunk-evidence-panel')).toContainText('chunk_global_transfer_001');
  await expect(page.getByTestId('chunk-evidence-panel')).not.toContainText('chunk_payment_policy_eu_001');
  await page.getByRole('button', { name: 'Open chunks' }).click();
  await expect(
    page.getByTestId('chunk-evidence-panel').locator('.chunk-preview.highlighted')
  ).toContainText('chunk_global_transfer_001');

  // Citation scope review toggles a visible pill on the record.
  await page.getByRole('button', { name: 'Review citation scope' }).click();
  await expect(page.getByTestId('citation-review-pill')).toContainText('Citation review requested');
  await page.getByRole('button', { name: 'Cancel citation review' }).click();
  await expect(page.getByTestId('citation-review-pill')).toHaveCount(0);
  await closeDrawer(page);

  await page.getByRole('tab', { name: 'SOP', exact: true }).click();
  await expect(page.getByTestId('sop-management')).toBeVisible();
  await page.getByRole('button', { name: /Account takeover freeze handling/ }).click();
  await expect(page.getByTestId('sop-step-forbidden')).toContainText('Automation forbidden');
  await expect(page.getByTestId('sop-step-forbidden')).toContainText(
    'Decide on asset movement: refund, unlock, or transfer approval.'
  );
  await expect(page.getByTestId('sop-management')).toContainText('Needs human confirm');
  await closeDrawer(page);

  await navigateTo(page, 'Quality & Release');
  await clickQualityTab(page, 'Audit');
  await expect(page.getByTestId('ops-log')).toContainText('Adopted FAQ candidate into knowledge base');
  await expect(page.getByTestId('ops-log')).toContainText('Queued knowledge re-index');

  // Knowledge state survives a full reload (localStorage persistence).
  await page.reload();
  await navigateTo(page, 'Knowledge', true);
  await expect(page.getByTestId('knowledge-row-doc_global_transfer_faq_v4')).toContainText('Index queued');
  await expect(page.getByTestId('knowledge-row-doc_faq_kyc_followup_003')).toContainText('Draft');
});

test('agent assist governance flags a badcase into the quality loop', async ({ page }) => {
  await page.goto('/');

  await navigateTo(page, 'Agent Assist');
  await expect(page.getByTestId('agent-assist')).toContainText('Suggestion adoption');
  await expect(page.getByTestId('agent-assist')).toContainText('Edit distance distribution');
  await expect(page.getByTestId('agent-assist')).toContainText('AI summary rewrite rate');
  await expect(page.getByTestId('agent-assist')).toContainText('Handle time gap');
  await expect(page.getByTestId('assist-policy-hints')).toContainText('General Support');

  await page.getByRole('button', { name: 'Discarded', exact: true }).click();
  await expect(page.getByTestId('agent-assist')).toContainText('3 records');
  await page.getByRole('button', { name: /case_kyc_20260701_041/ }).click();
  await expect(page.getByTestId('assist-suggestion-detail')).toContainText('AI suggested reply');
  await expect(page.getByTestId('assist-suggestion-detail')).toContainText(
    'The rejection was caused by an unreadable document photo.'
  );

  await page.getByRole('button', { name: /Flag as badcase/ }).click();
  await expect(page.getByTestId('assist-suggestion-detail')).toContainText(
    'It is now visible in Quality → Badcases and recorded in the audit log.'
  );
  await expect(page.getByRole('button', { name: /Flag as badcase/ })).toBeDisabled();
  await closeDrawer(page);

  await navigateTo(page, 'Quality & Release');
  await clickQualityTab(page, 'Badcases');
  await expect(page.getByTestId('error-analysis')).toContainText(
    'Low-quality assist suggestion on case_kyc_20260701_041'
  );
  await clickQualityTab(page, 'Audit');
  await expect(page.getByTestId('ops-log')).toContainText('Flagged assist suggestion as badcase');
});

test('release center exposes the flow version diff behind view changes', async ({ page }) => {
  await page.goto('/');

  await navigateTo(page, 'Quality & Release');
  await expect(page.getByLabel(/Decision reason for Policy release package v18/i)).toHaveValue(
    /removed Human Handoff/
  );
  await page.getByRole('button', { name: /View changes for Policy release package v18/ }).click();
  const diff = page.getByTestId('flow-diff-rel_mvp_018_blocked');
  await expect(diff).toBeVisible();
  await expect(diff).toContainText('Current release v17');
  await expect(diff).toContainText('Proposed release v18');
  await expect(diff.getByTestId('flow-node-removed')).toContainText('Human Handoff');
  await expect(diff.getByTestId('flow-node-removed')).toContainText('removed');
  await expect(diff.getByTestId('flow-node-modified')).toContainText('Answer Generation');
  await expect(diff).toContainText('Escalation instruction was dropped, which caused the handoff safety regression.');

  await page.getByRole('button', { name: /View changes for Policy release package v18/ }).click();
  await expect(page.getByTestId('flow-diff-rel_mvp_018_blocked')).toHaveCount(0);
});

test('judge calibration flags low-agreement judges and pending review runs', async ({ page }) => {
  await page.goto('/');

  await navigateTo(page, 'Quality & Release');
  await clickQualityTab(page, 'Eval Runs');
  await expect(page.getByTestId('judge-calibration-panel')).toBeVisible();
  await expect(page.getByTestId('judge-cal-judge_policy_v03')).toContainText('Calibrated');
  const lowCard = page.getByTestId('judge-cal-judge_policy_v02');
  await expect(lowCard).toContainText('Below threshold');
  await expect(lowCard).toContainText('0.79');
  await expect(lowCard).toContainText('Drift alert');
  await expect(page.getByTestId('judge-review-warning-judge_policy_v02')).toContainText(
    'must not be used as a release basis'
  );
  await expect(page.getByTestId('pending-human-review-run_v17_legacy')).toContainText('Pending human review');
  await expect(page.getByTestId('pending-human-review-run_v19_candidate')).toHaveCount(0);
});

test('dashboard economics cards recalculate from editable assumptions', async ({ page }) => {
  await page.goto('/');

  const economics = page.getByTestId('economics-panel');
  await expect(economics.getByTestId('econ-card-cost')).toContainText('Cost per auto-resolved ticket');
  await expect(economics.getByTestId('econ-card-deflection')).toContainText('Deflection saved hours');
  await expect(economics.getByTestId('econ-card-badcase')).toContainText('Badcase repair payback');
  await expect(page.getByTestId('econ-cost-value')).toHaveText('$0.42');
  await expect(page.getByTestId('econ-deflection-value')).toHaveText('348 h');
  await expect(page.getByTestId('econ-badcase-value')).toHaveText('$432');

  await page.getByTestId('econ-assumptions-toggle').click();
  await expect(page.getByTestId('econ-assumptions-panel')).toBeVisible();
  await page.getByLabel('Human minutes per ticket').fill('6');
  await expect(page.getByTestId('econ-deflection-value')).toHaveText('174 h');
  await expect(economics.getByTestId('econ-card-cost')).toContainText('$2.40');
  await expect(page.getByTestId('econ-badcase-value')).toHaveText('$216');
});

test('zh-TW locale covers the new modules end to end', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '切換語言為繁體中文' }).click();

  await expect(page.getByTestId('economics-panel')).toContainText('營運經濟學');
  await expect(page.getByTestId('econ-deflection-value')).toHaveText('348 小時');
  // Task-oriented workspace subtitle and seed-mode explanation are localized.
  await expect(page.getByText('掌握 bot 營運現況，決定今天優先處理什麼。')).toBeVisible();
  await expect(page.getByTestId('econ-seed-note')).toContainText('seed 模式＝以本地示範資料計算的估算值');

  await navigateTo(page, '對話審查');
  await expect(page.getByText('檢查 bot 已送出回覆的品質，把問題轉成評測案例。')).toBeVisible();
  await expect(page.getByText('多來源訊號接收')).toBeVisible();
  await expect(page.getByText('已送出回覆清單')).toBeVisible();

  // The zh-TW review layer opens with a localized breadcrumb and returns to the list.
  await page.getByRole('button', { name: /檢視 法國跨境付款政策暫停 的回覆與處理紀錄/ }).click();
  await expect(page.getByTestId('conversation-review-layer')).toBeVisible();
  await expect(page.getByRole('navigation', { name: '導覽路徑' })).toContainText('對話審查');
  await expect(page.getByRole('navigation', { name: '導覽路徑' })).toContainText('法國跨境付款政策暫停');
  await expect(page.getByTestId('live-reply-review')).toContainText('互動紀錄');
  await page.getByRole('button', { name: '返回清單' }).click();
  await expect(page.getByTestId('conversation-list-layer')).toBeVisible();
  await expect(page.getByTestId('scenario-list')).toContainText('法國跨境付款政策暫停');

  await navigateTo(page, '座席輔助');
  await expect(page.getByTestId('agent-assist')).toContainText('建議採納率');
  await expect(page.getByTestId('agent-assist')).toContainText('AI 摘要重寫率');
  await expect(page.getByTestId('agent-assist')).toContainText('分布明細：無修改');

  await navigateTo(page, '知識治理');
  await page.getByRole('tab', { name: '缺口挖掘' }).click();
  await expect(page.getByTestId('gap-mining')).toContainText('日本跨境付款政策例外問題');
  // The cluster drawer opens from the row; review actions sit in its footer.
  await page.getByRole('button', { name: /日本跨境付款政策例外問題/ }).click();
  await page.getByRole('button', { name: '採納入庫' }).click();
  await expect(page.getByRole('status')).toContainText('候選已採納入庫');
  await closeDrawer(page);
  await page.getByRole('tab', { name: 'SOP 管理' }).click();
  await page.getByRole('button', { name: /帳號盜用凍結處理/ }).click();
  await expect(page.getByTestId('sop-step-forbidden')).toContainText('禁止自動化');
  await closeDrawer(page);

  await navigateTo(page, '品質與發布');
  await expect(page.getByText('用評測證據守住每一次發布。')).toBeVisible();
  await clickQualityTab(page, '評測批次');
  await expect(page.getByTestId('evaluation-center')).toContainText('分數區間 0–1，1 為滿分。');
  await expect(page.getByTestId('pending-human-review-run_v17_legacy')).toContainText('待人工複核');
  await expect(page.getByTestId('judge-review-warning-judge_policy_v02')).toContainText('不得作為發布依據');
  await clickQualityTab(page, '發布門檻');
  await page.getByRole('button', { name: /檢視 政策發布套件 v18 變更/ }).click();
  const diff = page.getByTestId('flow-diff-rel_mvp_018_blocked');
  await expect(diff.getByTestId('flow-node-removed')).toContainText('人工交接');
  await expect(diff.getByTestId('flow-node-removed')).toContainText('移除');

  // Dynamic audit events are stored bilingually and render fully in zh-TW.
  await clickQualityTab(page, '稽核');
  await expect(page.getByTestId('ops-log')).toContainText('營運資料已同步');
  await expect(page.getByTestId('ops-log')).toContainText('已採納 FAQ 候選入庫');
  await expect(page.getByTestId('ops-log')).toContainText(
    '重複問題「日本跨境付款政策例外問題」的 FAQ 候選已採納入知識庫'
  );
  // Audit list times follow the zh-TW clock format instead of English AM/PM.
  await expect(page.getByTestId('ops-log').locator('.audit-list time').first()).not.toContainText(/AM|PM/);
});

async function clickQualityTab(page: Page, name: string | RegExp) {
  await page.getByRole('tab', { name }).click();
}

/** Closes the shared detail drawer so the page underneath becomes interactive again. */
async function closeDrawer(page: Page) {
  await page.getByRole('button', { name: /Close panel|關閉面板/ }).click();
  await expect(page.getByTestId('drawer-panel')).toHaveCount(0);
}

async function navigateTo(page: Page, name: string | RegExp, exact = false) {
  const menuButton = page.getByRole('button', { name: /Open navigation menu|開啟導覽選單/ });
  if (await menuButton.isVisible().catch(() => false)) {
    await menuButton.click();
  }
  // Scoped to the sidebar: dashboard metric cards carry module names in their labels.
  await page.locator('.sidebar').getByRole('button', { name, exact }).click();
}

async function expectLocalizedNav(page: Page) {
  const menuButton = page.getByRole('button', { name: /Open navigation menu|開啟導覽選單/ });
  if (await menuButton.isVisible().catch(() => false)) {
    await menuButton.click();
    await expect(page.locator('.sidebar').getByRole('button', { name: '對話審查' })).toBeVisible();
    await page.getByRole('button', { name: /Close navigation menu|關閉導覽選單/ }).first().click();
    return;
  }
  await expect(page.locator('.sidebar').getByRole('button', { name: '對話審查' })).toBeVisible();
}

async function expectOverviewFirstAndActive(page: Page) {
  const menuButton = page.getByRole('button', { name: /Open navigation menu|開啟導覽選單/ });
  if (await menuButton.isVisible().catch(() => false)) {
    await menuButton.click();
    const navItems = page.locator('.sidebar.open .nav-button');
    await expect(navItems.first()).toContainText('Dashboard');
    await expect(page.getByRole('button', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
    await page.getByRole('button', { name: /Close navigation menu|關閉導覽選單/ }).first().click();
    return;
  }

  const navItems = page.locator('.sidebar .nav-button');
  await expect(navItems.first()).toContainText('Dashboard');
  await expect(page.getByRole('button', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
}
