import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { config } from '../config/index.js'
import * as schema from './schema.js'

const { Pool } = pg

// Connection pool sized for 100k concurrent users across multiple server instances.
// Each instance gets DB_POOL_MAX connections. With 10 instances: 10 * 20 = 200 connections.
// PostgreSQL default max_connections = 100, so configure postgres accordingly (max_connections=500).
export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  min: config.DB_POOL_MIN,
  max: config.DB_POOL_MAX,
  // Kill idle connections after 30s to avoid connection exhaustion
  idleTimeoutMillis: 30_000,
  // Fail fast if we can't connect within 5s
  connectionTimeoutMillis: 5_000,
})

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error', err)
})

export const db = drizzle(pool, { schema })

export type Db = typeof db
