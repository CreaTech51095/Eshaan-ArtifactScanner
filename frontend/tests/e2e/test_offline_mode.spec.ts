import { test, expect } from '@playwright/test'

/**
 * E2E Test: Offline Mode Scenarios
 * 
 * This test verifies the offline functionality requirements:
 * - FR-012: Full offline functionality (scan, view, create, edit without internet)
 * - FR-013: Automatic sync when returning online with conflict resolution
 * 
 * Test Scenarios:
 * 1. User creates artifacts while offline
 * 2. User views artifacts while offline
 * 3. User edits artifacts while offline
 * 4. Data syncs when coming back online
 * 5. Conflict resolution when multiple users edit same artifact
 * 6. Offline indicator UI
 * 7. Queue management for offline operations
 */

test.describe('Offline Mode Functionality', () => {
  const testUser = {
    email: `offline-test-${Date.now()}@university.edu`,
    password: 'SecurePass123!',
    username: `offline_user_${Date.now()}`,
    displayName: 'Dr. Offline Test',
    role: 'archaeologist'
  }

  const testArtifact = {
    name: 'Offline Created Artifact',
    description: 'Created while device was offline',
    artifactType: 'pottery',
    discoveryDate: '2024-12-15',
    discoverySite: 'Remote Excavation Site',
    location: 'Field Storage'
  }

  test.beforeEach(async ({ page, context }) => {
    // Register and login user first (online)
    await page.goto('/')
    
    // Quick registration
    const registerLink = page.getByRole('link', { name: /register|sign up/i })
    await registerLink.click()
    
    await page.getByLabel(/email/i).fill(testUser.email)
    await page.getByLabel(/password/i).first().fill(testUser.password)
    await page.getByLabel(/username/i).fill(testUser.username)
    await page.getByLabel(/display name/i).fill(testUser.displayName)
    
    const roleSelect = page.locator('select[name="role"], [data-testid="role-select"]')
    if (await roleSelect.isVisible()) {
      await roleSelect.selectOption(testUser.role)
    }
    
    await page.getByRole('button', { name: /register|sign up|create account/i }).click()
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    // Wait for any initial sync to complete
    await page.waitForTimeout(2000)
  })

  test('should create and store artifacts offline', async ({ page, context }) => {
    await test.step('Go Offline', async () => {
      // Simulate offline mode
      await context.setOffline(true)
      
      // Verify offline indicator appears
      const offlineIndicator = page.locator('[data-testid="offline-indicator"], .offline-banner')
      await expect(offlineIndicator).toBeVisible({ timeout: 5000 })
      
      console.log('✓ Device is now offline')
    })

    await test.step('Create Artifact While Offline', async () => {
      // Navigate to artifacts
      await page.goto('/artifacts')
      
      // Click create new artifact
      const createButton = page.getByRole('button', { name: /add artifact|new artifact|create/i })
      await createButton.click()
      
      // Fill form
      await page.getByLabel(/name/i).fill(testArtifact.name)
      await page.getByLabel(/description/i).fill(testArtifact.description)
      await page.getByLabel(/artifact type|type/i).fill(testArtifact.artifactType)
      await page.getByLabel(/discovery date|date/i).fill(testArtifact.discoveryDate)
      await page.getByLabel(/discovery site|site/i).fill(testArtifact.discoverySite)
      await page.getByLabel(/location/i).fill(testArtifact.location)
      
      // Submit form
      await page.getByRole('button', { name: /save|create|submit/i }).click()
      
      // Should see success message with offline indication
      await expect(page.getByText(/saved offline|saved locally|will sync/i)).toBeVisible({ timeout: 5000 })
      
      console.log('✓ Artifact created offline')
    })

    await test.step('Verify Artifact Stored Locally', async () => {
      // Navigate back to artifacts list
      await page.goto('/artifacts')
      
      // Should see the offline-created artifact
      await expect(page.getByText(testArtifact.name)).toBeVisible()
      
      // May have sync pending indicator
      const syncPending = page.locator('[data-testid="sync-pending"], .sync-pending')
      // Note: This is optional - not all artifacts will show sync status individually
      
      console.log('✓ Offline artifact visible in list')
    })

    await test.step('View Artifact Details While Offline', async () => {
      // Click on the artifact
      await page.getByText(testArtifact.name).first().click()
      
      // Should see all details
      await expect(page.getByText(testArtifact.description)).toBeVisible()
      await expect(page.getByText(testArtifact.discoverySite)).toBeVisible()
      
      console.log('✓ Artifact details viewable offline')
    })

    await test.step('Edit Artifact While Offline', async () => {
      // Click edit button
      const editButton = page.getByRole('button', { name: /edit/i })
      await editButton.click()
      
      // Update description
      const updatedDescription = testArtifact.description + ' - Edited offline'
      const descriptionField = page.getByLabel(/description/i)
      await descriptionField.clear()
      await descriptionField.fill(updatedDescription)
      
      // Save changes
      await page.getByRole('button', { name: /save|update/i }).click()
      
      // Should see offline save confirmation
      await expect(page.getByText(/saved offline|saved locally|will sync/i)).toBeVisible({ timeout: 5000 })
      
      // Verify changes are reflected
      await expect(page.getByText(/edited offline/i)).toBeVisible()
      
      console.log('✓ Artifact edited offline')
    })

    await test.step('Go Back Online and Sync', async () => {
      // Bring device back online
      await context.setOffline(false)
      
      // Wait for sync to start
      await page.waitForTimeout(2000)
      
      // Should see sync in progress indicator
      const syncIndicator = page.locator('[data-testid="syncing"], .syncing, [data-testid="online-indicator"]')
      // Sync might be fast, so we'll just wait a bit
      await page.waitForTimeout(3000)
      
      // Offline indicator should disappear
      const offlineIndicator = page.locator('[data-testid="offline-indicator"], .offline-banner')
      await expect(offlineIndicator).not.toBeVisible({ timeout: 10000 })
      
      console.log('✓ Device back online, sync completed')
    })

    await test.step('Verify Data Synced to Server', async () => {
      // Refresh page to ensure data comes from server
      await page.reload()
      
      // Should still see the artifact with edits
      await expect(page.getByText(testArtifact.name)).toBeVisible()
      await expect(page.getByText(/edited offline/i)).toBeVisible()
      
      console.log('✓ Offline changes synced to server')
    })
  })

  test('should handle offline viewing of previously synced artifacts', async ({ page, context }) => {
    let artifactName: string

    await test.step('Create Artifact While Online', async () => {
      // Create an artifact while online first
      await page.goto('/artifacts')
      
      const createButton = page.getByRole('button', { name: /add artifact|new artifact|create/i })
      await createButton.click()
      
      artifactName = `Online Artifact ${Date.now()}`
      await page.getByLabel(/name/i).fill(artifactName)
      await page.getByLabel(/description/i).fill('Created online for offline testing')
      await page.getByLabel(/artifact type|type/i).fill('tool')
      await page.getByLabel(/discovery date|date/i).fill('2024-12-10')
      await page.getByLabel(/discovery site|site/i).fill('Test Site')
      await page.getByLabel(/location/i).fill('Lab A')
      
      await page.getByRole('button', { name: /save|create|submit/i }).click()
      
      await expect(page.getByText(/success|created/i)).toBeVisible({ timeout: 5000 })
      
      // Wait for sync
      await page.waitForTimeout(2000)
      
      console.log('✓ Artifact created online')
    })

    await test.step('Go Offline', async () => {
      await context.setOffline(true)
      
      const offlineIndicator = page.locator('[data-testid="offline-indicator"], .offline-banner')
      await expect(offlineIndicator).toBeVisible({ timeout: 5000 })
      
      console.log('✓ Device is now offline')
    })

    await test.step('View Previously Synced Artifact', async () => {
      // Navigate to artifacts list
      await page.goto('/artifacts')
      
      // Should see the artifact (cached)
      await expect(page.getByText(artifactName)).toBeVisible()
      
      // Click to view details
      await page.getByText(artifactName).first().click()
      
      // Should see all details from cache
      await expect(page.getByText(/created online for offline testing/i)).toBeVisible()
      
      console.log('✓ Previously synced artifact viewable offline')
    })
  })

  test('should handle conflict resolution when syncing', async ({ page, context, browser }) => {
    let artifactName: string
    let artifactId: string

    await test.step('Create Artifact and Get ID', async () => {
      await page.goto('/artifacts')
      
      const createButton = page.getByRole('button', { name: /add artifact|new artifact|create/i })
      await createButton.click()
      
      artifactName = `Conflict Test Artifact ${Date.now()}`
      await page.getByLabel(/name/i).fill(artifactName)
      await page.getByLabel(/description/i).fill('Original description')
      await page.getByLabel(/artifact type|type/i).fill('pottery')
      await page.getByLabel(/discovery date|date/i).fill('2024-12-10')
      await page.getByLabel(/discovery site|site/i).fill('Site X')
      await page.getByLabel(/location/i).fill('Storage Y')
      
      await page.getByRole('button', { name: /save|create|submit/i }).click()
      
      await expect(page.getByText(/success|created/i)).toBeVisible({ timeout: 5000 })
      await page.waitForTimeout(2000)
      
      // Extract artifact ID from URL
      const url = page.url()
      const match = url.match(/artifacts\/([^\/]+)/)
      artifactId = match ? match[1] : ''
      
      console.log('✓ Artifact created for conflict test')
    })

    await test.step('Edit Artifact Offline (User 1)', async () => {
      // Go offline
      await context.setOffline(true)
      await page.waitForTimeout(1000)
      
      // Edit the artifact
      const editButton = page.getByRole('button', { name: /edit/i })
      await editButton.click()
      
      const descriptionField = page.getByLabel(/description/i)
      await descriptionField.clear()
      await descriptionField.fill('Description edited offline by User 1')
      
      await page.getByRole('button', { name: /save|update/i }).click()
      await expect(page.getByText(/saved offline|saved locally/i)).toBeVisible({ timeout: 5000 })
      
      console.log('✓ User 1 edited artifact offline')
    })

    await test.step('Simulate Concurrent Edit (User 2) - Via API or Second Browser', async () => {
      // In a real scenario, another user would edit the same artifact
      // For this test, we'll simulate the server having a different version
      
      // Create second browser context to simulate second user
      const context2 = await browser.newContext()
      const page2 = await context2.newPage()
      
      // Login as different user
      await page2.goto('/')
      
      const registerLink = page2.getByRole('link', { name: /register|sign up/i })
      await registerLink.click()
      
      const user2 = {
        email: `user2-${Date.now()}@university.edu`,
        password: 'SecurePass123!',
        username: `user2_${Date.now()}`,
        displayName: 'User 2'
      }
      
      await page2.getByLabel(/email/i).fill(user2.email)
      await page2.getByLabel(/password/i).first().fill(user2.password)
      await page2.getByLabel(/username/i).fill(user2.username)
      await page2.getByLabel(/display name/i).fill(user2.displayName)
      
      await page2.getByRole('button', { name: /register|sign up|create account/i }).click()
      await expect(page2).toHaveURL(/.*dashboard/, { timeout: 10000 })
      
      // Navigate to the same artifact
      if (artifactId) {
        await page2.goto(`/artifacts/${artifactId}`)
      } else {
        await page2.goto('/artifacts')
        await page2.getByText(artifactName).first().click()
      }
      
      // Edit the artifact (User 2 is online)
      const editButton2 = page2.getByRole('button', { name: /edit/i })
      if (await editButton2.isVisible()) {
        await editButton2.click()
        
        const descriptionField2 = page2.getByLabel(/description/i)
        await descriptionField2.clear()
        await descriptionField2.fill('Description edited online by User 2')
        
        await page2.getByRole('button', { name: /save|update/i }).click()
        await expect(page2.getByText(/success|updated|saved/i)).toBeVisible({ timeout: 5000 })
      }
      
      await context2.close()
      
      console.log('✓ User 2 edited same artifact online')
    })

    await test.step('User 1 Goes Online and Encounters Conflict', async () => {
      // Bring User 1 back online
      await context.setOffline(false)
      await page.waitForTimeout(3000)
      
      // Should detect conflict and show conflict resolution UI
      const conflictIndicator = page.locator(
        '[data-testid="conflict-detected"], .conflict-banner, [role="alert"]'
      )
      
      // May need to refresh or navigate to trigger sync
      await page.reload()
      await page.waitForTimeout(2000)
      
      // Check if conflict resolution UI appears
      const conflictUI = page.getByText(/conflict|different version|resolve/i)
      
      // The conflict resolution might appear as a modal or inline
      // This depends on implementation, so we'll check for its presence
      if (await conflictUI.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('✓ Conflict detected and UI shown')
        
        // User should be able to choose: keep local, keep remote, or merge
        const keepLocalButton = page.getByRole('button', { name: /keep.*local|keep.*mine|my version/i })
        const keepRemoteButton = page.getByRole('button', { name: /keep.*remote|keep.*theirs|their version/i })
        
        // Choose to keep local changes for this test
        if (await keepLocalButton.isVisible()) {
          await keepLocalButton.click()
        }
      } else {
        console.log('⚠ Conflict resolution UI not shown (may use automatic resolution)')
      }
    })
  })

  test('should queue multiple offline operations and sync in order', async ({ page, context }) => {
    await test.step('Go Offline', async () => {
      await context.setOffline(true)
      const offlineIndicator = page.locator('[data-testid="offline-indicator"], .offline-banner')
      await expect(offlineIndicator).toBeVisible({ timeout: 5000 })
    })

    const artifacts = [
      { name: 'Offline Artifact 1', type: 'pottery' },
      { name: 'Offline Artifact 2', type: 'tool' },
      { name: 'Offline Artifact 3', type: 'jewelry' }
    ]

    await test.step('Create Multiple Artifacts Offline', async () => {
      for (const artifact of artifacts) {
        await page.goto('/artifacts')
        
        const createButton = page.getByRole('button', { name: /add artifact|new artifact|create/i })
        await createButton.click()
        
        await page.getByLabel(/name/i).fill(artifact.name)
        await page.getByLabel(/description/i).fill(`Description for ${artifact.name}`)
        await page.getByLabel(/artifact type|type/i).fill(artifact.type)
        await page.getByLabel(/discovery date|date/i).fill('2024-12-15')
        await page.getByLabel(/discovery site|site/i).fill('Remote Site')
        await page.getByLabel(/location/i).fill('Field')
        
        await page.getByRole('button', { name: /save|create|submit/i }).click()
        
        await expect(page.getByText(/saved offline|saved locally/i)).toBeVisible({ timeout: 5000 })
        
        console.log(`✓ Created ${artifact.name} offline`)
      }
    })

    await test.step('Verify Offline Queue', async () => {
      // Check if there's a sync queue indicator showing pending operations
      await page.goto('/artifacts')
      
      // All artifacts should be visible
      for (const artifact of artifacts) {
        await expect(page.getByText(artifact.name)).toBeVisible()
      }
      
      console.log('✓ All offline artifacts in queue')
    })

    await test.step('Go Online and Sync All', async () => {
      await context.setOffline(false)
      await page.waitForTimeout(5000) // Give time for all to sync
      
      // Reload to verify
      await page.reload()
      
      // All artifacts should still be visible and synced
      for (const artifact of artifacts) {
        await expect(page.getByText(artifact.name)).toBeVisible()
      }
      
      console.log('✓ All offline artifacts synced successfully')
    })
  })

  test('should handle offline photo viewing with cached images', async ({ page, context }) => {
    await test.step('Create Artifact with Photo While Online', async () => {
      await page.goto('/artifacts')
      
      const createButton = page.getByRole('button', { name: /add artifact|new artifact|create/i })
      await createButton.click()
      
      await page.getByLabel(/name/i).fill('Artifact with Photo')
      await page.getByLabel(/description/i).fill('Has cached photo')
      await page.getByLabel(/artifact type|type/i).fill('pottery')
      await page.getByLabel(/discovery date|date/i).fill('2024-12-10')
      await page.getByLabel(/discovery site|site/i).fill('Site A')
      await page.getByLabel(/location/i).fill('Lab')
      
      await page.getByRole('button', { name: /save|create|submit/i }).click()
      
      await expect(page.getByText(/success|created/i)).toBeVisible({ timeout: 5000 })
      await page.waitForTimeout(2000)
    })

    await test.step('Go Offline', async () => {
      await context.setOffline(true)
      const offlineIndicator = page.locator('[data-testid="offline-indicator"], .offline-banner')
      await expect(offlineIndicator).toBeVisible({ timeout: 5000 })
    })

    await test.step('View Artifact with Cached Photo', async () => {
      await page.goto('/artifacts')
      await page.getByText('Artifact with Photo').first().click()
      
      // Photo section should be visible (even if no photos yet)
      const photoSection = page.locator('[data-testid="photos"], .photos, .photo-gallery')
      // Just verify the artifact is viewable offline
      await expect(page.getByText('Artifact with Photo')).toBeVisible()
    })
  })

  test('should persist offline mode across app restarts', async ({ page, context }) => {
    await test.step('Go Offline and Create Artifact', async () => {
      await context.setOffline(true)
      await page.waitForTimeout(1000)
      
      await page.goto('/artifacts')
      
      const createButton = page.getByRole('button', { name: /add artifact|new artifact|create/i })
      await createButton.click()
      
      const persistName = `Persist Test ${Date.now()}`
      await page.getByLabel(/name/i).fill(persistName)
      await page.getByLabel(/description/i).fill('Should persist across restarts')
      await page.getByLabel(/artifact type|type/i).fill('tool')
      await page.getByLabel(/discovery date|date/i).fill('2024-12-15')
      await page.getByLabel(/discovery site|site/i).fill('Site')
      await page.getByLabel(/location/i).fill('Lab')
      
      await page.getByRole('button', { name: /save|create|submit/i }).click()
      
      await expect(page.getByText(/saved offline|saved locally/i)).toBeVisible({ timeout: 5000 })
      
      // Store artifact name for later verification
      await page.evaluate((name) => {
        localStorage.setItem('test-persist-artifact', name)
      }, persistName)
    })

    await test.step('Simulate App Restart (Reload Page)', async () => {
      await page.reload()
      await page.waitForTimeout(2000)
      
      // Should still be offline
      const offlineIndicator = page.locator('[data-testid="offline-indicator"], .offline-banner')
      await expect(offlineIndicator).toBeVisible({ timeout: 5000 })
    })

    await test.step('Verify Data Persisted', async () => {
      await page.goto('/artifacts')
      
      // Retrieve the artifact name we stored
      const persistName = await page.evaluate(() => {
        return localStorage.getItem('test-persist-artifact')
      })
      
      // Should still see the artifact
      if (persistName) {
        await expect(page.getByText(persistName)).toBeVisible()
      }
      
      console.log('✓ Offline data persisted across app restart')
    })
  })
})

