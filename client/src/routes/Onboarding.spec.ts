import { test, expect } from '@playwright/test';

/**
 * e2e/onboarding.spec.ts
 *
 * Covers the full onboarding flow: intro card -> 4-step quiz -> baseline
 * calculation -> navigation to /dashboard. Wired against the real
 * Onboarding.tsx (intro slide + 4 STEPS array) and store/index.ts
 * (setBaselineFootprintKg, setOnboardingComplete).
 */

test.describe('Onboarding flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
  });

  test('shows the intro card with the hero heading and Begin Stewardship button', async ({
    page,
  }) => {
    await expect(page.getByText('Your journey starts here.')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /begin stewardship/i })
    ).toBeVisible();
  });

  test('progress bar advances from 0% as the user moves through steps', async ({
    page,
  }) => {
    const progressBar = page.getByRole('progressbar');
    await expect(progressBar).toHaveAttribute('aria-valuenow', '0');

    await page.getByRole('button', { name: /begin stewardship/i }).click();
    await expect(page.getByText('STEP 1 OF 4')).toBeVisible();

    await page.getByRole('button', { name: 'Under 5km' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(progressBar).toHaveAttribute('aria-valuenow', '25');
  });

  test('Continue button stays disabled until an option is selected', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /begin stewardship/i }).click();
    const continueBtn = page.getByRole('button', { name: 'Continue' });
    await expect(continueBtn).toBeDisabled();

    await page.getByRole('button', { name: '5–20km' }).click();
    await expect(continueBtn).toBeEnabled();
  });

  test('selecting an option applies the selected visual state (aria-pressed)', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /begin stewardship/i }).click();
    const option = page.getByRole('button', { name: 'Under 5km' });

    await expect(option).toHaveAttribute('aria-pressed', 'false');
    await option.click();
    await expect(option).toHaveAttribute('aria-pressed', 'true');
  });

  test('completes all 4 steps and lands on /dashboard', async ({ page }) => {
    await page.getByRole('button', { name: /begin stewardship/i }).click();

    // Step 1 - transport
    await page.getByRole('button', { name: 'Under 5km' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 2 - diet
    await page.getByRole('button', { name: 'Mostly plant-based' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 3 - energy
    await page.getByRole('button', { name: 'Under 100kWh' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 4 - shopping
    await page.getByRole('button', { name: 'Rarely' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('displays the Faces of Impact persona after onboarding completes', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /begin stewardship/i }).click();
    await page.getByRole('button', { name: 'Under 5km' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Mostly plant-based' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Under 100kWh' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Rarely' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByText('FACES OF IMPACT')).toBeVisible();
  });

  test('the onboarding nav is hidden (main site nav does not appear on this screen)', async ({
    page,
  }) => {
    await expect(
      page.getByRole('navigation', { name: 'Main navigation' })
    ).toBeHidden();
  });
});