import { socket } from '../network/socket'

export type RoomMode = 'score' | 'royale'

export type RoomState = {
  id: string
  mode: RoomMode
  status: 'lobby' | 'playing' | 'finished'
  players: Array<{
    socketId: string
    userId: string | null
    login: string
    isHost: boolean
    isReady: boolean
    isAlive: boolean
  }>
}

type Ack<T> = (payload: T) => void

export const connectSocket = () => {
  if (!socket.connected) socket.connect()
}

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect()
}

export const onRoomState = (cb: (state: RoomState) => void) => {
  socket.on('room:state', cb)

  return () => socket.off('room:state', cb)
}

export const onGameStart = (cb: (payload: { roomId: string; mode: RoomMode; startedAt: number }) => void) => {
  socket.on('game:start', cb)

  return () => socket.off('game:start', cb)
}

export const onAttack = (cb: (payload: { roomId: string; from: { userId: string | null; login: string }; lines: number }) => void) => {
  socket.on('game:attack', cb)
  
  return () => socket.off('game:attack', cb)
}

export const createRoom = (mode: RoomMode, login?: string, userId?: string) =>
  new Promise<RoomState>((resolve, reject) => {
    connectSocket()
    socket.emit('room:create', { mode, login, userId }, ((ack: { ok: boolean; room?: RoomState; message?: string }) => {
      if (!ack.ok || !ack.room) reject(new Error(ack.message ?? 'Failed to create room'))
      else resolve(ack.room)
    }) as Ack<{ ok: boolean; room?: RoomState; message?: string }>)
  })

export const joinRoom = (roomId: string, login?: string, userId?: string) =>
  new Promise<RoomState>((resolve, reject) => {
    connectSocket()
    socket.emit('room:join', { roomId, login, userId }, ((ack: { ok: boolean; room?: RoomState; message?: string }) => {
      if (!ack.ok || !ack.room) reject(new Error(ack.message ?? 'Failed to join room'))
      else resolve(ack.room)
    }) as Ack<{ ok: boolean; room?: RoomState; message?: string }>)
  })

export const leaveRoom = (roomId: string) =>
  new Promise<void>((resolve) => {
    socket.emit('room:leave', { roomId }, () => resolve())
  })

export const setReady = (roomId: string, isReady: boolean) =>
  new Promise<void>((resolve, reject) => {
    socket.emit('room:ready', { roomId, isReady }, (ack: { ok: boolean; message?: string }) => {
      if (!ack.ok) reject(new Error(ack.message ?? 'Failed to set ready'))
      else resolve()
    })
  })

export const startRoom = (roomId: string) =>
  new Promise<void>((resolve, reject) => {
    socket.emit('room:start', { roomId }, (ack: { ok: boolean; message?: string }) => {
      if (!ack.ok) reject(new Error(ack.message ?? 'Failed to start'))
      else resolve()
    })
  })

export const sendAttack = (roomId: string, lines: number) =>
  new Promise<void>((resolve) => {
    socket.emit('game:attack', { roomId, lines }, () => resolve())
  })
