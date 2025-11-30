import { fireEvent, render, screen } from "@testing-library/react"

import Home from "./Home"

const mockedNavigate = jest.fn()

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockedNavigate,
}))

describe("Home page", () => {
  beforeEach(() => {
    mockedNavigate.mockClear()
  })

  it("renders heading and both buttons", () => {
    render(<Home />)

    expect(screen.getByText("Welcome to MultiTetris")).toBeInTheDocument()
    expect(screen.getByText("Solo Mode")).toBeInTheDocument()
    expect(screen.getByText("Multiplayer Mode")).toBeInTheDocument()
  })

  it("navigates to /solo when Solo Mode button is clicked", () => {
    render(<Home />)

    const soloButton = screen.getByText("Solo Mode")

    fireEvent.click(soloButton)

    expect(mockedNavigate).toHaveBeenCalledTimes(1)
    expect(mockedNavigate).toHaveBeenCalledWith("/solo")
  })

  it("navigates to /multiplayer when Multiplayer Mode button is clicked", () => {
    render(<Home />)

    const multiplayerButton = screen.getByText("Multiplayer Mode")
    
    fireEvent.click(multiplayerButton)

    expect(mockedNavigate).toHaveBeenCalledTimes(1)
    expect(mockedNavigate).toHaveBeenCalledWith("/multiplayer")
  })
})
