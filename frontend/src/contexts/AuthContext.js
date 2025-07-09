"use client"

/**
 * Authentication Context
 * Global state management for user authentication and session handling
 */

import { createContext, useState, useContext, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem("token"))

  // Initialize authentication state on app load
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["x-auth-token"] = token
      loadUser()
    } else {
      setLoading(false)
    }
  }, [token])

  // Load current user data from server
  const loadUser = async () => {
    try {
      const res = await axios.get("/api/auth/me")
      setUser(res.data)
    } catch (error) {
      console.error("Error loading user:", error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  // User login with email and password
  const login = async (email, password) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password })
      const { token, user } = res.data

      localStorage.setItem("token", token)
      setToken(token)
      setUser(user)
      axios.defaults.headers.common["x-auth-token"] = token

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      }
    }
  }

  // User registration
  const register = async (name, email, password) => {
    try {
      const res = await axios.post("/api/auth/register", { name, email, password })
      const { token, user } = res.data

      localStorage.setItem("token", token)
      setToken(token)
      setUser(user)
      axios.defaults.headers.common["x-auth-token"] = token

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      }
    }
  }

  // Clear authentication state
  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common["x-auth-token"]
  }

  // Update user data in state
  const updateUser = (userData) => {
    setUser(userData)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
