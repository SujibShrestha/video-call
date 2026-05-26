import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { createRoom, getErrorMessage } from '../api/api'

export function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthContext()
  const { addToast } = useToast()

  const [roomName, setRoomName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [errors, setErrors] = useState<{ roomName?: string; roomId?: string }>({})
  const [isCreateLoading, setIsCreateLoading] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)

  const handleCreateRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmed = roomName.trim()
    if (!trimmed) {
      setErrors({ roomName: 'Room name is required' })
      return
    }

    setIsCreateLoading(true)
    setErrors({})

    try {
      const room = await createRoom(trimmed)
      addToast({
        type: 'success',
        title: 'Room created',
        description: `"${room.name}" created. Invite others using the room ID or share the link.`,
        duration: 5000,
      })
      navigate(`/room/${room.id}`)
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      addToast({
        type: 'error',
        title: 'Could not create room',
        description: `${errorMessage}. Try again or check your network connection.`,
        duration: 6000,
      })
    } finally {
      setIsCreateLoading(false)
    }
  }

  const handleJoinRoom = () => {
    const trimmed = roomId.trim()
    if (!trimmed) {
      setErrors({ roomId: 'Room ID is required' })
      return
    }

    setErrors({})
    navigate(`/room/${trimmed}`)
    setIsJoinModalOpen(false)
    setRoomId('')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          {/* Welcome Card */}
          <Card className="mb-12 bg-gradient-to-br from-white to-blue-50 border-blue-100 overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl"></div>
            <CardBody className="relative p-8 sm:p-12">
              <div className="max-w-2xl">
                <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
                  {isAuthenticated ? `Welcome back, ${user?.name}! 👋` : 'Welcome to V-Call'}
                </h1>
                <p className="text-lg text-slate-600 mb-8">
                  {isAuthenticated
                    ? 'Create a new room for your team or join an existing one using a room ID.'
                    : 'The modern way to host real-time rooms and connect with your team. Sign in to get started.'}
                </p>

                {!isAuthenticated && (
                  <div className="flex gap-4">
                    <Button variant="primary" size="md" onClick={() => navigate('/register')}>
                      Create Account
                    </Button>
                    <Button variant="secondary" size="md" onClick={() => navigate('/login')}>
                      Sign In
                    </Button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {isAuthenticated && (
            <>
              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Create Room Card */}
                <Card>
                  <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <h2 className="text-xl font-bold text-slate-900">Create New Room</h2>
                  </CardHeader>
                  <CardBody>
                    <form onSubmit={handleCreateRoom} className="space-y-4">
                      <Input
                        label="Room name"
                        type="text"
                        placeholder="Team standup, Design review, etc."
                        value={roomName}
                        onChange={(e) => {
                          setRoomName(e.target.value)
                          if (errors.roomName) setErrors({ ...errors, roomName: undefined })
                        }}
                        error={errors.roomName}
                        disabled={isCreateLoading}
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        isLoading={isCreateLoading}
                      >
                        Create Room
                      </Button>
                    </form>
                  </CardBody>
                </Card>

                {/* Join Room Card */}
                <Card>
                  <CardHeader className="bg-gradient-to-br from-emerald-50 to-emerald-100">
                    <h2 className="text-xl font-bold text-slate-900">Join Existing Room</h2>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600">
                        Got a room ID from someone? Jump right in with a single click.
                      </p>
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => setIsJoinModalOpen(true)}
                      >
                        Enter Room ID
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10h.01M11 10h.01M7 10h.01M6 20a6 6 0 1112 0v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Easy to Share</h3>
                  <p className="text-sm text-slate-600">Share a simple room ID with your team to connect instantly.</p>
                </div>

                <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Real-time Updates</h3>
                  <p className="text-sm text-slate-600">See when members join and leave your room instantly.</p>
                </div>

                <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Fast & Reliable</h3>
                  <p className="text-sm text-slate-600">Built on modern technology for seamless performance.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Join Room Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => {
          setIsJoinModalOpen(false)
          setRoomId('')
          setErrors({})
        }}
        title="Join a Room"
        description="Enter the room ID to join an existing room"
        actions={[
          {
            label: 'Cancel',
            variant: 'secondary',
            onClick: () => {
              setIsJoinModalOpen(false)
              setRoomId('')
              setErrors({})
            },
          },
          {
            label: 'Join Room',
            variant: 'primary',
            onClick: handleJoinRoom,
          },
        ]}
      >
        <Input
          label="Room ID"
          type="text"
          placeholder="Paste the room ID here"
          value={roomId}
          onChange={(e) => {
            setRoomId(e.target.value)
            if (errors.roomId) setErrors({ ...errors, roomId: undefined })
          }}
          error={errors.roomId}
          autoFocus
        />
      </Modal>
    </main>
  )
}
