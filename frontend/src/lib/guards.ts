import type { RoomRecord } from '../types/room'

export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

export const isRoomRecord = (value: unknown): value is RoomRecord => {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.ownerId === 'string' &&
    typeof value.createdAt === 'string'
  )
}

export const readErrorMessage = (value: unknown, fallback: string) => {
  if (typeof value === 'string') {
    return value
  }

  if (isRecord(value) && typeof value.message === 'string') {
    return value.message
  }

  return fallback
}

export const readCreatedRoom = (value: unknown) => {
  if (!isRecord(value) || !isRoomRecord(value.room)) {
    return null
  }

  return value.room
}

export const readAuthToken = (value: unknown) => {
  if (!isRecord(value) || typeof value.token !== 'string' || value.token.length === 0) {
    return null
  }

  return value.token
}
