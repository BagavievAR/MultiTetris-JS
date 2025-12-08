export interface AuthUser {
  id: string
  login: string
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const handleResponse = async <T>(res: Response): Promise<T> => {
  const text = await res.text()
  const data = text ? (JSON.parse(text) as unknown) : null

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message?: unknown }).message)
        : `Request failed with status ${res.status}`

    throw new Error(message)
  }

  return data as T
}

export const registerRequest = async (
  login: string,
  password: string,
): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ login, password }),
  })

  return handleResponse<AuthResponse>(res)
}

export const loginRequest = async (
  login: string,
  password: string,
): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ login, password }),
  })

  return handleResponse<AuthResponse>(res)
}

export const fetchMe = async (token: string): Promise<AuthUser> => {
  const res = await fetch(`${API_URL}/api/profile/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return handleResponse<AuthUser>(res)
}
