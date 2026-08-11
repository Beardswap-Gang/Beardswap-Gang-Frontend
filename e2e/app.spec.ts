import { test, expect } from '@playwright/test'

test.describe('Governance Dashboard', () => {
  test('loads the dashboard page', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('h1')).toContainText('beardswap Gang DAO')
    await expect(page.locator('text=Governance Platform')).toBeVisible()
  })

  test('displays metrics grid when data loads', async ({ page }) => {
    await page.goto('/')
    
    // Wait for metrics to load (mocked data or real API)
    await page.waitForSelector('text=Total Proposals', { timeout: 10000 })
    
    await expect(page.locator('text=Total Proposals')).toBeVisible()
    await expect(page.locator('text=Active Proposals')).toBeVisible()
    await expect(page.locator('text=Total Votes')).toBeVisible()
  })

  test('shows connect wallet button', async ({ page }) => {
    await page.goto('/')
    
    const connectButton = page.getByRole('button', { name: /connect wallet/i })
    await expect(connectButton).toBeVisible()
  })

  test('displays proposal list section', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.getByText('Governance Proposals')).toBeVisible()
    await expect(page.getByRole('button', { name: /create proposal/i })).toBeVisible()
  })
})

test.describe('Responsive Design', () => {
  test('displays correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByRole('button', { name: /connect wallet/i })).toBeVisible()
  })

  test('displays correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=Total Proposals')).toBeVisible()
  })
})
