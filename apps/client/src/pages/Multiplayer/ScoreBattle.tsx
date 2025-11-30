import { FC } from "react"

import { useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"

const Score: FC = () => {
  const navigate = useNavigate()

  const createRoom = () => {
    const roomId = uuidv4()

    navigate(`/room/score/${roomId}`)
  }

  const joinByInvite = () => {
    navigate("/invite/yourInviteTokenHere")
  }

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Score Battle</h1>
      <button onClick={createRoom}>Создать комнату</button>
      <button onClick={joinByInvite}>Ввести код приглашения</button>
    </div>
  )
}

export default Score
