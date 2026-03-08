import { eq, and, sql, count } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users, follows, userBadges, badges } from '../db/schema.js'
import { redis, keys, cacheGet, cacheSet, cacheDel } from '../utils/redis.js'
import { config } from '../config/index.js'
import { NotFoundError, ConflictError } from '../utils/errors.js'

export class UserService {
  async getProfile(userId: string, requestingUserId?: string) {
    const cacheKey = keys.userProfile(userId)
    const cached = await cacheGet<object>(cacheKey)
    if (cached) return cached

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        bio: users.bio,
        location: users.location,
        avatarUrl: users.avatarUrl,
        auraPoints: users.auraPoints,
        totalPredictions: users.totalPredictions,
        totalVotes: users.totalVotes,
        correctVotes: users.correctVotes,
        currentStreak: users.currentStreak,
        longestStreak: users.longestStreak,
        accuracyPercent: users.accuracyPercent,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) throw new NotFoundError('User')

    const [followerCount, followingCount] = await Promise.all([
      db.select({ value: count() }).from(follows).where(eq(follows.followingId, userId)),
      db.select({ value: count() }).from(follows).where(eq(follows.followerId, userId)),
    ])

    const profile = {
      ...user,
      followerCount: followerCount[0].value,
      followingCount: followingCount[0].value,
    }

    await cacheSet(cacheKey, profile, config.CACHE_TTL_USER_PROFILE)
    return profile
  }

  async updateProfile(userId: string, updates: { displayName?: string; bio?: string; location?: string; avatarUrl?: string }) {
    const [updated] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        bio: users.bio,
        location: users.location,
        avatarUrl: users.avatarUrl,
      })

    await cacheDel(keys.userProfile(userId))
    return updated
  }

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) throw new ConflictError('Cannot follow yourself')

    const [target] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, followingId))
      .limit(1)

    if (!target) throw new NotFoundError('User')

    const existing = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .limit(1)

    if (existing.length > 0) throw new ConflictError('Already following this user')

    await db.insert(follows).values({ followerId, followingId })

    // Invalidate both users' caches
    await Promise.all([cacheDel(keys.userProfile(followerId)), cacheDel(keys.userProfile(followingId))])
  }

  async unfollow(followerId: string, followingId: string) {
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))

    await Promise.all([cacheDel(keys.userProfile(followerId)), cacheDel(keys.userProfile(followingId))])
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const rows = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .limit(1)
    return rows.length > 0
  }

  async getUserBadges(userId: string) {
    return db
      .select({
        slug: badges.slug,
        name: badges.name,
        description: badges.description,
        iconUrl: badges.iconUrl,
        earnedAt: userBadges.earnedAt,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .orderBy(userBadges.earnedAt)
  }
}
