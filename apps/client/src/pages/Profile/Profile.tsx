import { useEffect, useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../../contexts/AuthContext'
import { fetchMySoloResults, type SoloResult } from '../../services/soloResults'

import './Profile.css'

export default function ProfilePage() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()

  const [results, setResults] = useState<SoloResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setResults([])

      return
    }

    setIsLoading(true)
    setError(null)

    void fetchMySoloResults(token)
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
        )

        setResults(sorted)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить историю')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [token])

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  if (!user) {
    return (
      <div className="auth-card">
        <h1>Профиль</h1>
        <p>Вы не авторизованы.</p>
        <p>Войдите или зарегистрируйтесь, чтобы видеть свою статистику.</p>

        <div className="auth-card-actions">
          <Link to="/login" className="auth-card-button auth-card-button--primary">
            Войти
          </Link>
          <Link to="/register" className="auth-card-button">
            Регистрация
          </Link>
        </div>
      </div>
    )
  }

  // --- Авторизованный пользователь ---
  const bestResult = results.reduce<SoloResult | null>((best, current) => {
    if (!best) return current
    
    return current.score > best.score ? current : best
  }, null)

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-card-header">
          <h1>Профиль игрока</h1>
          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Выйти
          </button>
        </div>

        <div className="profile-main">
          <div className="avatar-placeholder">
            {user.login[0]?.toUpperCase()}
          </div>
          <div className="profile-info">
            <p>
              <strong>Логин:</strong> {user.login}
            </p>
            <p>
              <strong>ID:</strong> {user.id}
            </p>
            {bestResult ? (
              <p>
                <strong>Лучший результат (Solo):</strong> {bestResult.score} очков,
                уровень {bestResult.level}, линий очищено {bestResult.linesCleared}
              </p>
            ) : (
              <p>
                <strong>Лучший результат (Solo):</strong> ещё нет игр
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="profile-history">
        <h2>История соло-игр</h2>

        {isLoading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}

        {!isLoading && !error && results.length === 0 && (
          <p>Вы ещё не сыграли ни одной игры в Solo.</p>
        )}

        {!isLoading && !error && results.length > 0 && (
          <table className="history-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Режим</th>
                <th>Очки</th>
                <th>Линии</th>
                <th>Уровень</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>{r.mode}</td>
                  <td>{r.score}</td>
                  <td>{r.linesCleared}</td>
                  <td>{r.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
