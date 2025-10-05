import { useState, useEffect, useCallback } from 'react'
import { authService } from '../services/auth'
import { User, CreateUserRequest, LoginRequest, AuthError, UserPermissions } from '../types/user'
import { getUserPermissions } from '../types/user'

export interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: AuthError | null
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: CreateUserRequest) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  refreshToken: () => Promise<string>
  isAuthenticated: boolean
  permissions: UserPermissions | null
  clearError: () => void
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setLoading(true)
      setError(null)
      const response = await authService.login(credentials)
      setUser(response.user)
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (userData: CreateUserRequest) => {
    try {
      setLoading(true)
      setError(null)
      const response = await authService.register(userData)
      setUser(response.user)
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await authService.logout()
      setUser(null)
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) {
      throw new Error('No authenticated user')
    }

    try {
      setLoading(true)
      setError(null)
      const updatedUser = await authService.updateUserProfile(user.id, updates)
      setUser(updatedUser)
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user])

  const refreshToken = useCallback(async (): Promise<string> => {
    try {
      setError(null)
      return await authService.refreshToken()
    } catch (err: any) {
      setError(err)
      throw err
    }
  }, [])

  const isAuthenticated = user !== null
  const permissions = user ? getUserPermissions(user.role) : null

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    // Get initial user state
    const getInitialUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        // User not authenticated
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialUser()

    return unsubscribe
  }, [])

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    refreshToken,
    isAuthenticated,
    permissions,
    clearError,
  }
}

export default useAuth
