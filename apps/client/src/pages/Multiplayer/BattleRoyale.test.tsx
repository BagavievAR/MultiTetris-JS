import { fireEvent, render, screen } from "@testing-library/react"

import BattleRoyale from "./BattleRoyale"

const mockRoomId = "test-room-id"
const mockedNavigate = jest.fn()

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockedNavigate,
}))

jest.mock("uuid", () => ({
  v4: () => mockRoomId,
}))

describe("BattleRoyale page", () => {
  beforeEach(() => {
    mockedNavigate.mockClear()
  })

  it("creates a new room and navigates to /room/royale/:id when clicking 'Создать комнату'", () => {
    render(<BattleRoyale />)

    const createButton = screen.getByText("Создать комнату")

    fireEvent.click(createButton)

    expect(mockedNavigate).toHaveBeenCalledTimes(1)
    expect(mockedNavigate).toHaveBeenCalledWith(`/room/royale/${mockRoomId}`)
  })

  it("navigates to invite page when clicking 'Ввести код приглашения'", () => {
    render(<BattleRoyale />)

    const inviteButton = screen.getByText("Ввести код приглашения")

    fireEvent.click(inviteButton)

    expect(mockedNavigate).toHaveBeenCalledTimes(1)
    expect(mockedNavigate).toHaveBeenCalledWith("/invite/yourInviteTokenHere")
  })

  it("renders heading and both buttons", () => {
    render(<BattleRoyale />)

    expect(screen.getByText("Battle Royale")).toBeInTheDocument()
    expect(screen.getByText("Создать комнату")).toBeInTheDocument()
    expect(screen.getByText("Ввести код приглашения")).toBeInTheDocument()
  })
})
