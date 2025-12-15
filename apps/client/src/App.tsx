import type { FC } from 'react'

import { Routes, Route } from 'react-router-dom'

import Layout from './components/layout/Layout'
import { AuthProvider } from './contexts/AuthContext'
import About from './pages/About/About'
import BattleRoyaleGame from './pages/Game/BattleRoyaleGame'
import ScoreBattleGame from './pages/Game/ScoreBattleGame'
import Help from './pages/Help/Help'
import Home from './pages/Home/Home'
import Invite from './pages/Invite/Invite'
import Leaderboard from './pages/Leaderboard/Leaderboard'
import Lobby from './pages/Lobby/Lobby'
import Login from './pages/Login/Login'
import BattleRoyale from './pages/Multiplayer/BattleRoyale'
import Multiplayer from './pages/Multiplayer/Multiplayer'
import ScoreBattle from './pages/Multiplayer/ScoreBattle'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile/Profile'
import Register from './pages/Register/Register'
import Room from './pages/Room/Room'
import Solo from './pages/Solo/Solo'
import Support from './pages/Support/Support'

const App: FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="solo" element={<Solo />} />

          <Route path="multiplayer" element={<Multiplayer />} />
          <Route path="multiplayer/score" element={<ScoreBattle />} />
          <Route path="multiplayer/royale" element={<BattleRoyale />} />

          <Route path="room/:mode/:id" element={<Room />} />
          <Route path="room/:mode/:id/lobby" element={<Lobby />} />

          <Route path="room/score/:id/play" element={<ScoreBattleGame />} />
          <Route path="room/royale/:id/play" element={<BattleRoyaleGame />} />

          <Route path="invite/:token" element={<Invite />} />

          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          <Route path="profile" element={<Profile />} />
          <Route path="leaderboard" element={<Leaderboard />} />

          <Route path="about" element={<About />} />
          <Route path="support" element={<Support />} />
          <Route path="help" element={<Help />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
