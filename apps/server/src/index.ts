import crypto from 'crypto'

import cors from 'cors'
import express from 'express'
import sqlite3 from 'sqlite3'

const app = express()

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me'

sqlite3.verbose()
const db = new sqlite3.Database('multitetris.db')

const run = (sql: string, params: unknown[] = []): Promise<void> =>
  new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })

const get = <T>(sql: string, params: unknown[] = []): Promise<T | undefined> =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row as T | undefined)
      }
    })
  })

const all = <T>(sql: string, params: unknown[] = []): Promise<T[]> =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows as T[])
      }
    })
  })

interface UserRow {
  id: string
  login: string
  password_hash: string
}

interface SoloResultRow {
  id: string
  user_id: string
  score: number
  lines_cleared: number
  level: number
  created_at: string
}

const initializeDatabase = async (): Promise<void> => {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      login TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );
  `)

  await run(`
    CREATE TABLE IF NOT EXISTS solo_results (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      lines_cleared INTEGER NOT NULL,
      level INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `)
}

const hashPassword = (password: string): string =>
  crypto.createHash('sha256').update(password).digest('hex')

interface JwtPayload {
  sub: string
  login: string
  iat: number
  exp: number
}

const base64UrlEncode = (input: string | Buffer): string =>
  Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

const base64UrlDecode = (input: string): string => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
  
  return Buffer.from(normalized + pad, 'base64').toString('utf-8')
}

const signJwt = (payload: JwtPayload): string => {
  const header = { alg: 'HS256', typ: 'JWT' }

  const headerPart = base64UrlEncode(JSON.stringify(header))
  const payloadPart = base64UrlEncode(JSON.stringify(payload))
  const data = `${headerPart}.${payloadPart}`

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `${data}.${signature}`
}

const verifyJwt = (token: string): JwtPayload | null => {
  const parts = token.split('.')

  if (parts.length !== 3) return null

  const [headerPart, payloadPart, signaturePart] = parts
  const data = `${headerPart}.${payloadPart}`

  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  if (signaturePart !== expectedSignature) return null

  try {
    const payloadJson = base64UrlDecode(payloadPart)
    const payload = JSON.parse(payloadJson) as JwtPayload

    if (payload.exp * 1000 < Date.now()) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

const createTokenForUser = (user: UserRow): string => {
  const now = Math.floor(Date.now() / 1000)
  const payload: JwtPayload = {
    sub: user.id,
    login: user.login,
    iat: now,
    exp: now + 60 * 60 * 24 * 7,
  }

  return signJwt(payload)
}

const getUserFromAuthHeader = async (
  authHeader?: string | null,
): Promise<UserRow | null> => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null

  const token = authHeader.slice('Bearer '.length)
  const payload = verifyJwt(token)

  if (!payload) return null

  const user = await get<UserRow>(
    'SELECT id, login, password_hash FROM users WHERE id = ?',
    [payload.sub],
  )

  return user ?? null
}

app.post('/api/auth/register', async (req, res) => {
  const { login, password } = req.body as { login?: string; password?: string }

  if (!login || !password) {
    res.status(400).json({ message: 'Login и password обязательны' })

    return
  }

  if (login.length < 3 || password.length < 4) {
    res.status(400).json({ message: 'Слишком короткий логин или пароль' })

    return
  }

  try {
    const existing = await get<UserRow>(
      'SELECT id, login, password_hash FROM users WHERE login = ?',
      [login],
    )

    if (existing) {
      res.status(409).json({ message: 'Такой логин уже существует' })

      return
    }

    const id = crypto.randomUUID()
    const passwordHash = hashPassword(password)

    await run('INSERT INTO users (id, login, password_hash) VALUES (?, ?, ?)', [
      id,
      login,
      passwordHash,
    ])

    const user: UserRow = { id, login, password_hash: passwordHash }
    const token = createTokenForUser(user)

    res.status(201).json({
      token,
      user: {
        id: user.id,
        login: user.login,
      },
    })
  } catch (error) {
    console.error('Ошибка регистрации', error)
    res.status(500).json({ message: 'Ошибка сервера при регистрации' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { login, password } = req.body as { login?: string; password?: string }

  if (!login || !password) {
    res.status(400).json({ message: 'Login и password обязательны' })

    return
  }

  try {
    const user = await get<UserRow>(
      'SELECT id, login, password_hash FROM users WHERE login = ?',
      [login],
    )

    if (!user) {
      res.status(401).json({ message: 'Неверный логин или пароль' })

      return
    }

    const hashed = hashPassword(password)

    if (hashed !== user.password_hash) {
      res.status(401).json({ message: 'Неверный логин или пароль' })

      return
    }

    const token = createTokenForUser(user)

    res.json({
      token,
      user: {
        id: user.id,
        login: user.login,
      },
    })
  } catch (error) {
    console.error('Ошибка логина', error)
    res.status(500).json({ message: 'Ошибка сервера при логине' })
  }
})

app.get('/api/profile/me', async (req, res) => {
  try {
    const user = await getUserFromAuthHeader(req.header('authorization'))

    if (!user) {
      res.status(401).json({ message: 'Нет или неверный токен' })

      return
    }

    res.json({
      id: user.id,
      login: user.login,
    })
  } catch (error) {
    console.error('Ошибка /api/profile/me', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

app.post('/api/solo/results', async (req, res) => {
  try {
    const user = await getUserFromAuthHeader(req.header('authorization'))

    if (!user) {
      res.status(401).json({ message: 'Требуется авторизация' })

      return
    }

    const { score, linesCleared, level } = req.body as {
      score?: unknown
      linesCleared?: unknown
      level?: unknown
    }

    if (
      typeof score !== 'number' ||
      typeof linesCleared !== 'number' ||
      typeof level !== 'number'
    ) {
      res.status(400).json({ message: 'Некорректные данные результата' })

      return
    }

    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()

    await run(
      `
      INSERT INTO solo_results (id, user_id, score, lines_cleared, level, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [id, user.id, score, linesCleared, level, createdAt],
    )

    res.status(201).json({
      id,
      score,
      linesCleared,
      level,
      createdAt,
    })
  } catch (error) {
    console.error('Ошибка POST /api/solo/results', error)
    res.status(500).json({ message: 'Ошибка сервера при сохранении результата' })
  }
})

app.get('/api/solo/results/me', async (req, res) => {
  try {
    const user = await getUserFromAuthHeader(req.header('authorization'))

    if (!user) {
      res.status(401).json({ message: 'Требуется авторизация' })

      return
    }

    const rows = await all<SoloResultRow>(
      `
      SELECT id, user_id, score, lines_cleared, level, created_at
      FROM solo_results
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
      [user.id],
    )

    res.json(
      rows.map((row) => ({
        id: row.id,
        score: row.score,
        linesCleared: row.lines_cleared,
        level: row.level,
        createdAt: row.created_at,
      })),
    )
  } catch (error) {
    console.error('Ошибка GET /api/solo/results/me', error)
    res.status(500).json({ message: 'Ошибка сервера при получении истории' })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

void initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Ошибка инициализации БД', error)
    process.exit(1)
  })
