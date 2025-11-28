import { Server, Socket } from 'socket.io'

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`)
    // Пример:
    // socket.on('join-room', () => { ... })
  })
}
