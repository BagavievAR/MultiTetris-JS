import { useEffect, useMemo, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../contexts/AuthContext'
import { createRoom, joinRoom, joinByCode, getGuestLogin, listRooms, type RoomListItem } from '../../services/rooms'

import type { RoomVisibility } from '../../services/rooms'

import './Multiplayer.css'

export default function BattleRoyale() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const myLogin = user?.login ?? getGuestLogin()
  const myUserId = user?.id

  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')

  const [rooms, setRooms] = useState<RoomListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [roomName, setRoomName] = useState('')

  const mode = 'royale' as const

  const refresh = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const data = await listRooms(mode)

      setRooms(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить список комнат')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const handleCreate = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const room = await createRoom(
        mode,
        { visibility, name: roomName.trim() ? roomName.trim() : 'Royale room', password: password || undefined },
        {
          login: myLogin,
          userId: myUserId,
        },
      )

      navigate(`/room/${mode}/${room.id}/lobby`, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать комнату')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinFromList = async (room: RoomListItem) => {
    setError(null)
    setIsLoading(true)

    try {
      if (room.hasPassword) {
        window.prompt('Введите пароль комнаты')
      }
      const r = await joinRoom(
        room.id,
        { password: password.trim() ? password.trim() : undefined },
        {
          login: myLogin,
          userId: myUserId,
        },
      )

      navigate(`/room/${mode}/${r.id}/lobby`, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось подключиться')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinByCode = async () => {
    const c = code.trim().toUpperCase()

    if (!c) return
    setError(null)
    setIsLoading(true)

    try {
      const r = await joinByCode(
        mode,
        code,
        { password: password.trim() ? password.trim() : undefined },
        {
          login: myLogin,
          userId: myUserId,
        },
      )

      navigate(`/room/${mode}/${r.id}/lobby`, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось подключиться по коду')
    } finally {
      setIsLoading(false)
    }
  }

  const title = useMemo(() => 'Battle Royale — комнаты', [])

  return (
    <div className="mp-page">
      <div className="mp-card">
        <h1>{title}</h1>

        <div className="mp-grid">
          <div className="mp-block">
            <h2>Создать комнату</h2>

            <label className="mp-label">
              Название комнаты
              <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Например: Дуэль на очки"
                disabled={isLoading}
                maxLength={30}
              />
            </label>

            <label className="mp-label">
              Видимость
              <select value={visibility} onChange={(e) => setVisibility(e.target.value as RoomVisibility)} disabled={isLoading}>
                <option value="public">Публичная</option>
                <option value="friends">Только для друзей</option>
                <option value="private">Приватная</option>
              </select>
            </label>

            <label className="mp-label">
              Пароль (необязательно)
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                disabled={isLoading}
              />
            </label>

            <button type="button" onClick={handleCreate} disabled={isLoading}>
              Создать и перейти в лобби
            </button>
          </div>

          <div className="mp-block">
            <h2>Войти по коду</h2>

            <div className="mp-row">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Invite code (например: AB12CD)"
                disabled={isLoading}
              />
              <button type="button" onClick={handleJoinByCode} disabled={isLoading || !code.trim()}>
                Войти
              </button>
            </div>

            <p className="mp-hint">Код выдаётся при создании комнаты.</p>
          </div>
        </div>

        <div className="mp-block">
          <div className="mp-row mp-row--space">
            <h2>Список комнат</h2>
            <button type="button" onClick={refresh} disabled={isLoading}>
              Обновить
            </button>
          </div>

          {error && <div className="mp-error">{error}</div>}
          {isLoading && <p>Загрузка...</p>}
          {!isLoading && rooms.length === 0 && <p>Пока нет доступных комнат.</p>}

          {!isLoading && rooms.length > 0 && (
            <table className="mp-table">
              <thead>
                <tr>
                  <th>Комната</th>
                  <th>ID</th>
                  <th>Игроки</th>
                  <th>Пароль</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td className="mp-mono">{r.id.slice(0, 8)}…</td>
                    <td>{r.playersCount}/{r.maxPlayers}</td>
                    <td>{r.hasPassword ? '🔒' : ''}</td>
                    <td>
                      <button type="button" onClick={() => void handleJoinFromList(r)} disabled={isLoading}>
                        Join
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
