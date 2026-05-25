import { io, type Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from './types/socket'

const serverUrl = import.meta.env.VITE_SERVER_URL

if (typeof serverUrl !== 'string' || serverUrl.trim().length === 0) {
  throw new Error('VITE_SERVER_URL is required')
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(serverUrl, {
  autoConnect: false,
})
