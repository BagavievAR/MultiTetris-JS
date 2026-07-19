import { useCallback, useEffect, useState } from 'react'

import {
  startNewGame,
  tick as engineTick,
  moveLeft as engineMoveLeft,
  moveRight as engineMoveRight,
  softDrop as engineSoftDrop,
  hardDrop as engineHardDrop,
  rotate as engineRotate,
} from './engine'

import type { GameState, ActiveTetromino } from './engine'
import type { CellColorId, Tetromino } from '../types/tetramino'

const TICK_MS = 500 // можно потом сделать зависящим от level

export interface UseSoloGameResult extends GameState {
  board: CellColorId[][]
  current: ActiveTetromino | null
  next: Tetromino | null
  isPaused: boolean
  startNewGame: () => void
  moveLeft: () => void
  moveRight: () => void
  softDrop: () => void
  hardDrop: () => void
  rotate: () => void
  togglePause: () => void
}

export const useSoloGame = (): UseSoloGameResult => {
  const [game, setGame] = useState<GameState>(() => startNewGame())
  const [isPaused, setIsPaused] = useState(false)

  // Игровой цикл
  useEffect(() => {
    if (!game.isRunning || game.isGameOver || isPaused) {
      return
    }

    const id = window.setInterval(() => {
      setGame((prev) => engineTick(prev))
    }, TICK_MS)

    return () => {
      window.clearInterval(id)
    }
  }, [game.isRunning, game.isGameOver, isPaused])

  const restart = useCallback(() => {
    setGame(startNewGame())
    setIsPaused(false)
  }, [])

  const moveLeft = useCallback(() => {
    setGame((prev) => engineMoveLeft(prev))
  }, [])

  const moveRight = useCallback(() => {
    setGame((prev) => engineMoveRight(prev))
  }, [])

  const softDrop = useCallback(() => {
    setGame((prev) => engineSoftDrop(prev))
  }, [])

  const hardDrop = useCallback(() => {
    setGame((prev) => engineHardDrop(prev))
  }, [])

  const rotate = useCallback(() => {
    setGame((prev) => engineRotate(prev))
  }, [])

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev)
  }, [])

  return {
    ...game,
    isPaused,
    startNewGame: restart,
    moveLeft,
    moveRight,
    softDrop,
    hardDrop,
    rotate,
    togglePause,
  }
}
