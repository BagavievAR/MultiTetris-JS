import crypto from 'node:crypto'

import type { Server, Socket } from 'socket.io'

export type RoomMode = 'score' | 'royale'
export type RoomVisibility = 'public' | 'friends' | 'private'

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
  name: string
  inviteCode: string
  mode: RoomMode
  visibility: RoomVisibility
  password?: string
  hasPassword: boolean
  maxPlayers: number
  status: 'lobby' | 'playing' | 'finished'
  createdAt: number
  players: Player[]
}

const rooms = new Map<string, Room>()

const safeLogin = (login?: string) =>
  typeof login === 'string' && login.trim() ? login.trim().slice(0, 20) : 'Guest'

const makeInviteCode = (): string => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''

  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]

  return out
}

const toRoomDto = (room: Room) => ({
  id: room.id,
  name: room.name,
  mode: room.mode,
  status: room.status,
  players: room.players.map((p) => ({ ...p })),
  inviteCode: room.inviteCode,
  visibility: room.visibility,
  hasPassword: room.hasPassword,
  maxPlayers: room.maxPlayers,
})

const findRoomByCode = (mode: RoomMode, code: string) =>
  Array.from(rooms.values()).find((r) => r.mode === mode && r.inviteCode === code)

const removePlayerFromRoom = (room: Room, socketId: string) => {
  const idx = room.players.findIndex((p) => p.socketId === socketId)

  if (idx === -1) return { removed: false, wasHost: false }

  const wasHost = room.players[idx].isHost

  room.players.splice(idx, 1)

  if (wasHost && room.players.length > 0) {
    room.players[0].isHost = true
  }

  return { removed: true, wasHost }
}

const leaveAllRoomsForSocket = (io: Server, socket: Socket) => {
  for (const room of rooms.values()) {
    const { removed } = removePlayerFromRoom(room, socket.id)

    if (!removed) continue

    if (room.players.length === 0) {
      continue
    }

    io.to(room.id).emit('room:state', toRoomDto(room))
  }
}

