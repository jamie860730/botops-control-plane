import { expect, type Page, test } from '@playwright/test';

/**
 * Captures the v2 core screens for the portfolio into output/playwright/.
 * Runs on the desktop project only (1440px viewport); the mobile project skips it.
 */
test.describe('portfolio screenshots', () => {
  test.skip(({ isMobile }) => Boolean(isMobile), 'desktop-only portfolio captures');

  test('capture v2 core screens', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('economics-panel')).toBeVisible();
    await expect(page.getByTestId('econ-cost-value')).toHaveText('$0.42');
    await capture(page, 'v2-dashboard.png');

    await page.getByRole('button', { name: 'Knowledge', exact: true }).click();
    await page.getByRole('tab', { name: 'Gap mining' }).click();
    await expect(page.getByTestId('gap-mining')).toBeVisible();
    await capture(page, 'v2-gap-mining.png');

    await page.getByRole('tab', { name: 'SOP', exact: true }).click();
    // SOP details open in the shared drawer; capture it, then close before navigating on.
    await page.getByRole('button', { name: /Account takeover freeze handling/ }).click();
    await expect(page.getByTestId('sop-step-forbidden')).toBeVisible();
    await capture(page, 'v2-sop.png');
    await page.getByRole('button', { name: 'Close panel' }).click();

    await page.getByRole('button', { name: 'Agent Assist' }).click();
    await expect(page.getByTestId('agent-assist')).toContainText('Suggestion adoption');
    await capture(page, 'v2-agent-assist.png');

    await page.getByRole('button', { name: 'Quality & Release' }).click();
    await page.getByRole('button', { name: /View changes for Policy release package v18/ }).click();
    await expect(page.getByTestId('flow-diff-rel_mvp_018_blocked')).toBeVisible();
    await page.getByTestId('flow-diff-rel_mvp_018_blocked').scrollIntoViewIfNeeded();
    await capture(page, 'v2-flow-diff.png');

    await page.getByRole('tab', { name: 'Eval Runs' }).click();
    await expect(page.getByTestId('judge-calibration-panel')).toBeVisible();
    await expect(page.getByTestId('pending-human-review-run_v17_legacy')).toBeVisible();
    await capture(page, 'v2-eval-judge.png');
  });
});

async function capture(page: Page, fileName: string) {
  await page.screenshot({ path: `output/playwright/${fileName}`, fullPage: true });
}
