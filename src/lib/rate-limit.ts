/**
 * Rate limit en memoria (proceso único). Si escalás a varias réplicas, usá Redis u otro store compartido.
 */
type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

const PRUNE_EVERY = 300
let lastPrune = 0

function prune(now: number) {
  if (now - lastPrune < PRUNE_EVERY) return
  lastPrune = now
  for (const [k, b] of buckets) {
    if (now > b.resetAt) buckets.delete(k)
  }
}

/** @returns true si la petición está permitida */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): boolean {
  const now = Date.now()
  prune(now)

  let b = buckets.get(key)
  if (!b || now > b.resetAt) {
    b = { count: 1, resetAt: now + windowMs }
    buckets.set(key, b)
    return true
  }
  if (b.count >= max) return false
  b.count += 1
  return true
}

export function loansManualRateLimitConfig() {
  const max = Number(process.env.LOANS_API_RATE_LIMIT_MAX ?? "30")
  const windowMs = Number(process.env.LOANS_API_RATE_LIMIT_MS ?? "60000")
  return {
    max: Number.isFinite(max) && max > 0 ? max : 30,
    windowMs: Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 60_000,
  }
}
