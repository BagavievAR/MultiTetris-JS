import { render, screen } from '@testing-library/react'

import { NextTetromino } from './NextTetromino'

describe('NextTetromino', () => {
  it('renders placeholder when tetromino is null', () => {
    render(<NextTetromino tetromino={null} />)
    expect(screen.getByText(/нет следующей фигуры/i)).toBeInTheDocument()
  })

  it('renders cells for tetromino', () => {
    const tetromino = {
      colorId: 1,
      cells: [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
      pivot: { x: 1.5, y: 1.5 },
    }
    const { container } = render(<NextTetromino tetromino={tetromino} />)
    const coloredCells = container.querySelectorAll('[data-color="1"]')

    expect(coloredCells.length).toBe(2)
  })

  it('ignores cells that are outside preview grid', () => {
    const tetromino = {
      colorId: 2,
      cells: [
        { x: -1, y: 0 },
        { x: 5, y: 5 },
      ],
      pivot: { x: 1, y: 2 },
    }

    const { container } = render(<NextTetromino tetromino={tetromino} />)
    const coloredCells = container.querySelectorAll('[data-color="2"]')

    expect(coloredCells.length).toBe(0)
  })
})
