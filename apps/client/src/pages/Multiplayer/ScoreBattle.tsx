import { useCallback, useEffect, useMemo, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../contexts/AuthContext'
import {
  createRoom,
  joinByCode,
  joinRoom,
  listRooms,
  getGuestLogin,
  type RoomListItem,
  type RoomVisibility,
} from '../../services/rooms'

import './Multiplayer.css'

export default function ScoreBattle() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const myLogin = user?.login ?? getGuestLogin()
  const myUserId = user?.id

  const mode = 'score' as const

  const [visibility, setVisibility] = useState<RoomVisibility>('public')
  const [createPassword, setCreatePassword] = useState('')

  const [code, setCode] = useState('')

  const [rooms, setRooms] = useState<RoomListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [roomName, setRoomName] = useState('')

  const refresh = useCallback(async () => {
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
  }, [mode])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const handleCreate = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const room = await createRoom(
        mode,
        {
          visibility,
          name: roomName.trim() ? roomName.trim() : 'Score room',
          password: createPassword.trim() ? createPassword.trim() : undefined,
        },
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
      let pass: string | undefined = undefined

      if (room.hasPassword) {
        const entered = window.prompt('Введите пароль комнаты') ?? ''

        pass = entered.trim() ? entered.trim() : undefined
      }

      const r = await joinRoom(
        room.id,
        { password: pass },
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
        c,
        undefined,
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

  const title = useMemo(() => 'Score Battle — комнаты', [])

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
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as RoomVisibility)}
                disabled={isLoading}
              >
                <option value="public">Публичная</option>
                <option value="friends">Только для друзей</option>
                <option value="private">Приватная</option>
              </select>
            </label>

            <label className="mp-label">
              Пароль (необязательно)
              <input
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
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

            <p className="mp-hint">Код выдаётся при создании комнаты (можно показать другу).</p>
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
                    <td>
                      {r.playersCount}/{r.maxPlayers}
                    </td>
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
