import { useParams } from 'react-router-dom'

import Solo from '../Solo/Solo'

export default function BattleRoyaleGame() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="game-page">
      <h1>Battle Royale</h1>
      <p>Комната: {id}</p>

      <Solo />
    </div>
  )
}
