import { socket } from '../network/socket'

export type RoomMode = 'score' | 'royale'
export type RoomVisibility = 'public' | 'friends' | 'private'

export type RoomPlayer = {
  socketId: string
  userId: string | null
  login: string
  isHost: boolean
  isReady: boolean
  isAlive: boolean
}

export type RoomState = {
  id: string
  mode: RoomMode
  name: string
  status: 'lobby' | 'playing' | 'finished'
  players: RoomPlayer[]

  inviteCode?: string
  visibility?: RoomVisibility
  hasPassword?: boolean
  maxPlayers?: number
}

export type RoomListItem = {
  id: string
  mode: RoomMode
  name: string
  playersCount: number
  maxPlayers: number
  hasPassword: boolean
  createdAt: number
}

type AckOk<T> = { ok: true } & T
type AckFail = { ok: false; message?: string }
type Ack<T> = AckOk<T> | AckFail
type EmptyAckPayload = Record<string, never>

const ensureConnected = () => {
  if (!socket.connected) socket.connect()
}

const getAckError = (ack: unknown, fallback: string): Error => {
  if (ack && typeof ack === 'object' && 'message' in ack) {
    const msg = (ack as { message?: unknown }).message

    if (typeof msg === 'string' && msg.trim()) return new Error(msg)
  }

  return new Error(fallback)
}

export const connectSocket = () => {
  ensureConnected()
}

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect()
}

export const isSocketConnected = () => socket.connected

export const onRoomState = (cb: (state: RoomState) => void) => {
  socket.on('room:state', cb)

  return () => {
    socket.off('room:state', cb)
  }
}

export const onGameStart = (cb: (payload: { roomId: string; mode: RoomMode; startedAt: number }) => void) => {
  socket.on('game:start', cb)

  return () => {
    socket.off('game:start', cb)
  }
}

export const onAttack = (
  cb: (payload: { roomId: string; from: { userId: string | null; login: string }; lines: number }) => void,
) => {
  socket.on('game:attack', cb)

  return () => {
    socket.off('game:attack', cb)
  }
}

export const listRooms = (mode: RoomMode) =>
  new Promise<RoomListItem[]>((resolve, reject) => {
    try {
      ensureConnected()
      socket.emit('rooms:list', { mode }, (ack: Ack<{ rooms: RoomListItem[] }>) => {
        if (!ack || ack.ok !== true) {
          reject(getAckError(ack, 'Не удалось получить список комнат'))

          return
        }
        resolve(ack.rooms)
      })
    } catch {
      reject(new Error('Не удалось получить список комнат'))
    }
  })

export const createRoom = (
  mode: RoomMode,
  options: { visibility: RoomVisibility; password?: string; name: string },
  identity?: { login?: string; userId?: string },
) =>
  new Promise<RoomState>((resolve, reject) => {
    try {
      ensureConnected()
      socket.emit(
        'room:create',
        {
          mode,
          name: options.name,
          visibility: options.visibility,
          password: options.password?.trim() ? options.password.trim() : undefined,
          login: identity?.login,
          userId: identity?.userId,
        },
        (ack: Ack<{ room: RoomState }>) => {
          if (!ack || ack.ok !== true || !ack.room) {
            reject(getAckError(ack, 'Не удалось создать комнату'))

            return
          }
          resolve(ack.room)
        },
      )
    } catch {
      reject(new Error('Не удалось создать комнату'))
    }
  })

export const getGuestLogin = () => {
  const key = 'mt_guest_login'
  const existing = localStorage.getItem(key)

  if (existing) return existing
  const rnd = Math.floor(Math.random() * 1_000_000_000)
  const v = `guest#${rnd}`

  localStorage.setItem(key, v)

  return v
}

