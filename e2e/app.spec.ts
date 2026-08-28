import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const projectName = 'Demo: Northstar Studio website';

test('creates and exports a synthetic evidence pack', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Leave a clear record/i })).toBeVisible();

  await page.getByRole('button', { name: /Load synthetic demo/i }).click();
  await expect(page.getByLabel('Project name')).toHaveValue(projectName);
  await expect(page.getByText(/flagged blocker/i)).toBeVisible();

  const firstCheck = page.getByTestId('check-card').first();
  await firstCheck.getByRole('button', { name: 'pass' }).click();
  await firstCheck.locator('input[type="file"]').setInputFiles({ name: 'proof.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
  await expect(firstCheck.getByText(/computed locally/i)).toBeVisible();

  const jsonDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const json = await jsonDownload;
  await expect(json.suggestedFilename()).toMatch(/demo-northstar-studio-website\.signoffkit\.json/);
  const jsonPath = await json.path();
  if (!jsonPath) throw new Error('JSON download path was unavailable.');
  const pack = JSON.parse(await readFile(jsonPath, 'utf8'));
  expect(pack.checks[0].status).toBe('pass');
  expect(pack.checks[0].evidence[0].sha256).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');

  await page.getByLabel('Import JSON file').setInputFiles(jsonPath);
  await expect(page.getByRole('status')).toContainText('Pack imported');
  await expect(page.getByText(/unverified after import/i)).toBeVisible();

  const htmlDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export HTML report' }).click();
  const html = await htmlDownload;
  await expect(html.suggestedFilename()).toMatch(/demo-northstar-studio-website-evidence\.html/);
  const htmlPath = await html.path();
  if (!htmlPath) throw new Error('HTML download path was unavailable.');
  const report = await readFile(htmlPath, 'utf8');
  expect(report).toContain(projectName);
  expect(report).toContain('declared value, not verified after import');
  expect(report).toContain("default-src 'none'");
});

test('loads the scope-change workflow and legal boundaries', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Scope Change/ }).click();
  await expect(page.locator('input[value="Original scope"]')).toBeVisible();
  await expect(page.locator('input[value="Added fee"]')).toBeVisible();
  await expect(page.locator('input[value="Revised delivery date"]')).toBeVisible();
  await expect(page.getByText(/not legal signatures or timestamps/i)).toBeVisible();
});
