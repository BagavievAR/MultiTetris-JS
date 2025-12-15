import { useEffect, useMemo, useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../../contexts/AuthContext'
import {
  leaveRoom,
  onRoomState,
  setReady,
  startRoom,
  onGameStart,
  type RoomMode,
  type RoomState,
} from '../../services/rooms'
import { getRoomState } from '../../services/rooms'

import './Lobby.css'

export default function Lobby() {
  const navigate = useNavigate()
  const params = useParams()
  const { user } = useAuth()

  const mode = (params.mode === 'royale' ? 'royale' : 'score') as RoomMode
  const roomId = String(params.id ?? '')

  const mySocketLogin = user?.login ?? 'Guest'
  const myUserId = user?.id ?? null

  const [room, setRoom] = useState<RoomState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    const off = onRoomState((state) => {
      if (state.id !== roomId) return
      setRoom(state)
    })

    return () => off()
  }, [roomId])

  useEffect(() => {
    if (!roomId) return
    void getRoomState(roomId)
      .then((state) => setRoom(state))
      .catch(() => {
      })
  }, [roomId])

  useEffect(() => {
    const off = onGameStart(({ roomId: startedRoomId, mode }) => {
      if (startedRoomId !== roomId) return

      const url =
        mode === 'score'
          ? `/room/score/${roomId}/play`
          : `/room/royale/${roomId}/play`

      navigate(url, { replace: true })
    })

    return off
  }, [roomId, navigate])

  const players = useMemo(() => room?.players ?? [], [room])

  const me = useMemo(() => {
    const byUserId = myUserId ? players.find((p) => p.userId === myUserId) : undefined

    if (byUserId) return byUserId
    const byLogin = players.find((p) => p.login === mySocketLogin)

    return byLogin
  }, [players, myUserId, mySocketLogin])

  const isHost = Boolean(me?.isHost)
  const isReadyNow = Boolean(me?.isReady)
  const allReady = players.length > 0 && players.every((p) => p.isReady)
  const title = room?.name ? room.name : `Комната ${roomId.slice(0, 8)}…`

  const inviteCode = room?.inviteCode

  const handleToggleReady = async () => {
    setError(null)
    if (!room) return
    setIsBusy(true)

    try {
      await setReady(room.id, !isReadyNow)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось изменить готовность')
    } finally {
      setIsBusy(false)
    }
  }

  const handleStart = async () => {
    setError(null)
    if (!room) return
    setIsBusy(true)

    try {
      await startRoom(room.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось запустить игру')
    } finally {
      setIsBusy(false)
    }
  }

  const handleLeave = async () => {
    setError(null)
    setIsBusy(true)

    try {
      await leaveRoom(roomId)
    } finally {
      setIsBusy(false)
      navigate(`/multiplayer/${mode}`, { replace: true })
    }
  }

  const copyInvite = async () => {
    if (!inviteCode) return
    
    try {
      await navigator.clipboard.writeText(inviteCode)
    } catch {
      // не критично — можно игнорировать (в некоторых браузерах clipboard недоступен)
    }
  }

  return (
    <div className="lobby-page">
      <div className="lobby-card">
        <div className="lobby-head">
          <div>
            <h1 className="lobby-title">{title}</h1>
            <div className="lobby-sub">
              Режим: <b>{mode === 'score' ? 'Score Battle' : 'Battle Royale'}</b>
              {room?.maxPlayers ? (
                <>
                  {' '}
                  · Игроки: <b>{players.length}/{room.maxPlayers}</b>
                </>
              ) : null}
            </div>
          </div>

          <button className="lobby-leave" type="button" onClick={handleLeave} disabled={isBusy}>
            Выйти
          </button>
        </div>

        {inviteCode && (
          <div className="lobby-invite">
            <div>
              Код приглашения: <span className="lobby-code">{inviteCode}</span>
            </div>
            <button type="button" onClick={copyInvite} disabled={isBusy}>
              Копировать
            </button>
          </div>
        )}

        {error && <div className="lobby-error">{error}</div>}

        <div className="lobby-section">
          <h2>Игроки</h2>

          {room === null ? (
            <p className="lobby-muted">Ждём состояние комнаты… (если не появляется — нажми “Назад” и зайди снова)</p>
          ) : players.length === 0 ? (
            <p className="lobby-muted">Игроков пока нет.</p>
          ) : (
            <table className="lobby-table">
              <thead>
                <tr>
                  <th>Игрок</th>
                  <th>Статус</th>
                  <th>Роль</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => {
                  const isMe =
                    (myUserId && p.userId === myUserId) || (!myUserId && p.login === mySocketLogin)

                  return (
                    <tr key={p.socketId} className={isMe ? 'lobby-me' : undefined}>
                      <td>
                        {p.login} {isMe ? <span className="lobby-badge">это вы</span> : null}
                      </td>
                      <td>
                        {p.isReady ? (
                          <span className="lobby-ready">Готов</span>
                        ) : (
                          <span className="lobby-notready">Не готов</span>
                        )}
                      </td>
                      <td>{p.isHost ? <span className="lobby-host">Host</span> : ''}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="lobby-actions">
          <button type="button" className="lobby-ready-btn" onClick={handleToggleReady} disabled={isBusy || !room}>
            {isReadyNow ? 'Снять готовность' : 'Готов'}
          </button>

          <button type="button" onClick={handleStart} disabled={isBusy || !room || !isHost || !allReady}>
            Старт
          </button>

          <div className={`lobby-hint ${room && !allReady ? 'is-visible' : ''}`}>
            Чтобы начать игру, все игроки должны быть готовы (Start доступен host).
          </div>
        </div>
      </div>
    </div>
  )
}
