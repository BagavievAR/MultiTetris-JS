import { useEffect, useRef } from 'react'

import { Glass } from '../../components/game/Glass/Glass'
import { NextTetromino } from '../../components/game/NextTetromino/NextTetromino'
import { useAuth } from '../../contexts/AuthContext'
import { projectCurrentPiece } from '../../game/engine'
import { useSoloGame } from '../../game/useSoloGame'
import { saveSoloResult } from '../../services/soloResults'

import './Solo.css'

export default function Solo() {
  const {
    board,
    current,
    next,
    score,
    level,
    linesCleared,
    isGameOver,
    isRunning,
    isPaused,
    startNewGame,
    moveLeft,
    moveRight,
    softDrop,
    hardDrop,
    rotate,
    togglePause,
  } = useSoloGame()

  const { token, user } = useAuth()

  const isResultSavedRef = useRef(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isRunning || isGameOver) {
        return
      }

      switch (event.code) {
      case 'ArrowLeft':
        event.preventDefault()
        moveLeft()
        break
      case 'ArrowRight':
        event.preventDefault()
        moveRight()
        break
      case 'ArrowDown':
        event.preventDefault()
        softDrop()
        break
      case 'ArrowUp':
        event.preventDefault()
        rotate()
        break
      case 'Space':
        event.preventDefault()
        hardDrop()
        break
      case 'KeyP':
      case 'Escape':
        event.preventDefault()
        togglePause()
        break
      default:
        break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isRunning, isGameOver, moveLeft, moveRight, softDrop, hardDrop, rotate, togglePause])

  useEffect(() => {
    if (isGameOver && !isResultSavedRef.current) {
      isResultSavedRef.current = true

      void saveSoloResult(
        {
          score,
          level,
          linesCleared,
        },
        token,
      ).catch((error) => {
        console.error('Не удалось сохранить результат игры', error)
      })
    }

    if (!isGameOver) {
      isResultSavedRef.current = false
    }
  }, [isGameOver, score, level, linesCleared, token])

  const displayGrid = projectCurrentPiece(board, current)

  return (
    <div className="app">
      <div>
        <h1>Solo Tetris</h1>
        <Glass grid={displayGrid} />
      </div>

      <div className="sidebar">
        <h2>Следующее тетрамино</h2>
        <NextTetromino tetromino={next} />

        <div className="stats">
          <p>Счёт: {score}</p>
          <p>Линии: {linesCleared}</p>
          <p>Уровень: {level}</p>
        </div>

        <div className="controls-hint">
          <p>← → — движение</p>
          <p>↑ — поворот</p>
          <p>↓ — мягкий дроп</p>
          <p>Space — жёсткий дроп</p>
          <p>P / Esc — пауза</p>
        </div>

        {!user && (
          <div className="hint auth-hint">
            <p>Играете как гость. Войдите, чтобы сохранять рекорды.</p>
          </div>
        )}

        {isPaused && !isGameOver && (
          <div className="pause-info">
            <p>Пауза</p>
          </div>
        )}

        {isGameOver && (
          <div className="game-over">
            <p>Игра окончена</p>
            {user && (
              <p className="game-over__saved">
                Результат сохранён в профиль игрока {user.login}
              </p>
            )}
            <button type="button" onClick={startNewGame}>
              Сыграть ещё раз
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
