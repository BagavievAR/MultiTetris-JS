export interface LeaderboardItem {
  userId: string
  login: string
  bestScore: number
  gamesCount: number
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const handleResponse = async <T>(res: Response): Promise<T> => {
  const text = await res.text()
  const data = text ? (JSON.parse(text) as unknown) : null

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message?: unknown }).message)
        : `Request failed with status ${res.status}`

    throw new Error(message)
  }

  return data as T
}

export const fetchSoloLeaderboard = async (
  limit = 20,
): Promise<LeaderboardItem[]> => {
  const res = await fetch(`${API_URL}/api/leaderboard/solo?limit=${limit}`)
  
  return handleResponse<LeaderboardItem[]>(res)
}
