import type { FC } from 'react'

import styles from './Glass.module.css'

import type { CellColorId } from '../../types'

export interface GlassProps {
  grid: CellColorId[][]
  defaultRows?: number
  defaultCols?: number
}

export const Glass: FC<GlassProps> = ({
  grid,
  defaultRows = 20,
  defaultCols = 10,
}) => {
  const normalized: CellColorId[][] = []

  for (let y = 0; y < defaultRows; y += 1) {
    const row: CellColorId[] = []

    for (let x = 0; x < defaultCols; x += 1) {
      row.push(grid[y]?.[x] ?? 0)
    }
    normalized.push(row)
  }

  return (
    <div
      className={styles.glass}
      style={{
        gridTemplateRows: `repeat(${defaultRows}, 1fr)`,
        gridTemplateColumns: `repeat(${defaultCols}, 1fr)`,
      }}
    >
      {normalized.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className={styles.cell}
            data-color={cell}
          />
        )),
      )}
    </div>
  )
}

export default Glass
