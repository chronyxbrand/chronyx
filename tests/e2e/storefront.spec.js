import { expect, test } from '@playwright/test';

test('home page renders the CHRONYX storefront shell', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/CHRONYX/i);
  await expect(page.getByRole('link', { name: /shop/i }).first()).toBeVisible();
  await expect(page.getByText(/CHRONYX/i).first()).toBeVisible();
});

test('shop page exposes product browsing UI', async ({ page }) => {
  await page.goto('/shop');

  await expect(page).toHaveURL(/\/shop/);
  await expect(page.getByRole('heading', { name: /all products/i })).toBeVisible();
  await expect(page.getByLabel(/category/i)).toBeVisible();
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();
});

test('product page can be opened from shop and cart can be reached', async ({ page }) => {
  await page.goto('/shop');
  await page.locator('a[href^="/products/"]').first().click();

  await expect(page).toHaveURL(/\/products\//);
  await expect(page.getByRole('heading').first()).toBeVisible();

  await page.goto('/cart');
  await expect(page).toHaveURL(/\/cart/);
  await expect(page.getByText(/cart/i).first()).toBeVisible();
});

test('checkout redirects unauthenticated visitors to auth', async ({ page }) => {
  await page.goto('/checkout');

  await expect(page).toHaveURL(/\/auth/);
  await expect(page.getByText(/sign in|join chronyx|access your orders/i).first()).toBeVisible();
});

test('invalid authenticity certificate path shows a safe failure state', async ({ page }) => {
  await page.goto('/verify/unit/not-real?code=not-real');

  await expect(page).toHaveURL(/\/verify\/unit\/not-real/);
  await expect(page.getByText(/not fully configured|could not be matched|checking authenticity/i).first()).toBeVisible();
});
