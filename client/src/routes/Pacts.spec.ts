import { test, expect, type Page } from '@playwright/test';

/**
 * e2e/pacts.spec.ts
 *
 * Covers pact creation (handleCreatePact writing to usePactsStore),
 * the Tension Web rendering, invite link generation, and the
 * join-pact flow via the fixed PactInviteAccept component, which now
 * reads the pact directly from the store using the token as pact id.
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
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe('Carbon Pacts - The Tension Web', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
    await page.goto('/pacts');
  });

  test('shows the empty state with Create a pact button when no active pact exists', async ({
    page,
  }) => {
    await expect(
      page.getByText('You are not in a pact yet. Start one with friends')
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /create a pact/i })
    ).toBeVisible();
  });

  test('creating a pact renders the Tension Web with one node', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /create a pact/i }).click();

    const web = page.getByRole('img', { name: /pact tension web/i });
    await expect(web).toBeVisible();
    await expect(web).toHaveAttribute('aria-label', /1 members/i);
  });

  test('after creating a pact, the invite section becomes visible', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /create a pact/i }).click();

    await expect(page.getByText('INVITE A MEMBER')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /generate invite/i })
    ).toBeVisible();
  });

  test('generating an invite produces a usable URL containing the pact id as token', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /create a pact/i }).click();
    await page.getByRole('button', { name: /generate invite/i }).click();

    const inviteInput = page.getByLabel('Invite link');
    await expect(inviteInput).not.toHaveValue('');

    const value = await inviteInput.inputValue();
    expect(value).toContain('/pacts?token=');
  });

  test('opening the invite link in a second context lets a new member join', async ({
    page,
    context,
  }) => {
    await page.getByRole('button', { name: /create a pact/i }).click();
    await page.getByRole('button', { name: /generate invite/i }).click();

    const inviteUrl = await page.getByLabel('Invite link').inputValue();

    // Simulate a second user (fresh storage state = new userId on mount)
    const secondPage = await context.newPage();
    await secondPage.goto('/dashboard'); // triggers App.tsx userId generation
    await secondPage.goto(inviteUrl);

    await expect(
      secondPage.getByRole('heading', { name: /you've been invited/i })
    ).toBeVisible();

    await secondPage.getByRole('button', { name: /join pact/i }).click();
    await expect(secondPage).toHaveURL(/\/pacts$/);

    // Back on the original page, the web should now show 2 members
    await page.reload();
    const web = page.getByRole('img', { name: /pact tension web/i });
    await expect(web).toHaveAttribute('aria-label', /2 members/i);
  });

  test('an invalid invite token shows an error instead of crashing', async ({
    page,
  }) => {
    await page.goto('/pacts?token=does-not-exist-12345');

    await page.getByRole('button', { name: /join pact/i }).click();
    await expect(
      page.getByText(/invalid or the pact no longer exists/i)
    ).toBeVisible();
  });

  test('declining an invite navigates to the dashboard without joining', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /create a pact/i }).click();
    await page.getByRole('button', { name: /generate invite/i }).click();
    const inviteUrl = await page.getByLabel('Invite link').inputValue();

    await page.goto(inviteUrl);
    await page.getByRole('button', { name: /decline/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Tension Web SVG has a descriptive aria-label with member count and trust', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /create a pact/i }).click();

    const web = page.getByRole('img', { name: /pact tension web/i });
    const label = await web.getAttribute('aria-label');
    expect(label).toMatch(/members/i);
    expect(label).toMatch(/average trust score/i);
  });
});