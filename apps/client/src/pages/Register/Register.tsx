import { FormEvent, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../contexts/AuthContext'

import './Register.css'

export default function RegisterPage() {
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()

  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setErrorMessage(null)

    if (!loginValue || !password) {
      setErrorMessage('Заполните логин и пароль')

      return
    }

    if (password !== confirm) {
      setErrorMessage('Пароли не совпадают')
      
      return
    }

    try {
      await register(loginValue, password)
      navigate('/profile', { replace: true })
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Ошибка регистрации. Попробуйте ещё раз.'

      setErrorMessage(message)
    }
  }

  return (
    <div className="auth-page">
      <h1>Регистрация</h1>
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

        <label>
          Подтверждение пароля
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={isLoading}
          />
        </label>

        {errorMessage && <div className="auth-error">{errorMessage}</div>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Регистрируем...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  )
}
