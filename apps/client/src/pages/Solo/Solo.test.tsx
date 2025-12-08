import type { ComponentProps } from "react"

import { render, screen } from "@testing-library/react"

import Solo, { createEmptyGrid, placeTetromino } from "./Solo"
import { Glass as GlassComponent } from "../../components/game/Glass/Glass"
import { NextTetromino as NextTetrominoComponent } from "../../components/game/NextTetromino/NextTetromino"
import { TETROMINOES } from "../../constants/tetrominoes"

import type { Tetromino } from "../../types/tetramino"

type GlassProps = ComponentProps<typeof GlassComponent>
type NextTetrominoProps = ComponentProps<typeof NextTetrominoComponent>

let lastGlassProps: GlassProps | null = null
let lastNextProps: NextTetrominoProps | null = null

jest.mock("../../components/game/Glass/Glass", () => ({
  Glass: (props: GlassProps) => {
    lastGlassProps = props

    return <div data-testid="glass-mock" />
  },
}))

jest.mock("../../components/game/NextTetromino/NextTetromino", () => ({
  NextTetromino: (props: NextTetrominoProps) => {
    lastNextProps = props

    return <div data-testid="next-mock" />
  },
}))

describe("Solo page", () => {
  beforeEach(() => {
    lastGlassProps = null
    lastNextProps = null
  })

  it("renders page and passes correct props to Glass and NextTetromino", () => {
    render(<Solo />)

    expect(screen.getByText("Tetris UI Demo")).toBeInTheDocument()
    expect(screen.getByText("Следующее тетрамино")).toBeInTheDocument()

    expect(screen.getByTestId("glass-mock")).toBeInTheDocument()
    expect(screen.getByTestId("next-mock")).toBeInTheDocument()

    expect(lastGlassProps).not.toBeNull()

    const grid = lastGlassProps!.grid

    expect(grid.length).toBe(20)
    grid.forEach((row) => expect(row.length).toBe(10))

    const flat = grid.flat()

    expect(flat.some((cell) => cell === 0)).toBe(true)
    expect(flat.some((cell) => cell !== 0)).toBe(true)

    expect(lastNextProps).not.toBeNull()

    const received = lastNextProps!.tetromino
    const expected = TETROMINOES.I

    if (!received) {
      throw new Error("Tetromino should not be null in Solo page")
    }

    expect(received.colorId).toBe(expected.colorId)
    expect(received.cells).toEqual(expected.cells)
    expect(received.pivot).toEqual(expected.pivot)
  })

  it("placeTetromino writes only in-bounds cells", () => {
    const grid = createEmptyGrid(2, 2)

    const shape: Tetromino = {
      colorId: 7,
      pivot: { x: 0, y: 0 },
      cells: [
        { x: 0, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
        { x: 2, y: 0 },
        { x: 0, y: 2 }, 
      ],
    }

    placeTetromino(grid, shape, 0, 0)

    expect(grid[0][0]).toBe(7)
    expect(grid[0][1]).toBe(0)
    expect(grid[1][0]).toBe(0)
    expect(grid[1][1]).toBe(0)
  })
})