import { test, expect } from '@playwright/test';


test.describe('Check Out Page', () => {
  test.beforeEach(async ({ page }) => {
    // simulate a post to http://localhost:3000/checkInAll

    await page.request.post('http://localhost:3000/checkInAll', {
      data: {
        // Add any necessary data here if needed
        none:''
      },
    });

    // Navigate to the page before each test
    await page.goto('http://localhost:3000/');
  });

  test('has title', async ({ page }) => {

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/ESC Boat Manager/);
  });

  test('check the check out link then Next', async ({ page }) => {

    // Click the check out started link.

    await expect(page.getByText('Check Out')).not.toBeChecked();
    await page.getByText('Check Out').click();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Grey Rib')).toBeVisible();

  });

  test('check the Grey Rib link then Next', async ({ page }) => {

    // Click the check out started link.
    await page.getByText('Check Out').click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('Grey Rib').click();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Select a person:')).toBeVisible();

  });  

  test('verify that boats are not checked out until a person has been selected', async ({ page }) => {

    // Click the check out started link.
    await page.getByText('Check Out').click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByText('Grey Rib').click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Previous' }).click();
    await expect(page.getByText('Grey Rib')).toBeVisible();

  });    
});