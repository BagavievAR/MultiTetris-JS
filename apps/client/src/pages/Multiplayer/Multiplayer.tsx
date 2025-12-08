import { Link } from 'react-router-dom'
import './Multiplayer.css'

const Multiplayer = () => {
  return (
    <div className="multiplayer-container">
      <h1>Multiplayer</h1>
      <p>Choose a mode:</p>
      <div className="button-group">
        <Link to="/multiplayer/score" className="mode-button">Score Battle</Link>
        <Link to="/multiplayer/royale" className="mode-button">Battle Royale</Link>
      </div>
    </div>
  )
}

export default Multiplayer
