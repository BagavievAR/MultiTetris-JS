import { TETROMINOES } from '../constants/tetrominoes'

import type { Tetromino, CellColorId } from '../types/tetramino'

export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20

export interface ActiveTetromino {
  shape: Tetromino
  x: number
  y: number
}

export interface GameState {
  board: CellColorId[][]
  current: ActiveTetromino | null
  next: Tetromino | null
  score: number
  level: number
  linesCleared: number
  isGameOver: boolean
  isRunning: boolean
}

const TETROMINO_POOL: Tetromino[] = Object.values(TETROMINOES)

export const createEmptyBoard = (): CellColorId[][] =>
  Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => 0),
  )

const getRandomTetromino = (): Tetromino => {
  const index = Math.floor(Math.random() * TETROMINO_POOL.length)

  return TETROMINO_POOL[index]
}

const getSpawnPosition = (shape: Tetromino): ActiveTetromino => ({
  shape,
  x: Math.floor(BOARD_WIDTH / 2) - 2, // центр относительно 4×4 сетки
  y: 0,
})

const isInsideBoard = (x: number, y: number): boolean =>
  x >= 0 && x < BOARD_WIDTH && y < BOARD_HEIGHT

const collides = (
  board: CellColorId[][],
  active: ActiveTetromino,
  offsetX = 0,
  offsetY = 0,
  shapeOverride?: Tetromino,
): boolean => {
  const shape = shapeOverride ?? active.shape

  return shape.cells.some(({ x, y }) => {
    const boardX = active.x + x + offsetX
    const boardY = active.y + y + offsetY

    // Разрешаем появляться выше поля (y < 0)
    if (boardY < 0) return false

    // Выход за границы по бокам или снизу — коллизия
    if (!isInsideBoard(boardX, boardY)) return true

    // Столкновение с уже занятыми клетками
    return board[boardY][boardX] !== 0
  })
}

const placePieceOnBoard = (
  board: CellColorId[][],
  active: ActiveTetromino,
): CellColorId[][] => {
  const nextBoard = board.map((row) => [...row])

  active.shape.cells.forEach(({ x, y }) => {
    const boardX = active.x + x
    const boardY = active.y + y

    if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
      nextBoard[boardY][boardX] = active.shape.colorId
    }
  })

  return nextBoard
}

const clearFullLines = (board: CellColorId[][]) => {
  const newBoard: CellColorId[][] = []
  let cleared = 0

  for (let y = BOARD_HEIGHT - 1; y >= 0; y -= 1) {
    const row = board[y]
    const isFull = row.every((cell) => cell !== 0)

    if (isFull) {
      cleared += 1
    } else {
      newBoard.unshift(row)
    }
  }

  // Добавляем пустые строки сверху
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array.from({ length: BOARD_WIDTH }, () => 0))
  }

  return { board: newBoard, cleared }
}

const LINE_SCORES = [0, 100, 300, 500, 800]

const computeScore = (lines: number, level: number): number => {
  if (lines <= 0) return 0
  const base = LINE_SCORES[lines] ?? LINE_SCORES[LINE_SCORES.length - 1]

  return base * level
}

// Поворот фигуры по часовой стрелке вокруг pivot (как в текущем Solo.tsx)
export const rotateShapeClockwise = (shape: Tetromino): Tetromino => {
  const { pivot, colorId } = shape

  const rotatedCells = shape.cells.map(({ x, y }) => {
    const dx = x - pivot.x
    const dy = y - pivot.y

    const rotatedX = pivot.x - dy
    const rotatedY = pivot.y + dx

    return { x: rotatedX, y: rotatedY }
  })

  return {
    colorId,
    pivot,
    cells: rotatedCells,
  }
}

