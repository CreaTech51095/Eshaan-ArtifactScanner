import { useContext } from 'react'
import { AuthContext, AuthContextValue } from '../contexts/AuthContext'

export type UseAuthReturn = AuthContextValue

export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

export default useAuth
