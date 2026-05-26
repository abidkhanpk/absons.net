import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12
const ENCRYPTED_PREFIX = "enc:v1:"

function getEncryptionKey() {
  const source = (process.env.SETTINGS_ENCRYPTION_KEY || process.env.AUTH_SECRET || "").trim()
  if (!source) return null
  return createHash("sha256").update(source).digest()
}

export function isSecretEncrypted(value: string) {
  return value.startsWith(ENCRYPTED_PREFIX)
}

export function encryptSecret(value: string) {
  if (!value) return ""
  if (isSecretEncrypted(value)) return value

  const key = getEncryptionKey()
  if (!key) {
    throw new Error("Missing encryption key. Configure SETTINGS_ENCRYPTION_KEY (or AUTH_SECRET).")
  }

  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return `${ENCRYPTED_PREFIX}${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`
}

export function decryptSecret(value: string) {
  if (!value) return ""
  if (!isSecretEncrypted(value)) return value

  const key = getEncryptionKey()
  if (!key) {
    throw new Error("Missing encryption key. Configure SETTINGS_ENCRYPTION_KEY (or AUTH_SECRET).")
  }

  const payload = value.slice(ENCRYPTED_PREFIX.length)
  const [ivPart, tagPart, encryptedPart] = payload.split(".")
  if (!ivPart || !tagPart || !encryptedPart) {
    throw new Error("Invalid encrypted secret payload.")
  }

  const iv = Buffer.from(ivPart, "base64url")
  const tag = Buffer.from(tagPart, "base64url")
  const encrypted = Buffer.from(encryptedPart, "base64url")
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8")
}
