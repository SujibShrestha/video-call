export interface RoomMember {
  id: string
  userId: string
  roomId: string
  user?: {
    id: string
    name: string
    email: string
    createdAt: string
    updatedAt: string
  }
}

export interface RoomRecord {
  id: string
  name: string
  ownerId: string
  createdAt: string
  members?: RoomMember[]
  owner?: {
    id: string
    name: string
    email: string
    createdAt: string
    updatedAt: string
  }
  [key: string]: unknown
}
