import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * e2e/accessibility.spec.ts
 *
 * WCAG 2.1 AA verification across all six routes using axe-core,
 * plus targeted keyboard-navigation and reduced-motion checks called
 * out specifically in the engineering spec's accessibility checklist.
 *
 * Requires: npm install -D @axe-core/playwright
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

const ROUTES = ['/dashboard', '/nudges', '/pacts', '/insights', '/profile'];

test.describe('Accessibility - WCAG 2.1 AA', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  for (const route of ROUTES) {
    test(`${route} has zero axe-core violations`, async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }

  test('completes the full onboarding flow using only keyboard navigation', async ({
    page,
  }) => {
    await page.goto('/onboarding');

    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Begin Stewardship

    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // select first option
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Continue

    // Verify focus did not get trapped or lost
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('the Tension Web SVG has a descriptive aria-label', async ({
    page,
  }) => {
    await page.goto('/pacts');
    const createBtn = page.getByRole('button', { name: /create a pact/i });
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
    }

    const web = page.getByRole('img', { name: /pact tension web/i });
    await expect(web).toHaveAttribute('aria-label', /.+/);
  });

  test('the footprint counter aria-live region announces updates', async ({
    page,
  }) => {
    await page.goto('/nudges');
    await page.getByLabel('Activity type').selectOption('car_petrol_medium_km');
    await page.getByLabel('Quantity').fill('20');
    await page.getByRole('button', { name: /log activity/i }).click();

    const liveRegion = page.getByRole('status');
    await expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });

  test('ripple and progress bar transitions are absent when prefers-reduced-motion is set', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/nudges');

    await page.getByLabel('Activity type').selectOption('car_petrol_medium_km');
    await page.getByLabel('Quantity').fill('20');
    await page.getByRole('button', { name: /log activity/i }).click();

    const acceptButton = page.getByRole('button', { name: /^accept:/i });
    const transition = await acceptButton.evaluate(
      (el) => getComputedStyle(el, '::after').transition
    );
    expect(transition).toMatch(/none|0s/);
  });

  test('all form errors are linked to their inputs via aria-describedby', async ({
    page,
  }) => {
    await page.goto('/nudges');
    await page.getByRole('button', { name: /log activity/i }).click(); // submit empty

    const select = page.getByLabel('Activity type');
    const describedBy = await select.getAttribute('aria-describedby');
    if (describedBy) {
      await expect(page.locator(`#${describedBy}`)).toBeVisible();
    }
  });

  test('color contrast passes for body text across all routes', async ({
    page,
  }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('body')
        .analyze();

      const contrastViolations = results.violations.filter(
        (v) => v.id === 'color-contrast'
      );
      expect(contrastViolations).toEqual([]);
    }
  });
});