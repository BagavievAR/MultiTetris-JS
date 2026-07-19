import { useEffect, useState } from 'react'

import { useAuth } from '../../contexts/AuthContext'
import {
  fetchSoloLeaderboard,
  type LeaderboardItem,
} from '../../services/leaderboard'

import './Leaderboard.css'

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<LeaderboardItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    void fetchSoloLeaderboard()
      .then((data) => {
        setItems(data)
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : 'Не удалось загрузить лидерборд',
        )
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-card">
        <h1>Лидерборд Solo</h1>

        {isLoading && <p>Загрузка...</p>}
        {error && <p className="lb-error">{error}</p>}

        {!isLoading && !error && items.length === 0 && (
          <p>Пока никто не сыграл ни одной игры в Solo.</p>
        )}

        {!isLoading && !error && items.length > 0 && (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Игрок</th>
                <th>Лучший счёт</th>
                <th>Сыграно игр</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const isCurrentUser = user && user.id === item.userId

                return (
                  <tr
                    key={item.userId}
                    className={isCurrentUser ? 'leaderboard-row--me' : undefined}
                  >
                    <td>{index + 1}</td>
                    <td>
                      {item.login}
                      {isCurrentUser && <span className="lb-badge-me">это вы</span>}
                    </td>
                    <td>{item.bestScore}</td>
                    <td>{item.gamesCount}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
