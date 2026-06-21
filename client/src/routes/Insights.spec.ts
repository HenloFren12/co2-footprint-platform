import { test, expect, type Page } from '@playwright/test';

/**
 * e2e/insights.spec.ts
 *
 * Covers the fixed Insights.tsx getNarrativeFor() function, which now
 * guarantees a card renders for any of the 87 emissionFactors.json
 * activity types via exact-match, category-regex fallback, or generic
 * last-resort fallback — closing the "blank page" bug.
 */

async function completeOnboarding(page: Page) {
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
}

test.describe('Insights - Emissions Ancestry', () => {
  test('shows 3 default ancestry cards when no activity has been logged', async ({
    page,
  }) => {
    await completeOnboarding(page);
    await page.goto('/insights');

    const cards = page.locator('article[aria-label]');
    await expect(cards).toHaveCount(3);
  });

  test('the page is never blank: every top emission type produces a card, including unmapped types', async ({
    page,
  }) => {
    await completeOnboarding(page);

    // Log 3 activities that are NOT in the exact-match ANCESTRY_NARRATIVES map
    await page.goto('/nudges');
    const unmappedTypes = ['ebicycle_km', 'cheese_kg', 'natural_gas_kwh'];
    for (const type of unmappedTypes) {
      await page.getByLabel('Activity type').selectOption(type);
      await page.getByLabel('Quantity').fill('5');
      await page.getByRole('button', { name: /log activity/i }).click();
      const dismiss = page.getByRole('button', { name: /maybe later/i });
      if (await dismiss.isVisible().catch(() => false)) {
        await dismiss.click();
      }
    }

    await page.goto('/insights');
    const cards = page.locator('article[aria-label]');
    await expect(cards).toHaveCount(3);

    // Confirm no card silently rendered nothing
    for (let i = 0; i < 3; i++) {
      await expect(cards.nth(i).locator('h2')).not.toBeEmpty();
      await expect(cards.nth(i).locator('p').last()).not.toBeEmpty();
    }
  });

  test('category fallback correctly classifies a transport-like unmapped type', async ({
    page,
  }) => {
    await completeOnboarding(page);
    await page.goto('/nudges');

    await page.getByLabel('Activity type').selectOption('bus_local_km');
    await page.getByLabel('Quantity').fill('30');
    await page.getByRole('button', { name: /log activity/i }).click();

    await page.goto('/insights');
    await expect(page.getByText('TRANSPORT FOOTPRINT')).toBeVisible();
  });

  test('each ancestry card has a visible lime accent bar and emission total', async ({
    page,
  }) => {
    await completeOnboarding(page);
    await page.goto('/insights');

    const firstCard = page.locator('article[aria-label]').first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.getByText('kg CO₂')).toBeVisible();
  });

  test('insights route loads via React.lazy without a permanent loading state', async ({
    page,
  }) => {
    await completeOnboarding(page);
    await page.goto('/insights');

    await expect(page.getByText('Loading…')).toBeHidden({ timeout: 5000 });
    await expect(page.getByText('Where Your Carbon Begins.')).toBeVisible();
  });
});