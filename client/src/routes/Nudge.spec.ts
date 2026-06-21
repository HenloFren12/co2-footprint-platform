import { test, expect } from '@playwright/test';

/**
 * e2e/nudge-ripple.spec.ts
 *
 * Covers logging an activity on /nudges, the resulting NudgeCard rendering
 * with the corrected fallback logic (low-impact activities get positive
 * reinforcement, high-impact activities get a swap suggestion), the ripple
 * animation firing on accept, and the counter decrementing.
 *
 * Assumes a beforeEach that completes onboarding via localStorage seeding
 * or navigates through it, since userId must exist (App.tsx useEffect)
 * before any store-dependent route behaves correctly.
 */

async function completeOnboarding(page: import('@playwright/test').Page) {
  await page.goto('/onboarding');
  await page.getByRole('button', { name: /begin stewardship/i }).click();
  await page.getByRole('button', { name: 'Under 5km' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Mostly plant-based' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Under 100kWh' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Rarely' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe('Nudge OS - Ripple Effect UI', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
    await page.goto('/nudges');
  });

  test('shows the placeholder before any activity is logged', async ({
    page,
  }) => {
    await expect(
      page.getByText('Log an activity to see your ripple effect.')
    ).toBeVisible();
  });

  test('logging a high-impact activity (car) shows a swap-suggestion nudge', async ({
    page,
  }) => {
    await page.getByLabel('Activity type').selectOption('car_petrol_medium_km');
    await page.getByLabel('Quantity').fill('20');
    await page.getByRole('button', { name: /log activity/i }).click();

    await expect(page.getByText(/use transit or cycle/i)).toBeVisible();
  });

  test('logging a low-impact activity (walking) shows positive reinforcement, not a nag', async ({
    page,
  }) => {
    await page.getByLabel('Activity type').selectOption('walking_km');
    await page.getByLabel('Quantity').fill('2');
    await page.getByRole('button', { name: /log activity/i }).click();

    // Below LOW_IMPACT_THRESHOLD_KG (1.0kg), should show encouragement
    await expect(page.getByText(/great choice/i)).toBeVisible();
    await expect(page.getByText(/keep it up/i)).toBeVisible();
  });

  test('an unmapped activity type still produces a nudge card (fallback coverage)', async ({
    page,
  }) => {
    // car_diesel_large_km is NOT in NUDGE_MAP, must hit buildFallbackNudge
    await page.getByLabel('Activity type').selectOption('car_diesel_large_km');
    await page.getByLabel('Quantity').fill('15');
    await page.getByRole('button', { name: /log activity/i }).click();

    await expect(
      page.getByRole('region', { name: 'Carbon nudge suggestion' })
    ).toBeVisible();
  });

  test('accepting a nudge triggers the ripple CSS class on the accept button', async ({
    page,
  }) => {
    await page.getByLabel('Activity type').selectOption('car_petrol_medium_km');
    await page.getByLabel('Quantity').fill('20');
    await page.getByRole('button', { name: /log activity/i }).click();

    const acceptButton = page.getByRole('button', { name: /^accept:/i });
    await acceptButton.click();

    await expect(acceptButton).toHaveClass(/ripple-active/);
  });

  test('the footprint counter decrements after accepting a nudge', async ({
    page,
  }) => {
    await page.getByLabel('Activity type').selectOption('car_petrol_medium_km');
    await page.getByLabel('Quantity').fill('20');
    await page.getByRole('button', { name: /log activity/i }).click();

    const counter = page.getByRole('status');
    const before = await counter.textContent();

    await page.getByRole('button', { name: /^accept:/i }).click();

    // Wait for the RAF-driven counter animation to settle
    await page.waitForTimeout(900);
    const after = await counter.textContent();

    expect(after).not.toEqual(before);
  });

  test('the nudge card does not appear after the daily cap of 3 is reached', async ({
    page,
  }) => {
    for (let i = 0; i < 3; i++) {
      await page.getByLabel('Activity type').selectOption('car_petrol_medium_km');
      await page.getByLabel('Quantity').fill('10');
      await page.getByRole('button', { name: /log activity/i }).click();
      await page.getByRole('button', { name: /maybe later/i }).click();
    }

    await page.getByLabel('Activity type').selectOption('car_petrol_medium_km');
    await page.getByLabel('Quantity').fill('10');
    await page.getByRole('button', { name: /log activity/i }).click();

    await expect(
      page.getByText('Log an activity to see your ripple effect.')
    ).toBeVisible();
  });

  test('dismissing a nudge returns to the placeholder state', async ({
    page,
  }) => {
    await page.getByLabel('Activity type').selectOption('car_petrol_medium_km');
    await page.getByLabel('Quantity').fill('20');
    await page.getByRole('button', { name: /log activity/i }).click();
    await page.getByRole('button', { name: /maybe later/i }).click();

    await expect(
      page.getByText('Log an activity to see your ripple effect.')
    ).toBeVisible();
  });
});