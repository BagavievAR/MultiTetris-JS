import { fireEvent, render, screen } from "@testing-library/react"

import Profile from "./Profile"

const mockedNavigate = jest.fn()

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockedNavigate,
}))

describe("Profile page", () => {
  beforeEach(() => {
    mockedNavigate.mockClear()
  })

  it("renders heading, text and buttons", () => {
    render(<Profile />)

    expect(screen.getByText("Player Profile")).toBeInTheDocument()
    expect(
      screen.getByText("Welcome! Please log in or register to get started.")
    ).toBeInTheDocument()
    expect(screen.getByText("Login")).toBeInTheDocument()
    expect(screen.getByText("Register")).toBeInTheDocument()
  })

  it("navigates to /login when Login button is clicked", () => {
    render(<Profile />)

    const loginButton = screen.getByText("Login")

    fireEvent.click(loginButton)

    expect(mockedNavigate).toHaveBeenCalledTimes(1)
    expect(mockedNavigate).toHaveBeenCalledWith("/login")
  })

  it("navigates to /register when Register button is clicked", () => {
    render(<Profile />)

    const registerButton = screen.getByText("Register")
    
    fireEvent.click(registerButton)

    expect(mockedNavigate).toHaveBeenCalledTimes(1)
    expect(mockedNavigate).toHaveBeenCalledWith("/register")
  })
})
