import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthTokenPayload {
  userId: string
  email: string
}

export interface AuthenticatedRequest extends Request {
  authUser?: AuthTokenPayload
}

const jwtSecret = process.env.JWT_SECRET ?? 'change-me-in-production'

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authorizationHeader = req.headers.authorization

  if (!authorizationHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing bearer token' })
  }

  const token = authorizationHeader.slice(7)

  try {
    const decoded = jwt.verify(token, jwtSecret)

    if (typeof decoded !== 'object' || decoded === null) {
      return res.status(401).json({ message: 'Invalid token payload' })
    }

    const payload = decoded as Partial<AuthTokenPayload>

    if (typeof payload.userId !== 'string' || typeof payload.email !== 'string') {
      return res.status(401).json({ message: 'Invalid token payload' })
    }

    req.authUser = {
      userId: payload.userId,
      email: payload.email,
    }

    return next()
  } catch {
    return res.status(401).json({ message: 'Token verification failed' })
  }
}