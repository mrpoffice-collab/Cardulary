/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, record] of entries) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  maxRequests: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Unique identifier for this rate limiter (e.g., 'login', 'signup')
   */
  identifier: string;
}

/**
 * Rate limit a request based on IP address
 */
export function rateLimit(
  req: Request,
  config: RateLimitConfig
): { success: boolean; limit: number; remaining: number; reset: number } {
  // Get client IP
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  // Create unique key
  const key = `${config.identifier}:${ip}`;

  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // New window
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: resetTime,
    };
  }

  if (record.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: record.resetTime,
    };
  }

  // Increment counter
  record.count++;

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.count,
    reset: record.resetTime,
  };
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Auth endpoints - strict limits
  signup: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    identifier: "signup",
  },
  login: {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    identifier: "login",
  },

  // Address submission - moderate limits
  submit: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    identifier: "submit",
  },

  // API endpoints - generous limits
  api: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    identifier: "api",
  },
} as const;

/**
 * Helper to create rate limit response
 */
export function rateLimitResponse(limit: number, remaining: number, reset: number) {
  const resetDate = new Date(reset);

  return new Response(
    JSON.stringify({
      error: "Too many requests. Please try again later.",
      retryAfter: Math.ceil((reset - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": resetDate.toISOString(),
        "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    }
  );
}
