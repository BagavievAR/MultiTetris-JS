import { useParams } from 'react-router-dom'

import Solo from '../Solo/Solo'

export default function ScoreBattleGame() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="game-page">
      <h1>Score Battle</h1>
      <p>Комната: {id}</p>

      {/* ВАЖНО: рендерим Solo ОДИН раз и без заголовка */}
      <Solo title={null} />
    </div>
  )
}
