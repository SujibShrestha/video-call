import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import { ToastContainer } from './components/ui/ToastContainer'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Room } from './pages/Room.tsx'
import { Register } from './pages/Register'
import { getMe, getAuthToken, getErrorMessage } from './api/api'

// Inner component that uses auth context
function AppRoutes() {
  const { setUser } = useAuthContext()

  // Hydrate auth on app load
  useEffect(() => {
    const token = getAuthToken()
    if (token) {
      getMe()
        .then((user: any) => setUser(user))
        .catch((error: any) => {
          console.error('Failed to hydrate user:', getErrorMessage(error))
          // Token might be invalid, clear it
        })
    }
  }, [setUser])

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/room/:id" element={<Room />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App


