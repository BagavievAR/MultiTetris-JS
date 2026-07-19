import { io, type Socket } from 'socket.io-client'

const WS_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const socket: Socket = io(WS_URL, {
  transports: ['websocket'],
  withCredentials: true,
  autoConnect: false,
})
