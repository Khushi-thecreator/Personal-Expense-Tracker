import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()
const API_URL = `${import.meta.env.VITE_API_URL}/auth`

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ef_user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(localStorage.getItem('ef_token'))

  useEffect(() => {
    if (token) {
      localStorage.setItem('ef_token', token)
    } else {
      localStorage.removeItem('ef_token')
    }
  }, [token])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ef_user', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('ef_user')
    }
  }, [currentUser])

  async function register(name, email, password) {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await response.json()
      if (!response.ok) return { success: false, message: data.message }
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Server connection failed' }
    }
  }

  async function login(email, password) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) return { success: false, message: data.message }
      
      setToken(data.token)
      setCurrentUser(data.user)
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Server connection failed' }
    }
  }

  function logout() {
    setToken(null)
    setCurrentUser(null)
  }

  const value = { currentUser, token, register, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
