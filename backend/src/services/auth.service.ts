import { eq } from 'drizzle-orm'
import { randomBytes } from 'node:crypto'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { redis, keys } from '../utils/redis.js'
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors.js'
import { config } from '../config/index.js'
import type { FastifyInstance } from 'fastify'

export interface RegisterInput {
  username: string
  email: string
  password: string
  displayName: string
}

export interface LoginInput {
  email: string
  password: string
}

export class AuthService {
  constructor(private readonly app: FastifyInstance) {}

  async register(input: RegisterInput) {
    // Check uniqueness
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email.toLowerCase()))
      .limit(1)

    if (existing.length > 0) {
      throw new ConflictError('Email already in use')
    }

    const existingUsername = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, input.username.toLowerCase()))
      .limit(1)

    if (existingUsername.length > 0) {
      throw new ConflictError('Username already taken')
    }

    const passwordHash = await hashPassword(input.password)

    const [user] = await db
      .insert(users)
      .values({
        username: input.username.toLowerCase(),
        email: input.email.toLowerCase(),
        passwordHash,
        displayName: input.displayName,
      })
      .returning({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        auraPoints: users.auraPoints,
        createdAt: users.createdAt,
      })

    const tokens = await this.generateTokens(user.id, user.username)
    return { user, ...tokens }
  }

  async login(input: LoginInput) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email.toLowerCase()))
      .limit(1)

    if (!user) {
      throw new UnauthorizedError('Invalid credentials')
    }

    const valid = await verifyPassword(input.password, user.passwordHash)
    if (!valid) {
      throw new UnauthorizedError('Invalid credentials')
    }

    // Update last active
    await db
      .update(users)
      .set({ lastActiveAt: new Date() })
      .where(eq(users.id, user.id))

    const tokens = await this.generateTokens(user.id, user.username)

    return {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        auraPoints: user.auraPoints,
        accuracyPercent: user.accuracyPercent,
      },
      ...tokens,
    }
  }

  async refresh(refreshToken: string) {
    // Verify the refresh token JWT
    let payload: { sub: string; username: string; type: string }
    try {
      payload = this.app.jwt.verify(refreshToken) as typeof payload
    } catch {
      throw new UnauthorizedError('Invalid refresh token')
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type')
    }

    // Check it hasn't been revoked (stored hash in DB)
    const [user] = await db
      .select({ id: users.id, username: users.username, refreshTokenHash: users.refreshTokenHash })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1)

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedError('Token revoked')
    }

    const tokenHash = await hashPassword(refreshToken)
    const valid = await verifyPassword(refreshToken, user.refreshTokenHash)
    if (!valid) {
      throw new UnauthorizedError('Token revoked')
    }

    return this.generateTokens(user.id, user.username)
  }

  async logout(userId: string) {
    // Revoke refresh token by clearing hash
    await db.update(users).set({ refreshTokenHash: null }).where(eq(users.id, userId))
    // Invalidate user profile cache
    await redis.del(keys.userProfile(userId))
  }

  private async generateTokens(userId: string, username: string) {
    const accessToken = this.app.jwt.sign(
      { sub: userId, username },
      { expiresIn: config.JWT_ACCESS_TTL },
    )

    const refreshToken = this.app.jwt.sign(
      { sub: userId, username, type: 'refresh' },
      { expiresIn: config.JWT_REFRESH_TTL },
    )

    // Store hashed refresh token for revocation checking
    const refreshHash = await hashPassword(refreshToken)
    await db.update(users).set({ refreshTokenHash: refreshHash }).where(eq(users.id, userId))

    return { accessToken, refreshToken }
  }
}
