import { FC } from "react"

import { useNavigate } from "react-router-dom"

const Profile: FC = () => {
  const navigate = useNavigate()

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Player Profile</h1>
      <p>Welcome! Please log in or register to get started.</p>

      <div style={{ marginTop: "30px", display: "flex", justifyContent: "center", gap: "20px" }}>
        <button onClick={() => navigate("/login")}>Login</button>
        <button onClick={() => navigate("/register")}>Register</button>
      </div>
    </div>
  )
}

export default Profile