export const registerRoomSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    socket.on('rooms:list', ({ mode }: { mode: RoomMode }, ack) => {
      const list = Array.from(rooms.values())
        .filter((r) => r.mode === mode)
        .filter((r) => r.status === 'lobby')
        .filter((r) => r.visibility === 'public')
        .map((r) => ({
          id: r.id,
          mode: r.mode,
          name: r.name,
          playersCount: r.players.length,
          maxPlayers: r.maxPlayers,
          hasPassword: r.hasPassword,
          createdAt: r.createdAt,
        }))
        .sort((a, b) => b.createdAt - a.createdAt)

      ack?.({ ok: true, rooms: list })
    })

    socket.on(
      'room:create',
      (
        payload: {
          mode?: RoomMode
          name?: string
          visibility?: RoomVisibility
          password?: string
          login?: string
          userId?: string
        },
        ack,
      ) => {
        const mode: RoomMode = payload.mode === 'royale' ? 'royale' : 'score'
        const visibility: RoomVisibility = payload.visibility ?? 'public'
        const password =
          typeof payload.password === 'string' && payload.password.trim()
            ? payload.password.trim()
            : undefined
        const name =
          typeof payload.name === 'string' && payload.name.trim()
            ? payload.name.trim().slice(0, 30)
            : (mode === 'score' ? 'Score room' : 'Royale room')

        const room: Room = {
          id: crypto.randomUUID(),
          inviteCode: makeInviteCode(),
          name,
          mode,
          visibility,
          password,
          hasPassword: Boolean(password),
          maxPlayers: mode === 'score' ? 2 : 8,
          status: 'lobby',
          createdAt: Date.now(),
          players: [
            {
              socketId: socket.id,
              userId: payload.userId ?? null,
              login: safeLogin(payload.login),
              isHost: true,
              isReady: true,
              isAlive: true,
            },
          ],
        }

        rooms.set(room.id, room)
        void socket.join(room.id)

        io.to(room.id).emit('room:state', toRoomDto(room))
        ack?.({ ok: true, room: toRoomDto(room) })
      },
    )

    socket.on(
      'room:join',
      (
        payload: { roomId: string; password?: string; login?: string; userId?: string },
        ack,
      ) => {
        const roomId = String(payload.roomId ?? '').trim()
        const room = rooms.get(roomId)

        if (!room) return ack?.({ ok: false, message: 'Комната не найдена' })

        if (room.players.some((p) => p.socketId === socket.id)) {
          void socket.join(room.id)
          io.to(room.id).emit('room:state', toRoomDto(room))
          ack?.({ ok: true, room: toRoomDto(room) })

          return
        }

        if (payload.userId && room.players.some((p) => p.userId === payload.userId)) {
          ack?.({ ok: false, message: 'Вы уже находитесь в комнате' })

          return
        }

        if (room.status !== 'lobby') return ack?.({ ok: false, message: 'Игра уже началась' })
        if (room.players.length >= room.maxPlayers) return ack?.({ ok: false, message: 'Комната заполнена' })

        if (room.hasPassword) {
          const pass = typeof payload.password === 'string' ? payload.password : ''

          if (pass !== (room.password ?? '')) return ack?.({ ok: false, message: 'Неверный пароль' })
        }

        room.players.push({
          socketId: socket.id,
          userId: payload.userId ?? null,
          login: safeLogin(payload.login),
          isHost: false,
          isReady: false,
          isAlive: true,
        })

        void socket.join(room.id)
        io.to(room.id).emit('room:state', toRoomDto(room))
        ack?.({ ok: true, room: toRoomDto(room) })
      },
    )

    socket.on(
      'room:joinByCode',
      (
        payload: { mode: RoomMode; code: string; password?: string; login?: string; userId?: string },
        ack,
      ) => {
        const mode: RoomMode = payload.mode === 'royale' ? 'royale' : 'score'
        const code = String(payload.code ?? '').trim().toUpperCase()

        const room = findRoomByCode(mode, code)

        if (!room) return ack?.({ ok: false, message: 'Комната по коду не найдена' })

        if (room.players.some((p) => p.socketId === socket.id)) {
          void socket.join(room.id)
          io.to(room.id).emit('room:state', toRoomDto(room))
          ack?.({ ok: true, room: toRoomDto(room) })

          return
        }

        if (payload.userId && room.players.some((p) => p.userId === payload.userId)) {
          ack?.({ ok: false, message: 'Вы уже находитесь в комнате' })

          return
        }

        if (room.status !== 'lobby') return ack?.({ ok: false, message: 'Игра уже началась' })
        if (room.players.length >= room.maxPlayers) return ack?.({ ok: false, message: 'Комната заполнена' })

        if (room.hasPassword) {
          const pass = typeof payload.password === 'string' ? payload.password : ''

          if (pass !== (room.password ?? '')) return ack?.({ ok: false, message: 'Неверный пароль' })
        }

        room.players.push({
          socketId: socket.id,
          userId: payload.userId ?? null,
          login: safeLogin(payload.login),
          isHost: false,
          isReady: false,
          isAlive: true,
        })

        void socket.join(room.id)
        io.to(room.id).emit('room:state', toRoomDto(room))
        ack?.({ ok: true, room: toRoomDto(room) })
      },
    )

    socket.on('room:leave', (payload: { roomId?: string } | undefined, ack) => {
      const id = typeof payload?.roomId === 'string' ? payload.roomId.trim() : ''

      if (id) {
        const room = rooms.get(id)

        if (room) {
          const { removed } = removePlayerFromRoom(room, socket.id)

          void socket.leave(id)

          if (removed) {
            if (room.players.length === 0) rooms.delete(id)
            else io.to(id).emit('room:state', toRoomDto(room))
          }
        }
        ack?.({ ok: true })

        return
      }

      leaveAllRoomsForSocket(io, socket)
      ack?.({ ok: true })
    })

    socket.on('room:ready', ({ roomId, isReady }: { roomId: string; isReady: boolean }, ack) => {
      const id = String(roomId ?? '').trim()
      const room = rooms.get(id)

      if (!room) return ack?.({ ok: false, message: 'Комната не найдена' })

      const player = room.players.find((p) => p.socketId === socket.id)

      if (!player) return ack?.({ ok: false, message: 'Игрок не в комнате' })

      player.isReady = Boolean(isReady)
      io.to(id).emit('room:state', toRoomDto(room))
      ack?.({ ok: true })
    })

    socket.on('room:start', ({ roomId }: { roomId: string }, ack) => {
      const id = String(roomId ?? '').trim()
      const room = rooms.get(id)

      if (!room) return ack?.({ ok: false, message: 'Комната не найдена' })

      const me = room.players.find((p) => p.socketId === socket.id)

      if (!me?.isHost) return ack?.({ ok: false, message: 'Только host может начать игру' })

      if (!room.players.every((p) => p.isReady)) {
        return ack?.({ ok: false, message: 'Не все игроки готовы' })
      }

      room.status = 'playing'
      room.players.forEach((p) => (p.isAlive = true))

      io.to(id).emit('room:state', toRoomDto(room))
      io.to(id).emit('game:start', { roomId: id, mode: room.mode, startedAt: Date.now() })
      ack?.({ ok: true })
    })

    socket.on('game:attack', ({ roomId, lines }: { roomId: string; lines: number }, ack) => {
      const id = String(roomId ?? '').trim()
      const room = rooms.get(id)

      if (!room || room.status !== 'playing') {
        ack?.({ ok: false, message: 'Комната не в состоянии игры' })

        return
      }

      const attacker = room.players.find((p) => p.socketId === socket.id)

      if (!attacker) {
        ack?.({ ok: false, message: 'Игрок не в комнате' })

        return
      }

      const safeLines = Math.max(0, Math.min(8, Number.isFinite(lines) ? lines : 0))

      io.to(id).emit('game:attack', {
        roomId: id,
        from: { userId: attacker.userId, login: attacker.login },
        lines: safeLines,
      })

      ack?.({ ok: true })
    })

    socket.on('room:getState', ({ roomId }: { roomId: string }, ack) => {
      const id = String(roomId ?? '').trim()
      const room = rooms.get(id)

      if (!room) {
        ack?.({ ok: false, message: 'Комната не найдена' })

        return
      }

      void socket.join(id)

      io.to(id).emit('room:state', toRoomDto(room))
      ack?.({ ok: true, room: toRoomDto(room) })
    })

    socket.on('disconnect', () => {
      leaveAllRoomsForSocket(io, socket)
    })
  })
}
