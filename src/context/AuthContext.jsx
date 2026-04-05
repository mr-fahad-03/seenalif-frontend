"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import { authAPI } from "../services/api"
import { adminAPI } from "../services/api"

// Initial state - load permissions from localStorage if available
const getInitialPermissions = () => {
  try {
    const permissions = localStorage.getItem("adminPermissions")
    return permissions ? JSON.parse(permissions) : {}
  } catch {
    return {}
  }
}

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true,
  error: null,
  admin: null,
  adminToken: localStorage.getItem("adminToken"),
  isAdminAuthenticated: !!localStorage.getItem("adminToken"),
  isSuperAdmin: localStorage.getItem("isSuperAdmin") === "true",
  adminPermissions: getInitialPermissions(),
}

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  REGISTER_START: "REGISTER_START",
  REGISTER_SUCCESS: "REGISTER_SUCCESS",
  REGISTER_FAILURE: "REGISTER_FAILURE",
  VERIFY_EMAIL_START: "VERIFY_EMAIL_START",
  VERIFY_EMAIL_SUCCESS: "VERIFY_EMAIL_SUCCESS",
  VERIFY_EMAIL_FAILURE: "VERIFY_EMAIL_FAILURE",
  LOGOUT: "LOGOUT",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_LOADING: "SET_LOADING",
  UPDATE_PROFILE: "UPDATE_PROFILE",
  ADMIN_LOGIN_SUCCESS: "ADMIN_LOGIN_SUCCESS",
  ADMIN_LOGOUT: "ADMIN_LOGOUT",
  SET_ADMIN_PERMISSIONS: "SET_ADMIN_PERMISSIONS",
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.VERIFY_EMAIL_START:
      return {
        ...state,
        loading: true,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.VERIFY_EMAIL_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      }

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.VERIFY_EMAIL_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      }

    case AUTH_ACTIONS.ADMIN_LOGIN_SUCCESS:
      return {
        ...state,
        admin: action.payload.admin,
        adminToken: action.payload.token,
        isAdminAuthenticated: true,
        isSuperAdmin: action.payload.admin?.isSuperAdmin || false,
        adminPermissions: action.payload.admin?.permissions || {},
        loading: false,
        error: null,
      }

    case AUTH_ACTIONS.ADMIN_LOGOUT:
      return {
        ...state,
        admin: null,
        adminToken: null,
        isAdminAuthenticated: false,
        isSuperAdmin: false,
        adminPermissions: {},
        loading: false,
        error: null,
      }

    case AUTH_ACTIONS.SET_ADMIN_PERMISSIONS:
      return {
        ...state,
        isSuperAdmin: action.payload.isSuperAdmin || false,
        adminPermissions: action.payload.permissions || {},
      }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      }

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }

    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const userData = await authAPI.getProfile()
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: userData,
              token,
            },
          })
        } catch (error) {
          localStorage.removeItem("token")
          dispatch({
            type: AUTH_ACTIONS.LOGOUT,
          })
        }
      } else {
        dispatch({
          type: AUTH_ACTIONS.SET_LOADING,
          payload: false,
        })
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })
    try {
      const data = await authAPI.login(credentials)
      localStorage.setItem("token", data.token)
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: data,
          token: data.token,
        },
      })
      return { ...data, success: true }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message,
      })
      return { success: false, message: error.message }
    }
  }

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START })
    try {
      const data = await authAPI.register(userData)
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
      })
      return data
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: error.message,
      })
      throw error
    }
  }

  // Verify email function
  const verifyEmail = async (verificationData) => {
    dispatch({ type: AUTH_ACTIONS.VERIFY_EMAIL_START })
    try {
      const data = await authAPI.verifyEmail(verificationData)
      localStorage.setItem("token", data.token)
      dispatch({
        type: AUTH_ACTIONS.VERIFY_EMAIL_SUCCESS,
        payload: {
          user: data,
          token: data.token,
        },
      })
      return data
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.VERIFY_EMAIL_FAILURE,
        payload: error.message,
      })
      throw error
    }
  }

  // Resend verification function
  const resendVerification = async (email) => {
    try {
      const data = await authAPI.resendVerification(email)
      return data
    } catch (error) {
      throw error
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("token")
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
  }

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const data = await authAPI.updateProfile(profileData)
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: data,
      })
      return data
    } catch (error) {
      throw error
    }
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  const adminLogin = async (credentials) => {
    try {
      const data = await adminAPI.login(credentials)
      localStorage.setItem("adminToken", data.token)
      // Store permissions in localStorage for persistence
      localStorage.setItem("isSuperAdmin", data.isSuperAdmin ? "true" : "false")
      localStorage.setItem("adminPermissions", JSON.stringify(data.permissions || {}))
      dispatch({
        type: AUTH_ACTIONS.ADMIN_LOGIN_SUCCESS,
        payload: {
          admin: data,
          token: data.token,
        },
      })
      return { ...data, success: true }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const adminLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("isSuperAdmin")
    localStorage.removeItem("adminPermissions")
    dispatch({ type: AUTH_ACTIONS.ADMIN_LOGOUT })
  }

  // Check if admin has specific permission
  const hasPermission = (permission) => {
    // Super admin has all permissions
    if (state.isSuperAdmin) return true
    // Check for full access
    if (state.adminPermissions?.fullAccess) return true
    // Check specific permission
    return state.adminPermissions?.[permission] === true
  }

  // Load admin permissions from localStorage on mount
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken")
    if (adminToken) {
      const isSuperAdmin = localStorage.getItem("isSuperAdmin") === "true"
      const permissions = JSON.parse(localStorage.getItem("adminPermissions") || "{}")
      dispatch({
        type: AUTH_ACTIONS.SET_ADMIN_PERMISSIONS,
        payload: { isSuperAdmin, permissions },
      })
    }
  }, [])

  const value = {
    ...state,
    login,
    adminLogin,
    adminLogout,
    register,
    verifyEmail,
    resendVerification,
    logout,
    updateProfile,
    clearError,
    hasPermission,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default AuthContext
