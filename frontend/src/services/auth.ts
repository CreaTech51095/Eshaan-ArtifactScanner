import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { User, CreateUserRequest, LoginRequest, AuthResponse, AuthError, UserRole } from '../types/user'

class AuthService {
  private currentUser: User | null = null
  private authStateListeners: ((user: User | null) => void)[] = []

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        this.currentUser = await this.getUserProfile(firebaseUser.uid)
      } else {
        this.currentUser = null
      }
      
      // Notify listeners
      this.authStateListeners.forEach(listener => listener(this.currentUser))
    })
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      )
      
      const user = await this.getUserProfile(userCredential.user.uid)
      const token = await userCredential.user.getIdToken()
      
      return {
        user,
        token,
        expiresIn: '3600'
      }
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  async register(userData: CreateUserRequest): Promise<AuthResponse> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      )

      // Update Firebase Auth profile
      await updateProfile(userCredential.user, {
        displayName: userData.displayName || userData.username
      })

      // Create user document in Firestore
      const user: User = {
        id: userCredential.user.uid,
        email: userData.email,
        username: userData.username,
        role: userData.role,
        displayName: userData.displayName,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isActive: true
      }

      await setDoc(doc(db, 'users', user.id), user)

      const token = await userCredential.user.getIdToken()

      return {
        user,
        token
      }
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser
  }

  async getUserProfile(userId: string): Promise<User> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      
      if (!userDoc.exists()) {
        // If user profile doesn't exist in Firestore, create one from Firebase Auth data
        const firebaseUser = auth.currentUser
        if (firebaseUser) {
          const newUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'user',
            role: 'researcher', // Default role
            displayName: firebaseUser.displayName || undefined,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            isActive: true
          }
          
          // Save to Firestore for future use
          await setDoc(doc(db, 'users', userId), newUser)
          return newUser
        }
        
        throw new Error('User profile not found and could not create one')
      }

      return userDoc.data() as User
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const userRef = doc(db, 'users', userId)
      await setDoc(userRef, updates, { merge: true })
      
      const updatedUser = await this.getUserProfile(userId)
      this.currentUser = updatedUser
      
      return updatedUser
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('No authenticated user')
      }
      
      return await user.getIdToken(true)
    } catch (error: any) {
      throw this.handleAuthError(error)
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return this.currentUser ? roles.includes(this.currentUser.role) : false
  }

  private handleAuthError(error: any): AuthError {
    let code = 'AUTHENTICATION_ERROR'
    let message = 'An authentication error occurred'

    switch (error.code) {
      case 'auth/user-not-found':
        code = 'USER_NOT_FOUND'
        message = 'No user found with this email address'
        break
      case 'auth/wrong-password':
        code = 'INVALID_CREDENTIALS'
        message = 'Invalid email or password'
        break
      case 'auth/email-already-in-use':
        code = 'EMAIL_ALREADY_EXISTS'
        message = 'An account with this email already exists'
        break
      case 'auth/weak-password':
        code = 'WEAK_PASSWORD'
        message = 'Password should be at least 6 characters'
        break
      case 'auth/invalid-email':
        code = 'INVALID_EMAIL'
        message = 'Invalid email address'
        break
      case 'auth/too-many-requests':
        code = 'TOO_MANY_REQUESTS'
        message = 'Too many failed attempts. Please try again later'
        break
      case 'auth/network-request-failed':
        code = 'NETWORK_ERROR'
        message = 'Network error. Please check your connection'
        break
      default:
        message = error.message || message
    }

    return {
      code,
      message,
      details: {
        originalError: error.code,
        timestamp: new Date().toISOString()
      }
    }
  }
}

export const authService = new AuthService()
export default authService
