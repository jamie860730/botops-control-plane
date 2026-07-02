import { expect, type Page, test } from '@playwright/test';

test('support quality operations flow works end to end', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /BotOps Control Plane/i })).toBeVisible();
  await expect(page.getByText('Stable IDs enforced')).toHaveCount(0);
  await expect(page.getByText('Offline eval ready')).toHaveCount(0);
  await expect(page.getByText('Live Bot P2')).toHaveCount(0);
  await expectOverviewFirstAndActive(page);
  await expect(page.getByText('Queues requiring operational attention')).toBeVisible();

  await page.getByRole('button', { name: '切換語言為繁體中文' }).click();
  await expect(page.getByRole('heading', { name: '總覽' })).toBeVisible();
  await expectLocalizedNav(page);
  await expect(page.getByText('需要營運處理的隊列')).toBeVisible();
  await page.getByRole('button', { name: 'Switch language to English' }).click();

  await navigateTo(page, 'Overview');
  await expect(page.getByText('Quality gates for support automation')).toBeVisible();
  await expect(page.getByText('Signals awaiting review')).toBeVisible();
  await expect(page.getByText('Blocked releases')).toBeVisible();

  await navigateTo(page, 'Signal Intake');
  await expect(page.getByTestId('support-signal-list')).toContainText('Telegram');
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

  await navigateTo(page, 'CS Bot KPI');
  await expect(page.getByTestId('cs-bot-kpi')).toContainText('Auto-resolution rate');
  await expect(page.getByTestId('cs-bot-kpi')).toContainText('Repeat contact rate');
  await expect(page.getByTestId('cs-bot-kpi')).toContainText('Account security cases');
  await expect(page.getByTestId('cs-bot-kpi')).toContainText('Keep high-risk auto-answer at zero');

  await navigateTo(page, 'Evaluation');
  await expect(page.getByTestId('evaluation-center')).toContainText('Proposed release v19');
  await expect(page.getByTestId('evaluation-center')).toContainText('Handoff Safety Recall');
  await page.getByRole('button', { name: /Run evaluation/i }).click();
  await expect(page.getByTestId('eval-runner-status')).toContainText('Completed');

  await page.getByRole('button', { name: /Export CSV/i }).click();
  await expect(page.getByTestId('csv-preview-modal')).toContainText('run_id');
  await expect(page.getByTestId('csv-preview-modal')).toContainText('run_v19_candidate');
  await expect(page.getByTestId('csv-preview-modal')).toContainText('does not include customer identifiers');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download CSV/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('botops-eval-summary.csv');

  await navigateTo(page, 'Error Analysis');
  await expect(page.getByTestId('error-analysis')).toContainText('Account takeover case auto-answered');
  await expect(page.getByTestId('error-analysis')).toContainText('Generated from low-scoring evaluation rows');
  await expect(page.getByTestId('error-analysis')).not.toContainText('Region filter was missing from retrieval config.');
  await page.getByLabel(/Admin status for Account takeover case auto-answered/i).selectOption('Open');
  await expect(page.getByLabel(/Admin status for Account takeover case auto-answered/i)).toHaveValue('Open');
  await page.getByRole('button', { name: 'View detail' }).first().click();
  await expect(page.getByTestId('badcase-detail-modal')).toContainText('Region filter was missing from retrieval config.');
  await page.getByRole('button', { name: /Close failure detail/i }).click();
  await expect(page.getByTestId('badcase-detail-modal')).toHaveCount(0);

  await navigateTo(page, 'Ticket Center');
  await expect(page.getByTestId('ticket-center')).toContainText('Security-L2');
  await expect(page.getByTestId('ticket-center')).toContainText('Possible account takeover with transfer on hold');
  await expect(page.getByTestId('ticket-center')).toContainText('Next action');
  await expect(page.getByTestId('ticket-center')).toContainText('SLA watch');

  await navigateTo(page, 'Release Center');
  await expect(page.getByTestId('release-center')).toContainText('Policy release package v19');
  await expect(page.getByTestId('release-center')).toContainText('Policy release package v18');
  await expect(page.getByTestId('release-center')).toContainText('High-risk auto-answer rate must be 0');
  await expect(page.getByRole('button', { name: /Promote Policy release package v19/i })).toBeEnabled();
  await page.getByRole('button', { name: /Promote Policy release package v19/i }).click();
  await expect(page.getByTestId('release-decision-rel_mvp_019')).toContainText('Promoted to canary review');
  await expect(page.getByRole('button', { name: /Promote Policy release package v18/i })).toBeDisabled();
  await page.getByRole('button', { name: /Block release Policy release package v18/i }).click();
  await expect(page.getByTestId('release-decision-rel_mvp_018_blocked')).toContainText('Release blocked');

  await navigateTo(page, 'Signal Intake');
  await page.getByRole('button', { name: /Review live reply and trace for Account takeover with transfer on hold/i }).click();
  await navigateTo(page, 'Handoff', true);
  await expect(page.getByTestId('handoff-preview')).toContainText('Security-L2');
  await expect(page.getByTestId('handoff-preview')).toContainText('Do not approve or override');

  await navigateTo(page, 'Audit Log');
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

async function navigateTo(page: Page, name: string | RegExp, exact = false) {
  const menuButton = page.getByRole('button', { name: /Open navigation menu|開啟導覽選單/ });
  if (await menuButton.isVisible().catch(() => false)) {
    await menuButton.click();
  }
  await page.getByRole('button', { name, exact }).click();
}

async function expectLocalizedNav(page: Page) {
  const menuButton = page.getByRole('button', { name: /Open navigation menu|開啟導覽選單/ });
  if (await menuButton.isVisible().catch(() => false)) {
    await menuButton.click();
    await expect(page.getByRole('button', { name: '訊號受理' })).toBeVisible();
    await page.getByRole('button', { name: /Close navigation menu|關閉導覽選單/ }).first().click();
    return;
  }
  await expect(page.getByRole('button', { name: '訊號受理' })).toBeVisible();
}

async function expectOverviewFirstAndActive(page: Page) {
  const menuButton = page.getByRole('button', { name: /Open navigation menu|開啟導覽選單/ });
  if (await menuButton.isVisible().catch(() => false)) {
    await menuButton.click();
    const navItems = page.locator('.sidebar.open .nav-button');
    await expect(navItems.first()).toContainText('Overview');
    await expect(page.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
    await page.getByRole('button', { name: /Close navigation menu|關閉導覽選單/ }).first().click();
    return;
  }

  const navItems = page.locator('.sidebar .nav-button');
  await expect(navItems.first()).toContainText('Overview');
  await expect(page.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
}
