import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { Button } from '../components/ui/Button'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { getRoom, joinRoom, leaveRoom, deleteRoom, getErrorMessage } from '../api/api'
import { useWebRTC } from '../hooks/useWebRtc'
import type { RoomRecord } from '../types/room'

export function Room() {
  const params = useParams()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { addToast } = useToast()

  const roomId = params.id
  const [room, setRoom] = useState<RoomRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoined, setIsJoined] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)

  const isValidRoomId = typeof roomId === 'string' && roomId.trim().length > 0
  const isOwner = room && user && room.ownerId === user.id

  // ── WebRTC — only active once user has joined ────────────────────────────
  const { localStream, remoteStreams, toggleAudio, toggleVideo } = useWebRTC(
    isJoined && isValidRoomId ? roomId : null,
    {
      onUserJoined: (_socketId:string, joinedUserId?: string) => {
        if (joinedUserId) setOnlineUsers((prev) => new Set([...prev, joinedUserId]))
        addToast({ type: 'info', title: 'Participant connected', description: 'A participant has joined the room.', duration: 3000 })
      },
      onUserLeft: (_socketId:string, leftUserId?: string) => {
        if (leftUserId) setOnlineUsers((prev) => {
          const updated = new Set(prev)
          updated.delete(leftUserId)
          return updated
        })
      },
      onError: (message:string) => {
        addToast({ type: 'error', title: 'Connection issue', description: `${message}. Check your network and try again.`, duration: 6000 })
      },
    },
    user?.id
  )

  // ── Load room details ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isValidRoomId) return

    const loadRoom = async () => {
      setIsLoading(true)
      try {
        const room = await getRoom(roomId)
        setRoom(room)
        if (room.members && Array.isArray(room.members)) {
          setIsJoined(room.members.some((m: any) => m.userId === user?.id))
        }
      } catch (error) {
        addToast({ type: 'error', title: 'Unable to load room', description: `${getErrorMessage(error)}. You have been redirected to the home page.` })
        navigate('/', { replace: true })
      } finally {
        setIsLoading(false)
      }
    }

    void loadRoom()
  }, [isValidRoomId, navigate, roomId, user?.id, addToast])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleJoinRoom = async () => {
    if (!roomId) return
    setIsActionLoading(true)
    try {
      await joinRoom(roomId)
      setIsJoined(true)
      if (user?.id) setOnlineUsers((prev) => new Set([...prev, user.id]))
      addToast({ type: 'success', title: 'Joined room', description: 'You are now a member — your camera and mic should connect shortly.' })
    } catch (error) {
      addToast({ type: 'error', title: 'Could not join room', description: `${getErrorMessage(error)}. Please try again or check your permissions.` })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleLeaveRoom = async () => {
    if (!roomId) return
    setIsActionLoading(true)
    try {
      await leaveRoom(roomId)
      addToast({ type: 'success', title: 'Left room', description: 'You have left the room.' })
      navigate('/')
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to leave', description: `${getErrorMessage(error)}. Try again or refresh the page.` })
    } finally {
      setIsActionLoading(false)
      setIsLeaveModalOpen(false)
      if (user?.id) setOnlineUsers((prev) => {
        const next = new Set(prev)
        next.delete(user.id)
        return next
      })
    }
  }

  const handleDeleteRoom = async () => {
    if (!roomId) return
    setIsActionLoading(true)
    try {
      await deleteRoom(roomId)
      addToast({ type: 'success', title: 'Room deleted', description: 'The room was deleted successfully.' })
      navigate('/')
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to delete', description: `${getErrorMessage(error)}. Ensure you are the room owner and try again.` })
    } finally {
      setIsActionLoading(false)
      setIsDeleteModalOpen(false)
      if (user?.id) setOnlineUsers((prev) => {
        const next = new Set(prev)
        next.delete(user.id)
        return next
      })
    }
  }

  const handleToggleAudio = () => {
    toggleAudio()
    setIsMuted((prev) => !prev)
  }

  const handleToggleVideo = () => {
    toggleVideo()
    setIsCameraOff((prev) => !prev)
  }

  if (!isValidRoomId) {
    navigate('/')
    return null
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-8 bg-slate-200 rounded-lg mb-6 w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded-lg"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{room?.name}</h1>
            <p className="text-sm text-slate-600 mt-2">
              Room ID: <span className="font-mono font-medium">{room?.id}</span>
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>← Back to home</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* ── Video Grid — only when joined ── */}
            {isJoined && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Live Call ({remoteStreams.size + 1} participant{remoteStreams.size !== 0 ? 's' : ''})
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Local stream */}
                    <VideoTile stream={localStream} muted label="You (You)" />

                    {/* Remote streams */}
                    {[...remoteStreams.entries()].map(([socketId, stream]) => (
                      <VideoTile key={socketId} stream={stream} label={user?.name as string } />
                    ))}
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center gap-3 pt-3 border-t border-slate-200">
                    <Button
                      variant={isMuted ? 'danger' : 'secondary'}
                      onClick={handleToggleAudio}
                    >
                      {isMuted ? '🔇 Unmute' : '🎙️ Mute'}
                    </Button>
                    <Button
                      variant={isCameraOff ? 'danger' : 'secondary'}
                      onClick={handleToggleVideo}
                    >
                      {isCameraOff ? '📷 Start Camera' : '📹 Stop Camera'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Room Info Card */}
            {room && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-slate-900">Room Details</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Owner</p>
                      <p className="font-semibold text-slate-900">{isOwner ? 'You' : room.owner?.name || 'Unknown'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Created</p>
                      <p className="font-semibold text-slate-900">{new Date(room.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Members</p>
                      <p className="font-semibold text-slate-900">{room.members?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Status</p>
                      <p className="font-semibold text-emerald-600">{isJoined ? '✓ Joined' : 'Not joined'}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Members Card */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <h2 className="text-lg font-semibold text-slate-900">Members ({room?.members?.length || 0})</h2>
              </CardHeader>
              <CardBody>
                {room?.members && room.members.length > 0 ? (
                  <div className="space-y-3">
                    {room.members.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {member.user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">
                              {member.user?.name}
                              {member.userId === room.ownerId && (
                                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full ml-2">Owner</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-600">{member.user?.email}</p>
                          </div>
                        </div>
                        {onlineUsers.has(member.userId) ? (
                          <span className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                            <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>Online
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-500">Offline</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-600">No members in this room yet</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100">
                <h2 className="font-semibold text-slate-900">Actions</h2>
              </CardHeader>
              <CardBody className="space-y-3">
                {!isJoined ? (
                  <>
                    <p className="text-sm text-slate-600 mb-4">Join this room to start the call.</p>
                    <Button variant="primary" className="w-full" onClick={handleJoinRoom} isLoading={isActionLoading}>
                      Join Room
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-600 mb-2">You are a member of this room.</p>
                    {isOwner && (
                      <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">You are the room owner</p>
                    )}
                    <Button variant="secondary" className="w-full" onClick={() => setIsLeaveModalOpen(true)} isLoading={isActionLoading}>
                      Leave Room
                    </Button>
                    {isOwner && (
                      <Button variant="danger" className="w-full" onClick={() => setIsDeleteModalOpen(true)} isLoading={isActionLoading}>
                        Delete Room
                      </Button>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      <Modal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} title="Leave Room?"
        description="You will no longer be a member of this room."
        actions={[
          { label: 'Cancel', variant: 'secondary', onClick: () => setIsLeaveModalOpen(false) },
          { label: 'Leave Room', variant: 'danger', onClick: handleLeaveRoom, isLoading: isActionLoading },
        ]}>
        <p className="text-sm text-slate-600">This action cannot be undone.</p>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Room?"
        description="This will permanently delete the room and remove all members."
        actions={[
          { label: 'Cancel', variant: 'secondary', onClick: () => setIsDeleteModalOpen(false) },
          { label: 'Delete Room', variant: 'danger', onClick: handleDeleteRoom, isLoading: isActionLoading },
        ]}>
        <p className="text-sm text-red-600">⚠️ This action cannot be undone. All room data will be lost.</p>
      </Modal>
    </main>
  )
}

// ── VideoTile component ───────────────────────────────────────────────────────
function VideoTile({ stream, muted = false, label }: { stream: MediaStream | null; muted?: boolean; label: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video">
      {stream ? (
        <video ref={ref} autoPlay playsInline muted={muted} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
          No stream
        </div>
      )}
      <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
        {label}
      </span>
    </div>
  )
}