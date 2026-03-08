/**
 * Run this script to apply pending migrations:
 *   npx tsx src/db/migrate.ts
 */
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db, pool } from './index.js'

await migrate(db, { migrationsFolder: './drizzle' })
console.log('[DB] Migrations applied successfully')
await pool.end()
