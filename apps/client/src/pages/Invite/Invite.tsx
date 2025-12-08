import { useParams } from 'react-router-dom'

const Invite = () => {
  const { token } = useParams()

  return <div>Приглашение в комнату. Токен: {token}</div>
}

export default Invite
