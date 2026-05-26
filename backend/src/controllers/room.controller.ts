import type { Response } from "express";
import { prisma } from "../config/db.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export const createRooms = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name }: { name: string } = req.body;
    const ownerId = req.authUser?.userId;

    if (!ownerId) {
      return res.status(401).json("Unauthorized");
    }

    if (!name) {
      return res.status(400).json("Enter Room name");
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
    });

    return res.status(201).json({ room });
  } catch (err) {
    console.log("Error while Creating the room", err);
    return res.status(500).json("Something went wrong while creating room");
  }
};

export const getRooms = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.authUser?.userId;
    if (!userId) {
      return res.status(404).json({ message: "Unauthorized" });
    }

    const rooms = await prisma.room.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!rooms) {
      res.status(404).json({ message: "Room not Created or Found" });
    }
  } catch (error) {
    console.log("Error while Fetching Rooms", error);
    return res.status(500).json({
      message: "Error getting rooms",
      error: error,
    });
  }
};

//join room
export const joinRoom = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const roomId = id as string | undefined;
  const userId = req.authUser!.userId;

  if (!roomId) {
    return res.status(400).json("Room id not specified");
  }
  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json("Room not Found or Already Closed");
    }
   
    const member = await prisma.roomMember.upsert({
      where: {
        userId_roomId: { userId, roomId },
      },
      update: {}, // already a member, do nothing
      create: { userId, roomId },
    });
    return res
      .status(200)
      .json({ message: "Joined room successfully", member });
  } catch (error) {
    console.log("Error while joining room", error);
    res.status(500).json("Error while joining room");
  }
};

//delete room
export const deleteRoom = async (req: AuthenticatedRequest, res: Response) => {
   const { id } = req.params;
   const roomId = id as string | undefined;
  const userId = req.authUser!.userId;
  if (!roomId) {
    return res.status(400).json("Room id not specified");
  }
  try{
    const room = await prisma.room.findUnique({where:{id:roomId}})

    if(!room){
      return res.status(404).json("Room not Found or Already Deleted")
    }

    if(room.ownerId !== userId){
      return res.status(401).json("Unauthorized")
    }
    await prisma.room.delete({ where: { id: roomId } })
    
    return res.status(200).json("Room deleted Successfully");
  } catch (err) {
    console.log("Error while Deleting the room", err);
    return res.status(500).json("Something went wrong while Deleting room");
  }
};
//Get room
export const getRoom = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const roomId = id as string | undefined;
  const userId = req.authUser!.userId;

  if (!roomId) {
    return res.status(400).json("Room id not specified");
  }

  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json("Room not found");
    }

    // Only owner or members can view the room
    const isMember = room.members.some((m) => m.userId === userId);
    const isOwner = room.ownerId === userId;

    if (!isMember && !isOwner) {
      // Allow non-members to view basic room info so they can join.
      // Return room metadata but hide members list to avoid exposing member details.
      const publicRoom = {
        id: room.id,
        name: room.name,
        owner: room.owner,
        ownerId: room.ownerId,
        createdAt: room.createdAt,
        members: [],
      }

      return res.status(200).json(publicRoom);
    }

    return res.status(200).json(room);
  } catch (err) {
    console.log("Error while fetching the room", err);
    return res.status(500).json("Something went wrong while fetching room");
  }
};

//leave room
export const leaveRoom = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const roomId = id as string | undefined;
  const userId = req.authUser!.userId;

  if (!roomId) {
    return res.status(400).json("Room id not specified");
  }

  try {
    const room = await prisma.room.findUnique({ where: { id: roomId } });

    if (!room) {
      return res.status(404).json("Room not found");
    }

    if (room.ownerId === userId) {
      return res.status(400).json("Owner cannot leave the room, delete it instead");
    }

    const membership = await prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });

    if (!membership) {
      return res.status(400).json("You are not a member of this room");
    }

    await prisma.roomMember.delete({
      where: { userId_roomId: { userId, roomId } },
    });

    return res.status(200).json("Left room successfully");
  } catch (err) {
    console.log("Error while leaving the room", err);
    return res.status(500).json("Something went wrong while leaving the room");
  }
};
