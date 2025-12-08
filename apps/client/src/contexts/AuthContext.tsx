import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  fetchMe,
  loginRequest,
  registerRequest,
  type AuthUser,
} from '../services/auth'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  error: string | null
}

interface AuthContextValue extends AuthState {
  login: (login: string, password: string) => Promise<void>
  register: (login: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'multitetris_auth'

interface StoredAuth {
  token: string
  user: AuthUser
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)

      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw) as StoredAuth

      if (parsed.token && parsed.user) {
        setToken(parsed.token)
        setUser(parsed.user)
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const saveAuth = useCallback((nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken)
    setUser(nextUser)
    const stored: StoredAuth = {
      token: nextToken,
      user: nextUser,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  }, [])

  const clearAuth = useCallback(() => {
    setToken(null)
    setUser(null)
    setError(null)
    window.localStorage.removeItem(STORAGE_KEY)
  }, [])

  const login = useCallback(
    async (loginValue: string, password: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const { token: nextToken, user: nextUser } = await loginRequest(
          loginValue,
          password,
        )

        saveAuth(nextToken, nextUser)
      } catch (e) {
        const err = e instanceof Error ? e.message : 'Ошибка входа'

        setError(err)
        clearAuth()
        throw e
      } finally {
        setIsLoading(false)
      }
    },
    [clearAuth, saveAuth],
  )

  const register = useCallback(
    async (loginValue: string, password: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const { token: nextToken, user: nextUser } = await registerRequest(
          loginValue,
          password,
        )

        saveAuth(nextToken, nextUser)
      } catch (e) {
        const err = e instanceof Error ? e.message : 'Ошибка регистрации'

        setError(err)
        clearAuth()
        throw e
      } finally {
        setIsLoading(false)
      }
    },
    [clearAuth, saveAuth],
  )

  const logout = useCallback(() => {
    clearAuth()
  }, [clearAuth])

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        return
      }

      try {
        const me = await fetchMe(token)

        setUser(me)
      } catch {
        clearAuth()
      }
    }

    void validate()
  }, [token, clearAuth])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      error,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, error, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth должен использоваться внутри AuthProvider')
  }

  return ctx
}
