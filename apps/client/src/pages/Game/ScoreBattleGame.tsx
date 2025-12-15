import { useEffect, useMemo, useRef, useState } from 'react'

import { useParams } from 'react-router-dom'

import { Glass } from '../../components/game/Glass/Glass'
import { onGameState, sendGameState } from '../../services/rooms'
import Solo from '../Solo/Solo'

type SoloSnapshot = {
  board: number[][]
  current: unknown
  next: unknown
  score: number
  level: number
  linesCleared: number
  isGameOver: boolean
  isRunning: boolean
  isPaused: boolean
}

type GameStatePayload = {
  roomId: string
  board: number[][]
  score: number
  lines: number
  level: number
  ts: number
}

type EnemySnapshot = GameStatePayload

export default function ScoreBattleGame() {
  const { id } = useParams<{ id: string }>()
  const roomId = (id ?? '').trim()

  const [enemy, setEnemy] = useState<EnemySnapshot | null>(null)
  const lastSentRef = useRef<number>(0)

  useEffect(() => {
    if (!roomId) return

    const off = onGameState((p: GameStatePayload) => {
      if (p.roomId !== roomId) return
      setEnemy(p)
    })

    return () => {
      off()
    }
  }, [roomId])

  const enemyGrid = useMemo(() => {
    if (!enemy) return null

    return enemy.board
  }, [enemy])

  const handleMyState = (s: SoloSnapshot) => {
    if (!roomId) return

    const now = Date.now()

    if (now - lastSentRef.current < 150) return
    lastSentRef.current = now

    void sendGameState(roomId, {
      board: s.board,
      score: s.score,
      lines: s.linesCleared,
      level: s.level,
    })
  }

  const title = useMemo(() => `Score Battle`, [])
  const shortId = useMemo(() => (roomId ? `${roomId.slice(0, 8)}…` : ''), [roomId])

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 420 }}>
        <h1>{title}</h1>
        <p>Комната: {shortId}</p>
        <Solo title={null} onState={handleMyState} />
      </div>

      <div style={{ width: 320 }}>
        <h2>Соперник</h2>

        {enemy ? (
          <>
            <Glass grid={enemyGrid ?? enemy.board} />
            <div style={{ marginTop: 12 }}>
              <p>Счёт: {enemy.score}</p>
              <p>Линии: {enemy.lines}</p>
              <p>Уровень: {enemy.level}</p>
            </div>
          </>
        ) : (
          <p style={{ opacity: 0.8 }}>Ожидание данных от соперника…</p>
        )}

      </div>
    </div>
  )
}
