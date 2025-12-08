import { fireEvent, render, screen } from "@testing-library/react"

import Room from "./Room"

const mockedNavigate = jest.fn()

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockedNavigate,
  useParams: () => ({
    id: "123",
    mode: "score",
  }),
}))

describe("Room page", () => {
  beforeEach(() => {
    mockedNavigate.mockClear()
  })

  it("renders room title with id and mode", () => {
    render(<Room />)

    expect(screen.getByText("Комната 123 (score)")).toBeInTheDocument()
  })

  it("navigates to lobby when clicking the button", () => {
    render(<Room />)

    const button = screen.getByText("Перейти в лобби")
    
    fireEvent.click(button)

    expect(mockedNavigate).toHaveBeenCalledTimes(1)
    expect(mockedNavigate).toHaveBeenCalledWith("/room/score/123/lobby")
  })
})
