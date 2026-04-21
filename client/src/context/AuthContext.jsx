import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

function initToken() {
  const stored = localStorage.getItem('auth_token')
  if (!stored) return null
  if (isTokenExpired(stored)) {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    return null
  }
  return stored
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(initToken)
  const [user, setUser] = useState(() => {
    // If initToken cleared localStorage, auth_token is gone — return null
    if (!localStorage.getItem('auth_token')) return null
    try { return JSON.parse(localStorage.getItem('auth_user')) } catch { return null }
  })

  // Set axios default Authorization header on mount and whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Global 401 interceptor — catches stale/invalid tokens from any API call
  useEffect(() => {
    const id = axios.interceptors.response.use(
      res => res,
      err => {
        const isAuthRoute = err.config?.url?.includes('/api/auth/')
        if (err.response?.status === 401 && !isAuthRoute && window.location.pathname !== '/') {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          delete axios.defaults.headers.common['Authorization']
          window.location.href = '/'
        }
        return Promise.reject(err)
      }
    )
    return () => axios.interceptors.response.eject(id)
  }, [])

  function authLogin(newToken, candidate) {
    setToken(newToken)
    setUser(candidate)
    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(candidate))
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  function authLogout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ token, user, authLogin, authLogout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