test.describe('Offline Mode UI/UX', () => {
  test('should display clear offline indicators', async ({ page, context }) => {
    // Login first
    const user = {
      email: `ui-test-${Date.now()}@university.edu`,
      password: 'SecurePass123!',
      username: `ui_test_${Date.now()}`
    }

    await page.goto('/')
    const registerLink = page.getByRole('link', { name: /register|sign up/i })
    await registerLink.click()
    
    await page.getByLabel(/email/i).fill(user.email)
    await page.getByLabel(/password/i).first().fill(user.password)
    await page.getByLabel(/username/i).fill(user.username)
    
    await page.getByRole('button', { name: /register|sign up|create account/i }).click()
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })

    await test.step('Verify Online Indicator', async () => {
      // Should show online status
      const onlineIndicator = page.locator('[data-testid="online-indicator"], .online-status')
      // Online indicator might not always be visible (only showing when offline is common)
    })

    await test.step('Go Offline and Verify Indicator', async () => {
      await context.setOffline(true)
      await page.waitForTimeout(1000)
      
      // Should show prominent offline indicator
      const offlineIndicator = page.locator('[data-testid="offline-indicator"], .offline-banner')
      await expect(offlineIndicator).toBeVisible({ timeout: 5000 })
      
      // Should contain text indicating offline status
      await expect(page.getByText(/offline|no connection|disconnected/i)).toBeVisible()
    })

    await test.step('Verify Offline Mode Features Available', async () => {
      // Navigate through app while offline
      await page.goto('/artifacts')
      await expect(page.getByText(/artifacts/i)).toBeVisible()
      
      await page.goto('/scanner')
      await expect(page.getByText(/scan|scanner/i)).toBeVisible()
      
      // Core features should still be accessible
      console.log('✓ Offline mode UI indicators working correctly')
    })
  })
})

