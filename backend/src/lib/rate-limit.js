const buckets = new Map();

function cleanupBucket(now) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function checkRateLimit(key, limit, windowMs) {
  const now = Date.now();
  cleanupBucket(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs
    });

    return {
      allowed: true,
      remaining: limit - 1
    };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: bucket.resetAt - now
    };
  }

  bucket.count += 1;

  return {
    allowed: true,
    remaining: limit - bucket.count
  };
}
