// apps/client/src/services/soloResults.ts
export interface SoloResultPayload {
  score: number
  linesCleared: number
  level: number
}

export interface SoloResult extends SoloResultPayload {
  id: number
  mode: string
  createdAt: string
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  const data = text ? (JSON.parse(text) as unknown) : null

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message: unknown }).message)
        : `Request failed with status ${res.status}`

    throw new Error(message)
  }

  return data as T
}

/**
 * Сохранить результат соло-игры для авторизованного пользователя.
 * Если токена нет – просто ничего не делаем (гость).
 */
export async function saveSoloResult(
  payload: SoloResultPayload,
  token?: string | null,
): Promise<void> {
  if (!token) {
    return
  }

  const res = await fetch(`${API_URL}/api/solo/results`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  await handleResponse<unknown>(res)
}

/**
 * Получить историю соло-результатов текущего пользователя.
 */
export async function fetchMySoloResults(
  token: string,
): Promise<SoloResult[]> {
  const res = await fetch(`${API_URL}/api/solo/results/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return handleResponse<SoloResult[]>(res)
}