// Начальное состояние новой игры
export const startNewGame = (): GameState => {
  const board = createEmptyBoard()
  const firstShape = getRandomTetromino()
  const current = getSpawnPosition(firstShape)
  const next = getRandomTetromino()
  const blocked = collides(board, current, 0, 0)

  return {
    board,
    current: blocked ? null : current,
    next: blocked ? null : next,
    score: 0,
    level: 1,
    linesCleared: 0,
    isGameOver: blocked,
    isRunning: !blocked,
  }
}

// Общая функция, когда фигура "приземлилась"
const lockCurrentAndProceed = (state: GameState): GameState => {
  const { current } = state

  if (!current) return state

  const boardWithLocked = placePieceOnBoard(state.board, current)
  const { board: clearedBoard, cleared } = clearFullLines(boardWithLocked)

  const totalLines = state.linesCleared + cleared
  const score = state.score + computeScore(cleared, state.level)
  const level = 1 + Math.floor(totalLines / 10)

  const nextShape = state.next ?? getRandomTetromino()
  const newCurrent = getSpawnPosition(nextShape)
  const newNext = getRandomTetromino()

  const blocked = collides(clearedBoard, newCurrent, 0, 0)

  if (blocked) {
    return {
      ...state,
      board: clearedBoard,
      score,
      linesCleared: totalLines,
      level,
      current: null,
      next: null,
      isGameOver: true,
      isRunning: false,
    }
  }

  return {
    ...state,
    board: clearedBoard,
    score,
    linesCleared: totalLines,
    level,
    current: newCurrent,
    next: newNext,
  }
}

// Один "тик" игры — попытка опустить фигуру вниз
export const tick = (state: GameState): GameState => {
  if (!state.isRunning || state.isGameOver || !state.current) return state

  const moved: ActiveTetromino = {
    ...state.current,
    y: state.current.y + 1,
  }

  if (collides(state.board, moved)) {
    // Не можем опустить — фиксируем фигуру и спауним следующую
    return lockCurrentAndProceed(state)
  }

  return {
    ...state,
    current: moved,
  }
}

export const moveLeft = (state: GameState): GameState => {
  if (!state.isRunning || state.isGameOver || !state.current) return state

  const moved: ActiveTetromino = {
    ...state.current,
    x: state.current.x - 1,
  }

  if (collides(state.board, moved)) return state

  return {
    ...state,
    current: moved,
  }
}

export const moveRight = (state: GameState): GameState => {
  if (!state.isRunning || state.isGameOver || !state.current) return state

  const moved: ActiveTetromino = {
    ...state.current,
    x: state.current.x + 1,
  }

  if (collides(state.board, moved)) return state

  return {
    ...state,
    current: moved,
  }
}

export const softDrop = (state: GameState): GameState => {
  if (!state.isRunning || state.isGameOver || !state.current) return state

  const moved: ActiveTetromino = {
    ...state.current,
    y: state.current.y + 1,
  }

  if (collides(state.board, moved)) {
    return lockCurrentAndProceed(state)
  }

  return {
    ...state,
    current: moved,
  }
}

export const hardDrop = (state: GameState): GameState => {
  if (!state.isRunning || state.isGameOver || !state.current) return state

  let falling: ActiveTetromino = { ...state.current }

  // Опускаем фигуру до упора
  while (!collides(state.board, { ...falling, y: falling.y + 1 })) {
    falling = { ...falling, y: falling.y + 1 }
  }

  return lockCurrentAndProceed({
    ...state,
    current: falling,
  })
}

export const rotate = (state: GameState): GameState => {
  if (!state.isRunning || state.isGameOver || !state.current) return state

  const rotatedShape = rotateShapeClockwise(state.current.shape)

  if (collides(state.board, state.current, 0, 0, rotatedShape)) {
    return state
  }

  return {
    ...state,
    current: {
      ...state.current,
      shape: rotatedShape,
    },
  }
}

// Для удобства рендера: добавляем текущую фигуру к борду (копия)
export const projectCurrentPiece = (
  board: CellColorId[][],
  current: ActiveTetromino | null,
): CellColorId[][] => {
  if (!current) return board

  return placePieceOnBoard(board, current)
}
