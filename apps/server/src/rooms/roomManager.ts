type Room = {
  id: string;
  players: string[];
};

const rooms: Room[] = []

export function createRoom(playerId: string): Room {
  const newRoom: Room = { id: generateRoomId(), players: [playerId] }

  rooms.push(newRoom)

  return newRoom
}

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8)
}
