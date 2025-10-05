import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

// Initialize Firebase Admin
admin.initializeApp()

// Import route handlers
import authRoutes from './auth'
import artifactRoutes from './artifacts'
import photoRoutes from './photos'
import syncRoutes from './sync'

const app = express()

// Middleware
app.use(helmet())
app.use(cors({ origin: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/auth', authRoutes)
app.use('/artifacts', artifactRoutes)
app.use('/photos', photoRoutes)
app.use('/sync', syncRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app)
