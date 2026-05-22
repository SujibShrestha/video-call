import type { Response } from 'express'
import { prisma } from '../config/db.js'
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js'

export const createRooms = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name }: { name: string } = req.body
        const ownerId = req.authUser?.userId

        if (!ownerId) {
            return res.status(401).json('Unauthorized')
        }

        if (!name) {
            return res.status(400).json('Enter Room name')
        }

        const room = await prisma.room.create({
            data: {
                name,
                owner: {
                    connect: {
                        id: ownerId,
                    },
                },
            },
        })

        return res.status(201).json({ room })
    } catch (err) {
        console.log('Error while Creating the room')
        return res.status(500).json('Something went wrong while creating room')
    }
}