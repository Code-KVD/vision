import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { UnauthorizedError } from '../utils/errors.js'

export interface JwtPayload {
  sub: string   // userId
  username: string
  iat: number
  exp: number
}

declare module 'fastify' {
  interface FastifyRequest {
    userId: string
    username: string
  }
}

/**
 * authenticate — verifies JWT and attaches userId/username to request.
 * Use as a preHandler hook on protected routes.
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const payload = await request.jwtVerify<JwtPayload>()
    request.userId = payload.sub
    request.username = payload.username
  } catch {
    throw new UnauthorizedError('Invalid or expired token')
  }
}

/**
 * optionalAuthenticate — like authenticate but doesn't throw if no token.
 * Useful for public routes that benefit from knowing the current user.
 */
export async function optionalAuthenticate(request: FastifyRequest, _reply: FastifyReply) {
  try {
    const payload = await request.jwtVerify<JwtPayload>()
    request.userId = payload.sub
    request.username = payload.username
  } catch {
    // No token — continue as anonymous
  }
}
