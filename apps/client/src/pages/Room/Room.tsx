import { useParams, useNavigate } from "react-router-dom"

const Room = () => {
  const { id, mode } = useParams()
  const navigate = useNavigate()

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Комната {id} ({mode})</h2>
      <button onClick={() => navigate(`/room/${mode}/${id}/lobby`)}>Перейти в лобби</button>
    </div>
  )
}

export default Room
