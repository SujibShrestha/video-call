import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/db.js'
import { loginSchema, registerSchema } from '../validation/auth.validation.js'
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js'

const jwtSecret = process.env.JWT_SECRET ?? 'change-me-in-production'

const buildToken = (userId: string, email: string) => {
  return jwt.sign({ userId, email }, jwtSecret, { expiresIn: '7d' })
}

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const

export const register = async (req: Request, res: Response) => {
  const parsedBody = registerSchema.safeParse(req.body)

  if (!parsedBody.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: parsedBody.error.flatten().fieldErrors,
    })
  }

  const { name, email, password } = parsedBody.data

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' })
    }
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: safeUserSelect,
    })

    const token = buildToken(user.id, user.email)

    return res.status(201).json({
      message: 'User created successfully',
      token,
      user,
    })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ message: 'Unable to create user' })
  }
}

export const login = async (req: Request, res: Response) => {
  const parsedBody = loginSchema.safeParse(req.body)

  if (!parsedBody.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: parsedBody.error.flatten().fieldErrors,
    })
  }

  const { email, password } = parsedBody.data

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const passwordMatches = await bcrypt.compare(password, user.password)

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = buildToken(user.id, user.email)

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Unable to sign in' })
  }
}

export const me = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.authUser) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.authUser.userId },
      select: safeUserSelect,
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json({ user })
  } catch (error) {
    console.error('Me error:', error)
    return res.status(500).json({ message: 'Unable to load user' })
  }
}