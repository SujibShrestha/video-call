import { Router } from 'express'
import { createRooms, deleteRoom, getRoom, getRooms, joinRoom, leaveRoom } from '../controllers/room.controller.js'
import { requireAuth } from '../middlewares/auth.middleware.js'


const roomRouter = Router()

roomRouter.post('/',requireAuth, createRooms)
roomRouter.get('/',requireAuth, getRooms)
roomRouter.delete('/:id',requireAuth,deleteRoom)
roomRouter.post('/:id/join', requireAuth, joinRoom);
roomRouter.delete('/:id/leave', requireAuth, leaveRoom);
roomRouter.get('/:id',requireAuth,getRoom)


export default roomRouter