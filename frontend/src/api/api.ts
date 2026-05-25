import axios, { AxiosError } from 'axios'
import type { RoomRecord } from '../types/room'

const serverUrl = import.meta.env.VITE_SERVER_URL

if (typeof serverUrl !== 'string' || serverUrl.trim().length === 0) {
  throw new Error('VITE_SERVER_URL is required')
}

const authTokenKeys: readonly string[] = ['token', 'authToken', 'accessToken']


const apiClient = axios.create({
  baseURL: serverUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }

  for (const key of authTokenKeys) {
    const token = window.localStorage.getItem(key)
    if (typeof token === 'string' && token.trim().length > 0) {
      return token
    }
  }

  return null
}

export const setAuthToken = (token: string): void => {
  window.localStorage.setItem('token', token)
}

export const clearAuthToken = (): void => {
  window.localStorage.removeItem('token')
  window.localStorage.removeItem('authToken')
  window.localStorage.removeItem('accessToken')
}

export const buildApiUrl = (path: string): string => {
  return new URL(path, serverUrl).toString()
}


export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message || 'Request failed'
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unknown error occurred'
}


interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    createdAt: string
    updatedAt: string
  }
}

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>('/api/v1/auth/login', credentials)
  setAuthToken(data.token)
  return data
}

interface RegisterRequest {
  name: string
  email: string
  password: string
}

interface RegisterResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    createdAt: string
    updatedAt: string
  }
}

export const register = async (credentials: RegisterRequest): Promise<RegisterResponse> => {
  const { data } = await apiClient.post<RegisterResponse>('/api/v1/auth/register', credentials)
  setAuthToken(data.token)
  return data
}

interface CreateRoomResponse {
  room: RoomRecord
}

export const createRoom = async (name: string): Promise<RoomRecord> => {
  const { data } = await apiClient.post<CreateRoomResponse>('/api/v1/room', { name })
  return data.room
}

export const getRoom = async (roomId: string): Promise<RoomRecord> => {
  const { data } = await apiClient.get<RoomRecord>(`/api/v1/room/${roomId}`)
  return data
}

interface GetRoomsResponse {
  rooms: RoomRecord[]
}

export const getRooms = async (): Promise<RoomRecord[]> => {
  const { data } = await apiClient.get<GetRoomsResponse>('/api/v1/room')
  return data.rooms || []
}

export const joinRoom = async (roomId: string): Promise<{ message: string }> => {
  const { data } = await apiClient.post(`/api/v1/room/${roomId}/join`, {})
  return data
}

export const leaveRoom = async (roomId: string): Promise<{ message: string }> => {
  const { data } = await apiClient.delete(`/api/v1/room/${roomId}/leave`)
  return data
}

export const deleteRoom = async (roomId: string): Promise<{ message: string }> => {
  const { data } = await apiClient.delete(`/api/v1/room/${roomId}`)
  return data
}


interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

interface GetMeResponse {
  user: User
}

export const getMe = async (): Promise<User> => {
  const { data } = await apiClient.get<GetMeResponse>('/api/v1/auth/me')
  return data.user
}
