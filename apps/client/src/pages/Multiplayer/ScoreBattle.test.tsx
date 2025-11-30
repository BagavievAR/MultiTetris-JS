import { fireEvent, render, screen } from "@testing-library/react"

import Score from "./ScoreBattle"

const mockRoomId = "test-score-room-id"
const mockedNavigate = jest.fn()

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockedNavigate,
}))

jest.mock("uuid", () => ({
  v4: () => mockRoomId,
}))

describe("ScoreBattle page", () => {
  beforeEach(() => {
    mockedNavigate.mockClear()
  })

  it("creates a new room and navigates to /room/score/:id when clicking 'Создать комнату'", () => {
    render(<Score />)

    const createButton = screen.getByText("Создать комнату")
    
    fireEvent.click(createButton)

    expect(mockedNavigate).toHaveBeenCalledTimes(1)
    expect(mockedNavigate).toHaveBeenCalledWith(`/room/score/${mockRoomId}`)
  })

  it("navigates to invite page when clicking 'Ввести код приглашения'", () => {
    render(<Score />)

    const inviteButton = screen.getByText("Ввести код приглашения")
    
    fireEvent.click(inviteButton)

    expect(mockedNavigate).toHaveBeenCalledTimes(1)
    expect(mockedNavigate).toHaveBeenCalledWith("/invite/yourInviteTokenHere")
  })

  it("renders heading and both buttons", () => {
    render(<Score />)

    expect(screen.getByText("Score Battle")).toBeInTheDocument()
    expect(screen.getByText("Создать комнату")).toBeInTheDocument()
    expect(screen.getByText("Ввести код приглашения")).toBeInTheDocument()
  })
})
