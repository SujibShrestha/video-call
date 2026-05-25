export interface ClientToServerEvents {
  'join-room': (roomId: string) => void
}

export interface ServerToClientEvents {
  'user-joined': (socketId: string) => void
  'user-left': (socketId: string) => void
  error: (message: string) => void
}
