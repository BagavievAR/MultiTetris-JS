import { render } from '@testing-library/react'

import { Glass } from './Glass'

describe('Glass', () => {
  it('renders correct number of cells for default size', () => {
    const grid = Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => 0),
    )
    const { container } = render(<Glass grid={grid} />)
    const cells = container.querySelectorAll('[data-color]')

    expect(cells.length).toBe(20 * 10)
  })

  it('applies color ids from grid', () => {
    const grid = [
      [0, 1],
      [2, 0],
    ]
    const { container } = render(
      <Glass grid={grid} defaultRows={2} defaultCols={2} />,
    )

    expect(container.querySelectorAll('[data-color="1"]').length).toBe(1)
    expect(container.querySelectorAll('[data-color="2"]').length).toBe(1)
  })

  it('fills missing cells with 0 when grid is smaller than defaults', () => {
    const grid = [[1]] // 1x1
    const { container } = render(
      <Glass grid={grid} defaultRows={2} defaultCols={2} />,
    )

    const allCells = container.querySelectorAll('[data-color]')
    
    expect(allCells.length).toBe(4)

    const colored = container.querySelectorAll('[data-color="1"]')
    const empty = container.querySelectorAll('[data-color="0"]')

    expect(colored.length).toBe(1)
    expect(empty.length).toBe(3)
  })
})
