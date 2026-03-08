import Redis from 'ioredis'
import { config } from '../config/index.js'

// Shared Redis client — reused across services.
// ioredis auto-reconnects with exponential backoff.
export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
})

redis.on('error', (err) => {
  console.error('[Redis] Connection error', err)
})

redis.on('connect', () => {
  console.log('[Redis] Connected')
})

// ─── Key helpers ──────────────────────────────────────────────────────────────

export const keys = {
  // Sorted set: member = userId, score = auraPoints (global all-time)
  leaderboardGlobal: () => 'lb:global',
  // Sorted set: member = userId, score = auraPoints earned this ISO week
  leaderboardWeekly: (isoWeek: string) => `lb:weekly:${isoWeek}`,
  // Sorted set: member = userId, score = accuracyPercent * 100 (int)
  leaderboardAccuracy: () => 'lb:accuracy',

  // Hash: field = predictionId, value = JSON snapshot for feed
  predictionCache: (id: string) => `pred:${id}`,
  // Feed of active prediction IDs sorted by score
  activePredictions: (category: string) => `feed:${category}`,

  // Vote counts (real-time, synced to DB via queue)
  predictionYesCount: (id: string) => `vote:yes:${id}`,
  predictionNoCount: (id: string) => `vote:no:${id}`,

  // User profile cache
  userProfile: (id: string) => `user:${id}`,

  // Rate limiting (handled by @fastify/rate-limit, keys managed by Redis)
  // WebSocket pub/sub channel for a prediction's live updates
  predictionChannel: (id: string) => `ws:pred:${id}`,
  // Global activity channel
  globalChannel: () => 'ws:global',
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key)
  if (!raw) return null
  return JSON.parse(raw) as T
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
}

export async function cacheDel(key: string): Promise<void> {
  await redis.del(key)
}

// Current ISO week string, e.g. "2024-W22"
export function currentIsoWeek(): string {
  const now = new Date()
  const jan1 = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}
