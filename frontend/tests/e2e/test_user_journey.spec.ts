import { test, expect } from '@playwright/test'

/**
 * E2E Test: Complete User Journey
 * 
 * This test covers the entire user workflow from registration to artifact management.
 * According to the spec, the app should support:
 * - User authentication (FR-011)
 * - QR code scanning and generation (FR-001, FR-002)
 * - Artifact creation, viewing, and editing (FR-003, FR-004, FR-005)
 * - Role-based access control (FR-014, FR-015)
 * 
 * Test Flow:
 * 1. New user registers as archaeologist
 * 2. User logs in
 * 3. User navigates to scanner page
 * 4. User creates new artifact with QR code
 * 5. User adds photos to artifact
 * 6. User searches and filters artifacts
 * 7. User scans QR code to retrieve artifact
 * 8. User edits artifact details
 * 9. User logs out
 */

test.describe('Complete User Journey', () => {
  const testUser = {
    email: `archaeologist-${Date.now()}@university.edu`,
    password: 'SecurePass123!',
    username: `archaeologist_${Date.now()}`,
    displayName: 'Dr. Test Archaeologist',
    role: 'archaeologist'
  }

  const testArtifact = {
    name: 'Ancient Bronze Sword',
    description: 'Well-preserved bronze sword from the Iron Age',
    artifactType: 'weapon',
    discoveryDate: '2024-12-15',
    discoverySite: 'Site Alpha, Trench 5',
    location: 'Museum Storage Room B'
  }

  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/')
  })

  test('should complete full user journey from registration to artifact management', async ({ page }) => {
    // Step 1: Register new user
    await test.step('User Registration', async () => {
      // Navigate to login page
      await expect(page).toHaveURL(/.*login/)
      
      // Click on register link/button
      const registerLink = page.getByRole('link', { name: /register|sign up/i })
      await registerLink.click()
      
      // Fill registration form
      await page.getByLabel(/email/i).fill(testUser.email)
      await page.getByLabel(/password/i).first().fill(testUser.password)
      await page.getByLabel(/username/i).fill(testUser.username)
      await page.getByLabel(/display name/i).fill(testUser.displayName)
      
      // Select role (if available)
      const roleSelect = page.locator('select[name="role"], [data-testid="role-select"]')
      if (await roleSelect.isVisible()) {
        await roleSelect.selectOption(testUser.role)
      }
      
      // Submit registration
      await page.getByRole('button', { name: /register|sign up|create account/i }).click()
      
      // Should redirect to dashboard after successful registration
      await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
      
      // Should see welcome message or user display name
      await expect(page.getByText(new RegExp(testUser.displayName, 'i'))).toBeVisible()
    })

    // Step 2: Navigate to artifact list
    await test.step('Navigate to Artifacts', async () => {
      // Find and click artifacts navigation link
      const artifactsNav = page.getByRole('link', { name: /artifacts|browse artifacts/i })
      await artifactsNav.click()
      
      await expect(page).toHaveURL(/.*artifacts/)
      
      // Should see artifacts list page (may be empty)
      await expect(page.getByText(/artifacts|artifact list/i)).toBeVisible()
    })

    // Step 3: Create new artifact
    let artifactQRCode: string
    await test.step('Create New Artifact', async () => {
      // Click create/add new artifact button
      const createButton = page.getByRole('button', { name: /add artifact|new artifact|create/i })
      await createButton.click()
      
      // Fill artifact form
      await page.getByLabel(/name/i).fill(testArtifact.name)
      await page.getByLabel(/description/i).fill(testArtifact.description)
      await page.getByLabel(/artifact type|type/i).fill(testArtifact.artifactType)
      await page.getByLabel(/discovery date|date/i).fill(testArtifact.discoveryDate)
      await page.getByLabel(/discovery site|site/i).fill(testArtifact.discoverySite)
      await page.getByLabel(/location/i).fill(testArtifact.location)
      
      // Submit form
      await page.getByRole('button', { name: /save|create|submit/i }).click()
      
      // Should see success message or be redirected to artifact detail
      await expect(page.getByText(/success|created/i)).toBeVisible({ timeout: 5000 })
      
      // Extract QR code from the page
      const qrCodeElement = page.locator('[data-testid="qr-code"], .qr-code')
      await expect(qrCodeElement).toBeVisible({ timeout: 5000 })
      
      // Get QR code value (could be from data attribute or text content)
      artifactQRCode = await qrCodeElement.getAttribute('data-qr-value') || 
                       await qrCodeElement.textContent() || 
                       'ART-2024-TEST'
      
      // Verify artifact details are displayed
      await expect(page.getByText(testArtifact.name)).toBeVisible()
      await expect(page.getByText(testArtifact.description)).toBeVisible()
    })

    // Step 4: Add photos to artifact
    await test.step('Add Photos to Artifact', async () => {
      // Find upload photo button or input
      const uploadButton = page.getByRole('button', { name: /add photo|upload|attach/i })
      
      if (await uploadButton.isVisible()) {
        // Click upload button if it exists
        await uploadButton.click()
        
        // This would normally upload a file, but for E2E test we'll verify the UI is present
        const fileInput = page.locator('input[type="file"]')
        await expect(fileInput).toBeAttached()
        
        // In a real scenario, we would:
        // await fileInput.setInputFiles('path/to/test-image.jpg')
        // For now, just verify the upload interface exists
      }
    })

    // Step 5: Search and filter artifacts
    await test.step('Search and Filter Artifacts', async () => {
      // Navigate back to artifacts list
      await page.getByRole('link', { name: /artifacts|back to list/i }).click()
      
      // Search for the created artifact
      const searchInput = page.getByPlaceholder(/search/i)
      await searchInput.fill(testArtifact.name)
      
      // Should see the artifact in results
      await expect(page.getByText(testArtifact.name)).toBeVisible()
      
      // Test filter by artifact type
      const typeFilter = page.locator('select[name="artifactType"], [data-testid="type-filter"]')
      if (await typeFilter.isVisible()) {
        await typeFilter.selectOption(testArtifact.artifactType)
        
        // Should still see our artifact
        await expect(page.getByText(testArtifact.name)).toBeVisible()
      }
      
      // Clear search
      await searchInput.clear()
    })

    // Step 6: Scan QR code to retrieve artifact
    await test.step('Retrieve Artifact by QR Code', async () => {
      // Navigate to scanner page
      const scannerNav = page.getByRole('link', { name: /scanner|scan/i })
      await scannerNav.click()
      
      await expect(page).toHaveURL(/.*scanner/)
      
      // Should see scanner interface
      await expect(page.getByText(/scan|camera/i)).toBeVisible()
      
      // Simulate QR code input (manual entry option)
      const manualEntry = page.getByRole('button', { name: /manual|enter code/i })
      if (await manualEntry.isVisible()) {
        await manualEntry.click()
        
        const codeInput = page.getByLabel(/code|qr/i)
        await codeInput.fill(artifactQRCode)
        
        await page.getByRole('button', { name: /search|find|retrieve/i }).click()
        
        // Should navigate to artifact detail
        await expect(page.getByText(testArtifact.name)).toBeVisible()
      }
    })

    // Step 7: Edit artifact details
    await test.step('Edit Artifact Details', async () => {
      // Click edit button
      const editButton = page.getByRole('button', { name: /edit/i })
      await editButton.click()
      
      // Update description
      const updatedDescription = testArtifact.description + ' - Updated with additional analysis'
      const descriptionField = page.getByLabel(/description/i)
      await descriptionField.clear()
      await descriptionField.fill(updatedDescription)
      
      // Save changes
      await page.getByRole('button', { name: /save|update/i }).click()
      
      // Should see success message
      await expect(page.getByText(/success|updated|saved/i)).toBeVisible({ timeout: 5000 })
      
      // Verify updated content
      await expect(page.getByText(/additional analysis/i)).toBeVisible()
    })

    // Step 8: Verify role-based access
    await test.step('Verify Archaeologist Permissions', async () => {
      // As archaeologist, should be able to create and edit
      await page.goto('/artifacts')
      
      // Should see create button (archaeologists have create permission)
      await expect(page.getByRole('button', { name: /add artifact|new artifact|create/i })).toBeVisible()
      
      // Navigate to artifact detail
      await page.getByText(testArtifact.name).first().click()
      
      // Should see edit button (archaeologists have edit permission)
      await expect(page.getByRole('button', { name: /edit/i })).toBeVisible()
    })

    // Step 9: Logout
    await test.step('User Logout', async () => {
      // Find and click logout button (could be in menu)
      const logoutButton = page.getByRole('button', { name: /logout|sign out/i })
      
      // May need to open user menu first
      if (!(await logoutButton.isVisible())) {
        const userMenu = page.getByRole('button', { name: new RegExp(testUser.displayName, 'i') })
        await userMenu.click()
        await expect(logoutButton).toBeVisible()
      }
      
      await logoutButton.click()
      
      // Should redirect to login page
      await expect(page).toHaveURL(/.*login/)
      
      // Should not be able to access protected pages
      await page.goto('/dashboard')
      await expect(page).toHaveURL(/.*login/)
    })

    // Step 10: Login again and verify data persistence
    await test.step('Verify Data Persistence', async () => {
      // Login with same credentials
      await page.getByLabel(/email/i).fill(testUser.email)
      await page.getByLabel(/password/i).fill(testUser.password)
      await page.getByRole('button', { name: /sign in|login/i }).click()
      
      // Should redirect to dashboard
      await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
      
      // Navigate to artifacts
      await page.goto('/artifacts')
      
      // Verify artifact still exists
      await expect(page.getByText(testArtifact.name)).toBeVisible()
      
      // Click on artifact
      await page.getByText(testArtifact.name).first().click()
      
      // Verify updated description persisted
      await expect(page.getByText(/additional analysis/i)).toBeVisible()
    })
  })

  test('should handle researcher role with view-only access', async ({ page }) => {
    const researcherUser = {
      email: `researcher-${Date.now()}@university.edu`,
      password: 'SecurePass123!',
      username: `researcher_${Date.now()}`,
      displayName: 'Dr. Test Researcher',
      role: 'researcher'
    }

    // Register as researcher
    await test.step('Register as Researcher', async () => {
      await expect(page).toHaveURL(/.*login/)
      
      const registerLink = page.getByRole('link', { name: /register|sign up/i })
      await registerLink.click()
      
      await page.getByLabel(/email/i).fill(researcherUser.email)
      await page.getByLabel(/password/i).first().fill(researcherUser.password)
      await page.getByLabel(/username/i).fill(researcherUser.username)
      await page.getByLabel(/display name/i).fill(researcherUser.displayName)
      
      const roleSelect = page.locator('select[name="role"], [data-testid="role-select"]')
      if (await roleSelect.isVisible()) {
        await roleSelect.selectOption(researcherUser.role)
      }
      
      await page.getByRole('button', { name: /register|sign up|create account/i }).click()
      
      await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    })

    // Verify view-only access
    await test.step('Verify View-Only Permissions', async () => {
      await page.goto('/artifacts')
      
      // Should NOT see create button (researchers are view-only)
      const createButton = page.getByRole('button', { name: /add artifact|new artifact|create/i })
      await expect(createButton).not.toBeVisible()
      
      // Should be able to view artifacts
      await expect(page.getByText(/artifacts|artifact list/i)).toBeVisible()
      
      // Navigate to an artifact detail (if any exist)
      const firstArtifact = page.locator('[data-testid="artifact-item"]').first()
      if (await firstArtifact.isVisible()) {
        await firstArtifact.click()
        
        // Should NOT see edit button (researchers cannot edit)
        const editButton = page.getByRole('button', { name: /edit/i })
        await expect(editButton).not.toBeVisible()
      }
    })
  })

  test('should display appropriate error messages for invalid inputs', async ({ page }) => {
    // Register and login first
    const user = {
      email: `test-${Date.now()}@university.edu`,
      password: 'SecurePass123!',
      username: `test_${Date.now()}`,
      displayName: 'Test User',
      role: 'archaeologist'
    }

    await test.step('Quick Registration', async () => {
      const registerLink = page.getByRole('link', { name: /register|sign up/i })
      await registerLink.click()
      
      await page.getByLabel(/email/i).fill(user.email)
      await page.getByLabel(/password/i).first().fill(user.password)
      await page.getByLabel(/username/i).fill(user.username)
      await page.getByLabel(/display name/i).fill(user.displayName)
      
      await page.getByRole('button', { name: /register|sign up|create account/i }).click()
      await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    })

    // Test form validation
    await test.step('Test Artifact Form Validation', async () => {
      await page.goto('/artifacts')
      
      const createButton = page.getByRole('button', { name: /add artifact|new artifact|create/i })
      await createButton.click()
      
      // Try to submit empty form
      await page.getByRole('button', { name: /save|create|submit/i }).click()
      
      // Should see validation errors
      await expect(page.getByText(/required|cannot be empty/i).first()).toBeVisible()
      
      // Fill only name and submit
      await page.getByLabel(/name/i).fill('Test Artifact')
      await page.getByRole('button', { name: /save|create|submit/i }).click()
      
      // Should still see validation errors for other required fields
      await expect(page.getByText(/required|cannot be empty/i)).toBeVisible()
    })

    // Test invalid QR code
    await test.step('Test Invalid QR Code Search', async () => {
      await page.goto('/scanner')
      
      const manualEntry = page.getByRole('button', { name: /manual|enter code/i })
      if (await manualEntry.isVisible()) {
        await manualEntry.click()
        
        const codeInput = page.getByLabel(/code|qr/i)
        await codeInput.fill('INVALID-QR-CODE-12345')
        
        await page.getByRole('button', { name: /search|find|retrieve/i }).click()
        
        // Should see error message
        await expect(page.getByText(/not found|invalid|does not exist/i)).toBeVisible({ timeout: 5000 })
      }
    })
  })
})

test.describe('Cross-Browser Compatibility', () => {
  test('should work consistently across different browsers', async ({ page, browserName }) => {
    await page.goto('/')
    
    // Basic smoke test for each browser
    await expect(page).toHaveURL(/.*login/)
    
    // Test responsive design
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await expect(page.getByLabel(/email/i)).toBeVisible()
    
    await page.setViewportSize({ width: 1920, height: 1080 }) // Desktop
    await expect(page.getByLabel(/email/i)).toBeVisible()
    
    console.log(`✓ ${browserName} compatibility test passed`)
  })
})

test.describe('Performance Tests', () => {
  test('should load pages within performance targets', async ({ page }) => {
    // Target: Page loads <2s (FR requirement)
    const startTime = Date.now()
    
    await page.goto('/')
    
    const loadTime = Date.now() - startTime
    
    // Page should load within 2 seconds
    expect(loadTime).toBeLessThan(2000)
    
    console.log(`Page load time: ${loadTime}ms`)
  })
})

