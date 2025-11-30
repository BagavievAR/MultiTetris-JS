import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

import App from "./App"

jest.mock("uuid", () => ({
  v4: () => "test-uuid",
}))

describe("App routing", () => {
  it("renders the Home page at root path", () => {
    render(
      <MemoryRouter
        initialEntries={["/"]}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole("heading", { name: /welcome to multitetris/i })
    ).toBeInTheDocument()

    expect(screen.getByText(/solo mode/i)).toBeInTheDocument()
    expect(screen.getByText(/multiplayer mode/i)).toBeInTheDocument()
  })

  it("renders the NotFound page for unknown routes", () => {
    render(
      <MemoryRouter
        initialEntries={["/unknown"]}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText(/404/i)).toBeInTheDocument()
  })
})
