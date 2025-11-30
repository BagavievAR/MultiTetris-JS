import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Welcome to MultiTetris</h1>
      <div style={{ marginTop: '40px' }}>
        <button
          onClick={() => navigate('/solo')}
          style={{ marginRight: '20px', padding: '20px 40px', fontSize: '20px' }}
        >
          Solo Mode
        </button>
        <button
          onClick={() => navigate('/multiplayer')}
          style={{ padding: '20px 40px', fontSize: '20px' }}
        >
          Multiplayer Mode
        </button>
      </div>
    </div>
  )
}