export const joinRoom = (
  roomId: string,
  options?: { password?: string },
  identity?: { login?: string; userId?: string },
) =>
  new Promise<RoomState>((resolve, reject) => {
    const id = roomId.trim()

    if (!id) {
      reject(new Error('Room ID пустой'))

      return
    }

    try {
      ensureConnected()
      socket.emit(
        'room:join',
        {
          roomId: id,
          password: options?.password?.trim() ? options.password.trim() : undefined,
          login: identity?.login,
          userId: identity?.userId,
        },
        (ack: Ack<{ room: RoomState }>) => {
          if (!ack || ack.ok !== true || !ack.room) {
            reject(getAckError(ack, 'Не удалось подключиться к комнате'))

            return
          }
          resolve(ack.room)
        },
      )
    } catch {
      reject(new Error('Не удалось подключиться к комнате'))
    }
  })

export const joinByCode = (
  mode: RoomMode,
  code: string,
  options?: { password?: string },
  identity?: { login?: string; userId?: string },
) =>
  new Promise<RoomState>((resolve, reject) => {
    const c = code.trim().toUpperCase()

    if (!c) {
      reject(new Error('Код приглашения пустой'))

      return
    }

    try {
      ensureConnected()
      socket.emit(
        'room:joinByCode',
        {
          mode,
          code: c,
          password: options?.password?.trim() ? options.password.trim() : undefined,
          login: identity?.login,
          userId: identity?.userId,
        },
        (ack: Ack<{ room: RoomState }>) => {
          if (!ack || ack.ok !== true || !ack.room) {
            reject(getAckError(ack, 'Не удалось подключиться по коду'))

            return
          }
          resolve(ack.room)
        },
      )
    } catch {
      reject(new Error('Не удалось подключиться по коду'))
    }
  })

export const leaveRoom = (roomId: string) =>
  new Promise<void>((resolve) => {
    const id = roomId.trim()

    if (!id) {
      resolve()

      return
    }

    try {
      ensureConnected()
      socket.emit('room:leave', { roomId: id }, () => resolve())
    } catch {
      resolve()
    }
  })

export const setReady = (roomId: string, isReady: boolean) =>
  new Promise<void>((resolve, reject) => {
    const id = roomId.trim()

    if (!id) {
      reject(new Error('Room ID пустой'))

      return
    }

    try {
      ensureConnected()
      socket.emit('room:ready', { roomId: id, isReady }, (ack: Ack<EmptyAckPayload>) => {
        if (!ack || ack.ok !== true) {
          reject(getAckError(ack, 'Не удалось изменить готовность'))

          return
        }
        resolve()
      })
    } catch {
      reject(new Error('Не удалось изменить готовность'))
    }
  })

export const startRoom = (roomId: string) =>
  new Promise<void>((resolve, reject) => {
    const id = roomId.trim()

    if (!id) {
      reject(new Error('Room ID пустой'))

      return
    }

    try {
      ensureConnected()
      socket.emit('room:start', { roomId: id }, (ack: Ack<EmptyAckPayload>) => {
        if (!ack || ack.ok !== true) {
          reject(getAckError(ack, 'Не удалось запустить игру'))

          return
        }
        resolve()
      })
    } catch {
      reject(new Error('Не удалось запустить игру'))
    }
  })

export const getRoomState = (roomId: string) =>
  new Promise<RoomState>((resolve, reject) => {
    const id = roomId.trim()

    if (!id) {
      reject(new Error('Room ID пустой'))

      return
    }

    try {
      ensureConnected()
      socket.emit('room:getState', { roomId: id }, (ack: Ack<{ room: RoomState }>) => {
        if (!ack || ack.ok !== true || !ack.room) {
          reject(getAckError(ack, 'Не удалось получить состояние комнаты'))

          return
        }
        resolve(ack.room)
      })
    } catch {
      reject(new Error('Не удалось получить состояние комнаты'))
    }
  })

export const sendAttack = (roomId: string, lines: number) =>
  new Promise<void>((resolve, reject) => {
    const id = roomId.trim()

    if (!id) {
      resolve()

      return
    }

    const safeLines = Math.max(0, Math.min(8, Number.isFinite(lines) ? lines : 0))

    try {
      socket.emit('game:attack', { roomId: id, lines: safeLines }, (ack: Ack<EmptyAckPayload>) => {
        if (!ack) {
          resolve()

          return
        }

        if (ack.ok !== true) {
          reject(getAckError(ack, 'Не удалось отправить атаку'))

          return
        }
        resolve()
      })
    } catch {
      resolve()
    }
  })
