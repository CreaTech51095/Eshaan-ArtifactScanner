import { Router, Request, Response, NextFunction } from 'express'
import * as admin from 'firebase-admin'

const router = Router()

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: any
}

/**
 * Middleware to verify admin authentication
 */
const verifyAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await admin.auth().verifyIdToken(token)

    // Get user document to check role
    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get()
    const userData = userDoc.data()

    if (!userData || userData.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' })
    }

    req.user = { uid: decodedToken.uid, ...userData }
    next()
  } catch (error) {
    console.error('Auth error:', error)
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

/**
 * Disable a user account (both Auth and Firestore)
 * POST /admin/users/:userId/disable
 */
router.post('/users/:userId/disable', verifyAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params

    // Get user document to check if they're admin
    const userDoc = await admin.firestore().collection('users').doc(userId).get()
    const userData = userDoc.data()

    if (!userData) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Cannot disable admin accounts
    if (userData.role === 'admin') {
      return res.status(403).json({ error: 'Cannot disable admin accounts' })
    }

    // Disable Firebase Auth account
    await admin.auth().updateUser(userId, {
      disabled: true
    })

    // Update Firestore document
    await admin.firestore().collection('users').doc(userId).update({
      isActive: false,
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      deletedBy: req.user.uid
    })

    console.log('✅ User disabled:', userId)
    res.json({ success: true, message: 'User account disabled' })
  } catch (error: any) {
    console.error('Error disabling user:', error)
    res.status(500).json({ error: error.message || 'Failed to disable user' })
  }
})

/**
 * Enable a user account (both Auth and Firestore)
 * POST /admin/users/:userId/enable
 */
router.post('/users/:userId/enable', verifyAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params

    // Enable Firebase Auth account
    await admin.auth().updateUser(userId, {
      disabled: false
    })

    // Update Firestore document
    await admin.firestore().collection('users').doc(userId).update({
      isActive: true,
      reactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
      reactivatedBy: req.user.uid,
      deletedAt: null,
      deletedBy: null
    })

    console.log('✅ User enabled:', userId)
    res.json({ success: true, message: 'User account enabled' })
  } catch (error: any) {
    console.error('Error enabling user:', error)
    res.status(500).json({ error: error.message || 'Failed to enable user' })
  }
})

/**
 * Update user role
 * POST /admin/users/:userId/role
 */
router.post('/users/:userId/role', verifyAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params
    const { role } = req.body

    if (!role || !['researcher', 'archaeologist', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    // Get user document to check current role
    const userDoc = await admin.firestore().collection('users').doc(userId).get()
    const userData = userDoc.data()

    if (!userData) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Update Firestore document
    await admin.firestore().collection('users').doc(userId).update({
      role: role,
      roleUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      roleUpdatedBy: req.user.uid
    })

    console.log('✅ User role updated:', userId, 'to', role)
    res.json({ success: true, message: 'User role updated' })
  } catch (error: any) {
    console.error('Error updating role:', error)
    res.status(500).json({ error: error.message || 'Failed to update role' })
  }
})

export default router

