type Entry = {
  username: string;
  score: number;
};

const leaderboard: Entry[] = []

export function addScore(username: string, score: number): void {
  leaderboard.push({ username, score })
}

export function getTopScores(): Entry[] {
  return leaderboard.sort((a, b) => b.score - a.score).slice(0, 10)
}
