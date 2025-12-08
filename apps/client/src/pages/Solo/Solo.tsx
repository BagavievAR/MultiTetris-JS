import { Glass } from '../../components/game/Glass/Glass'
import { NextTetromino } from '../../components/game/NextTetromino/NextTetromino'
import { TETROMINOES } from '../../constants/tetrominoes'

import type { Tetromino } from '../../types/tetramino'
import './Solo.css'

const createEmptyGrid = (rows: number, cols: number): number[][] =>
  Array.from({ length: rows }, () => Array(cols).fill(0))

const placeTetromino = (
  grid: number[][],
  shape: Tetromino,
  offsetX: number,
  offsetY: number
) => {
  shape.cells.forEach(({ x, y }) => {
    const gx = offsetX + x
    const gy = offsetY + y

    if (gy >= 0 && gy < grid.length && gx >= 0 && gx < grid[0].length) {
      grid[gy][gx] = shape.colorId
    }
  })
}

const rotateClockwise = (shape: Tetromino): Tetromino => {
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
    cells: rotatedCells
  }
}

export default function Solo() {
  const grid = createEmptyGrid(20, 10)

  placeTetromino(grid, TETROMINOES.O, -1, 18)
  placeTetromino(grid, TETROMINOES.S, 2, 17)
  placeTetromino(grid, rotateClockwise(TETROMINOES.Z), 4, 5)
  placeTetromino(grid, rotateClockwise(rotateClockwise(TETROMINOES.J)), 0, 15)
  placeTetromino(grid, TETROMINOES.L, 4, 17)
  placeTetromino(grid, rotateClockwise(rotateClockwise(rotateClockwise(TETROMINOES.T))),2,14)

  const next = {
    colorId: TETROMINOES.I.colorId,
    cells: TETROMINOES.I.cells,
    pivot: TETROMINOES.I.pivot
  }

  return (
    <div className="app">
      <div>
        <h1>Tetris UI Demo</h1>
        <Glass grid={grid} />
      </div>
      <div className="sidebar">
        <h2>Следующее тетрамино</h2>
        <NextTetromino tetromino={next} />
      </div>
    </div>
  )
}

export { createEmptyGrid, placeTetromino, rotateClockwise }
