import { FormEvent, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../contexts/AuthContext'
import './Login.css'

export default function LoginPage() {
  const { login, isLoading, error } = useAuth()
  const navigate = useNavigate()

  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLocalError(null)

    if (!loginValue || !password) {
      setLocalError('Заполните логин и пароль')

      return
    }

    try {
      await login(loginValue, password)
      navigate('/profile', { replace: true })
    } catch {
      // error уже в контексте
    }
  }

  return (
    <div className="auth-page">
      <h1>Вход</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Логин
          <input
            type="text"
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
            disabled={isLoading}
          />
        </label>

        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </label>

        {(localError || error) && (
          <div className="auth-error">{localError ?? error}</div>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
