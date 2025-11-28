// Заглушка: Общие утилиты

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString()
}

export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}
