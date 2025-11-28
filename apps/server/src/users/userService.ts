type User = {
  id: string;
  username: string;
  passwordHash: string;
};

export function authenticateUser(username: string, password: string): boolean {
  // Заглушка: всегда true
  return true
}
