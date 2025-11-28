import type { FC } from 'react'

import styles from './NextTetromino.module.css'

import type { Tetromino } from '../../types'

interface NextTetrominoProps {
  tetromino: Tetromino | null
  gridSize?: number
}

export const NextTetromino: FC<NextTetrominoProps> = ({
  tetromino,
  gridSize = 4,
}) => {
  if (!tetromino) {
    return (
      <div className={styles.container}>
        <span className={styles.placeholder}>Нет следующей фигуры</span>
      </div>
    )
  }

  const grid: number[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => 0),
  )

  tetromino.cells.forEach(({ x, y }) => {
    if (y >= 0 && y < gridSize && x >= 0 && x < gridSize) {
      grid[y][x] = tetromino.colorId
    }
  })

  return (
    <div className={styles.container}>
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={styles.cell}
              data-color={cell}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default NextTetromino