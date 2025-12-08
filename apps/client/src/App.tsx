import { Routes, Route } from 'react-router-dom'

import Login from './components/auth/LoginForm/LoginForm'
import Register from './components/auth/RegisterForm/RegisterForm'
import Layout from './components/layout/Layout'
import About from './pages/About/About'
import Help from './pages/Help/Help'
import Home from './pages/Home/Home'
import Invite from './pages/Invite/Invite'
import Leaderboard from './pages/Leaderboard/Leaderboard'
import Lobby from './pages/Lobby/Lobby'
import BattleRoyale from './pages/Multiplayer/BattleRoyale'
import Multiplayer from './pages/Multiplayer/Multiplayer'
import ScoreBattle from './pages/Multiplayer/ScoreBattle'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile/Profile'
import Room from './pages/Room/Room'
import Solo from './pages/Solo/Solo'
import Support from './pages/Support/Support'

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="solo" element={<Solo />} />
        <Route path="multiplayer" element={<Multiplayer />} />
        <Route path="multiplayer/score" element={<ScoreBattle />} />
        <Route path="multiplayer/royale" element={<BattleRoyale />} />
        <Route path="room/:mode/:id" element={<Room />} />
        <Route path="invite/:token" element={<Invite />} />
        <Route path="lobby" element={<Lobby />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="profile" element={<Profile />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="about" element={<About />} />
        <Route path="support" element={<Support />} />
        <Route path="help" element={<Help />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/room/:mode/:id/lobby" element={<Lobby />} />
      </Route>
    </Routes>
  )
}

export default App
