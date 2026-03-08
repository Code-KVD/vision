import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

const SALT_BYTES = 32
const KEY_BYTES = 64

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString('hex')
  const derivedKey = (await scryptAsync(password, salt, KEY_BYTES)) as Buffer
  return `${salt}:${derivedKey.toString('hex')}`
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, storedKey] = hash.split(':')
  const derivedKey = (await scryptAsync(password, salt, KEY_BYTES)) as Buffer
  const storedKeyBuf = Buffer.from(storedKey, 'hex')
  return timingSafeEqual(derivedKey, storedKeyBuf)
}
