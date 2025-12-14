import crypto from 'crypto'

import type { Server, Socket } from 'socket.io'

export type RoomMode = 'score' | 'royale'

type Player = {
  socketId: string
  userId: string | null
  login: string
  isHost: boolean
  isReady: boolean
  isAlive: boolean
}

type Room = {
  id: string
  mode: RoomMode
  status: 'lobby' | 'playing' | 'finished'
  createdAt: number
  players: Player[]
}

const rooms = new Map<string, Room>()

const safeLogin = (login: unknown): string => {
  if (typeof login === 'string' && login.trim().length > 0) return login.trim()

  return 'Guest'
}

const toRoomDto = (room: Room) => ({
  id: room.id,
  mode: room.mode,
  status: room.status,
  players: room.players.map((p) => ({
    socketId: p.socketId,
    userId: p.userId,
    login: p.login,
    isHost: p.isHost,
    isReady: p.isReady,
    isAlive: p.isAlive,
  })),
})

const removePlayerFromRoom = (room: Room, socketId: string): boolean => {
  const idx = room.players.findIndex((p) => p.socketId === socketId)

  if (idx === -1) return false

  const wasHost = room.players[idx].isHost

  room.players.splice(idx, 1)

  if (wasHost && room.players.length > 0) {
    room.players[0].isHost = true
  }

  return true
}

export const registerRoomSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    socket.on('room:create', (payload: { mode?: RoomMode; login?: string; userId?: string }, ack) => {
      const mode: RoomMode = payload?.mode === 'royale' ? 'royale' : 'score'
      const id = crypto.randomUUID().slice(0, 8)

      const room: Room = {
        id,
        mode,
        status: 'lobby',
        createdAt: Date.now(),
        players: [
          {
            socketId: socket.id,
            userId: payload?.userId ?? null,
            login: safeLogin(payload?.login),
            isHost: true,
            isReady: true,
            isAlive: true,
          },
        ],
      }

      rooms.set(id, room)
      void socket.join(id)

      io.to(id).emit('room:state', toRoomDto(room))
      ack?.({ ok: true, room: toRoomDto(room) })
    })

    socket.on('room:join', (payload: { roomId: string; login?: string; userId?: string }, ack) => {
      const roomId = String(payload?.roomId ?? '')
      const room = rooms.get(roomId)

      if (!room) {
        ack?.({ ok: false, message: 'Room not found' })

        return
      }

      if (room.status !== 'lobby') {
        ack?.({ ok: false, message: 'Game already started' })

        return
      }

      if (room.players.some((p) => p.socketId === socket.id)) {
        void socket.join(roomId)
        ack?.({ ok: true, room: toRoomDto(room) })

        return
      }

      room.players.push({
        socketId: socket.id,
        userId: payload?.userId ?? null,
        login: safeLogin(payload?.login),
        isHost: false,
        isReady: false,
        isAlive: true,
      })

      void socket.join(roomId)
      io.to(roomId).emit('room:state', toRoomDto(room))
      ack?.({ ok: true, room: toRoomDto(room) })
    })

    socket.on('room:leave', (payload: { roomId: string }, ack) => {
      const roomId = String(payload?.roomId ?? '')
      const room = rooms.get(roomId)

      if (!room) {
        ack?.({ ok: true })

        return
      }

      const removed = removePlayerFromRoom(room, socket.id)

      void socket.leave(roomId)

      if (removed) {
        if (room.players.length === 0) {
          rooms.delete(roomId)
        } else {
          io.to(roomId).emit('room:state', toRoomDto(room))
        }
      }

      ack?.({ ok: true })
    })

    socket.on('room:ready', (payload: { roomId: string; isReady: boolean }, ack) => {
      const roomId = String(payload?.roomId ?? '')
      const room = rooms.get(roomId)

      if (!room) {
        ack?.({ ok: false, message: 'Room not found' })

        return
      }

      const player = room.players.find((p) => p.socketId === socket.id)

      if (!player) {
        ack?.({ ok: false, message: 'Player not in room' })

        return
      }

      player.isReady = Boolean(payload?.isReady)
      io.to(roomId).emit('room:state', toRoomDto(room))
      ack?.({ ok: true })
    })

    socket.on('room:start', (payload: { roomId: string }, ack) => {
      const roomId = String(payload?.roomId ?? '')
      const room = rooms.get(roomId)

      if (!room) {
        ack?.({ ok: false, message: 'Room not found' })

        return
      }

      const player = room.players.find((p) => p.socketId === socket.id)

      if (!player?.isHost) {
        ack?.({ ok: false, message: 'Only host can start' })

        return
      }

      const allReady = room.players.every((p) => p.isReady)

      if (!allReady) {
        ack?.({ ok: false, message: 'Not all players are ready' })

        return
      }

      room.status = 'playing'
      room.players.forEach((p) => {
        p.isAlive = true
      })

      io.to(roomId).emit('room:state', toRoomDto(room))
      io.to(roomId).emit('game:start', { roomId, mode: room.mode, startedAt: Date.now() })

      ack?.({ ok: true })
    })

    socket.on('game:attack', (payload: { roomId: string; lines: number }, ack) => {
      const roomId = String(payload?.roomId ?? '')
      const room = rooms.get(roomId)

      if (!room || room.status !== 'playing') {
        ack?.({ ok: false, message: 'Room not in playing state' })

        return
      }

      const from = room.players.find((p) => p.socketId === socket.id)

      if (!from) {
        ack?.({ ok: false, message: 'Player not in room' })

        return
      }

      const lines = Math.max(0, Math.min(8, Number(payload?.lines ?? 0)))

      socket.to(roomId).emit('game:attack', {
        roomId,
        from: { userId: from.userId, login: from.login },
        lines,
      })

      ack?.({ ok: true })
    })

    socket.on('disconnect', () => {
      for (const [roomId, room] of rooms.entries()) {
        const removed = removePlayerFromRoom(room, socket.id)

        if (!removed) continue

        if (room.players.length === 0) {
          rooms.delete(roomId)
        } else {
          io.to(roomId).emit('room:state', toRoomDto(room))
        }
      }
    })
  })
}
