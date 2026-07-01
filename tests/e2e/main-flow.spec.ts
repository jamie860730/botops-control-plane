import { expect, test } from '@playwright/test';

test('P0 seed-mode support quality flow works end to end', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /BotOps Control Plane/i })).toBeVisible();
  await expect(page.getByTestId('support-signal-list')).toContainText('Telegram');

  await page.getByRole('button', { name: '切換語言為繁體中文' }).click();
  await expect(page.getByRole('heading', { name: '客服機器人營運品質控管' })).toBeVisible();
  await expect(page.getByRole('button', { name: '訊號受理' })).toBeVisible();
  await expect(page.getByRole('button', { name: /檢視 FR cross-border payment policy hold 的回覆與 trace/i })).toBeVisible();
  await page.getByRole('button', { name: 'Switch language to English' }).click();

  await page.getByRole('button', { name: 'Overview' }).click();
  await expect(page.getByText('Review quality gates and coverage before entering case-level work.')).toBeVisible();
  await expect(page.getByText('Functional coverage across the bot governance loop')).toBeVisible();
  await expect(page.getByText('Supports governance and backend audit logging readiness')).toBeVisible();

  await page.getByRole('button', { name: 'Signal Intake' }).click();
  await page.getByRole('button', { name: 'Telegram' }).click();
  await expect(page.getByTestId('scenario-list')).toContainText('FR cross-border payment policy hold');

  await page.getByRole('button', { name: /Review live reply and trace for FR cross-border payment policy hold/i }).click();
  await expect(page.getByTestId('live-reply-review')).toContainText('Why is my transfer on hold');
  await expect(page.getByTestId('live-reply-review')).toContainText('Your transfer may require cross-border payment policy');
  await expect(page.getByTestId('live-reply-review')).toContainText('If the issue involves a suspicious transfer');

  await expect(page.getByTestId('trace-panel')).toContainText('Source Normalization');
  await expect(page.getByTestId('trace-panel')).toContainText('Metadata Retrieval');
  await expect(page.getByTestId('trace-panel')).toContainText('Verification Gate');

  await page.getByRole('button', { name: /Open citation chunk_payment_policy_eu_001/i }).click();
  await expect(page.getByTestId('highlighted-citation')).toContainText('cross-border payment policy requirements');

  await page.getByRole('button', { name: /Save trace as eval case/i }).click();
  await expect(page.getByTestId('eval-save-status')).toContainText('eval_saved_scn_cross_border_payment_fr');

  await page.getByRole('button', { name: 'Evaluation' }).click();
  await expect(page.getByTestId('evaluation-center')).toContainText('v19 candidate');
  await expect(page.getByTestId('evaluation-center')).toContainText('Handoff Safety Recall');
  await page.getByRole('button', { name: /Run offline eval/i }).click();
  await expect(page.getByTestId('eval-runner-status')).toContainText('Completed');

  await page.getByRole('button', { name: /Export CSV/i }).click();
  await expect(page.getByTestId('csv-preview-modal')).toContainText('run_id');
  await expect(page.getByTestId('csv-preview-modal')).toContainText('run_v19_candidate');
  await expect(page.getByTestId('csv-preview-modal')).toContainText('does not include customer identifiers');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download CSV/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('botops-eval-summary.csv');

  await page.getByRole('button', { name: 'Error Analysis' }).click();
  await expect(page.getByTestId('error-analysis')).toContainText('Account takeover case auto-answered');

  await page.getByRole('button', { name: 'Release Center' }).click();
  await expect(page.getByText('Promote, block, or request review based on visible release gates.')).toBeVisible();
  await expect(page.getByTestId('release-center')).toContainText('v18 baseline unsafe bundle');
  await expect(page.getByTestId('release-center')).toContainText('High-risk auto-answer rate must be 0');
  await expect(page.getByRole('button', { name: 'Promote' }).first()).toBeEnabled();
  await page.getByRole('button', { name: 'Promote' }).first().click();
  await expect(page.getByTestId('release-decision-rel_mvp_019')).toContainText('Promoted to canary review');
  await expect(page.getByRole('button', { name: 'Promote' }).nth(1)).toBeDisabled();
  await page.getByRole('button', { name: /Block release/i }).nth(1).click();
  await expect(page.getByTestId('release-decision-rel_mvp_018_blocked')).toContainText('Release blocked');

  await page.getByRole('button', { name: 'Signal Intake' }).click();
  await page.getByRole('button', { name: /Review live reply and trace for Account takeover with transfer on hold/i }).click();
  await page.getByRole('button', { name: 'Handoff', exact: true }).click();
  await expect(page.getByTestId('handoff-preview')).toContainText('Security-L2');
  await expect(page.getByTestId('handoff-preview')).toContainText('Do not approve or override');

  await page.getByRole('button', { name: 'Audit Log' }).click();
  await expect(page.getByTestId('ops-log')).toContainText('Completed offline eval run');
  await expect(page.getByTestId('ops-log')).toContainText('Exported eval summary CSV');
  await expect(page.getByTestId('ops-log')).toContainText('Promoted release bundle');
  await expect(page.getByTestId('ops-log')).toContainText('Blocked release bundle');
  await page.getByRole('button', { name: 'Release decision' }).click();
  await expect(page.getByTestId('ops-log')).toContainText('Promoted release bundle');
  await expect(page.getByTestId('ops-log')).toContainText('Blocked release bundle');
  await expect(page.getByTestId('ops-log')).not.toContainText('Exported eval summary CSV');
  await page.getByRole('button', { name: 'CSV export' }).click();
  await expect(page.getByTestId('ops-log')).toContainText('Exported eval summary CSV');
});
