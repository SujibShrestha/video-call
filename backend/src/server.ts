import express, { type Request, type Response } from 'express'
import { prisma } from './config/db.js'
import cors from "cors"
import dotenv from "dotenv"
import { createServer } from 'http'
import authRoutes from './routes/auth.route.js'
import roomRoutes from './routes/room.route.js'
import { initSocket } from './socket/index.js'
dotenv.config()

const app = express()
const httpServer = createServer(app)
const port = process.env.PORT || 3000

//Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//ROutes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/room', roomRoutes)


app.get('/',(req:Request,res:Response)=>{
    res.json({
        message:"Api is Running"
    })
})

app.get('/health', (_req:Request, res:Response) => {
	res.status(200).json({
		status: 'ok',
		service: 'backend',
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
	})
})

app.get('/health/ready', async (_req:Request, res:Response) => {
	try {
		await prisma.$queryRaw`SELECT 1`
		res.status(200).json({ status: 'ready' })
	} catch (_error) {
		res.status(503).json({ status: 'not_ready' })
	}
})

// Socket.io
initSocket(httpServer)



httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})