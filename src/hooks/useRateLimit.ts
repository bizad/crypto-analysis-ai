import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseRateLimitOptions {
  /** Maximum number of requests allowed in the sliding window */
  maxRequests?: number;
  /** Sliding window size in milliseconds (e.g. 10,000 for 10s) */
  windowMs?: number;
  /** Cooldown time required between consecutive requests in milliseconds */
  cooldownMs?: number;
  /** Optional localStorage key to persist rate limiting across page reloads */
  storageKey?: string;
  /** Callback fired when rate limit or cooldown is violated */
  onRateLimitExceeded?: (retryAfterSeconds: number, reason: 'WINDOW_LIMIT' | 'COOLDOWN') => void;
}

export interface RateLimitResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  throttled: boolean;
  retryAfterSeconds?: number;
}

export function useRateLimit(options: UseRateLimitOptions = {}) {
  const {
    maxRequests = 5,
    windowMs = 15000,
    cooldownMs = 1000,
    storageKey,
    onRateLimitExceeded,
  } = options;

  // Timestamps of past requests in current window
  const [requestTimestamps, setRequestTimestamps] = useState<number[]>(() => {
    if (typeof window === 'undefined' || !storageKey) return [];
    try {
      const stored = localStorage.getItem(`rl_${storageKey}`);
      if (stored) {
        const parsed: number[] = JSON.parse(stored);
        const now = Date.now();
        return parsed.filter((t) => now - t < windowMs);
      }
    } catch {}
    return [];
  });

  const [isThrottled, setIsThrottled] = useState(false);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  // Sync timestamps to localStorage if storageKey is provided
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`rl_${storageKey}`, JSON.stringify(requestTimestamps));
      } catch {}
    }
  }, [requestTimestamps, storageKey]);

  // Clean expired timestamps
  const cleanExpiredTimestamps = useCallback(
    (timestamps: number[], now = Date.now()) => {
      return timestamps.filter((t) => now - t < windowMs);
    },
    [windowMs]
  );

  /**
   * Check if a request can be executed right now without recording it
   */
  const canMakeRequest = useCallback((): {
    allowed: boolean;
    reason?: 'WINDOW_LIMIT' | 'COOLDOWN';
    retryAfterSeconds: number;
    remaining: number;
  } => {
    const now = Date.now();
    const valid = cleanExpiredTimestamps(requestTimestamps, now);

    // 1. Check cooldown between consecutive requests
    if (cooldownMs > 0 && valid.length > 0) {
      const lastRequest = valid[valid.length - 1];
      const timeSinceLast = now - lastRequest;
      if (timeSinceLast < cooldownMs) {
        const waitMs = cooldownMs - timeSinceLast;
        const retrySec = Math.ceil(waitMs / 1000);
        return {
          allowed: false,
          reason: 'COOLDOWN',
          retryAfterSeconds: Math.max(1, retrySec),
          remaining: Math.max(0, maxRequests - valid.length),
        };
      }
    }

    // 2. Check window capacity limit
    if (valid.length >= maxRequests) {
      const oldest = valid[0];
      const waitMs = windowMs - (now - oldest);
      const retrySec = Math.ceil(waitMs / 1000);
      return {
        allowed: false,
        reason: 'WINDOW_LIMIT',
        retryAfterSeconds: Math.max(1, retrySec),
        remaining: 0,
      };
    }

    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: Math.max(0, maxRequests - valid.length),
    };
  }, [cleanExpiredTimestamps, requestTimestamps, cooldownMs, maxRequests, windowMs]);

  /**
   * Record a new request timestamp
   */
  const recordRequest = useCallback(() => {
    const now = Date.now();
    setRequestTimestamps((prev) => {
      const cleaned = cleanExpiredTimestamps(prev, now);
      return [...cleaned, now];
    });
  }, [cleanExpiredTimestamps]);

  /**
   * Reset rate limit state
   */
  const reset = useCallback(() => {
    setRequestTimestamps([]);
    setIsThrottled(false);
    setRetryAfterSeconds(0);
    if (storageKey && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`rl_${storageKey}`);
      } catch {}
    }
  }, [storageKey]);

  /**
   * Execute an async API call with automatic client-side throttling
   */
  const executeWithRateLimit = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      customErrorMessageFa?: string
    ): Promise<RateLimitResult<T>> => {
      const check = canMakeRequest();

      if (!check.allowed) {
        setIsThrottled(true);
        setRetryAfterSeconds(check.retryAfterSeconds);

        if (onRateLimitExceeded) {
          onRateLimitExceeded(check.retryAfterSeconds, check.reason || 'WINDOW_LIMIT');
        }

        // Auto-clear throttled state after retry period
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setIsThrottled(false);
          setRetryAfterSeconds(0);
        }, check.retryAfterSeconds * 1000);

        const defaultMsg =
          check.reason === 'COOLDOWN'
            ? `لطفاً ${check.retryAfterSeconds} ثانیه قبل از ارسال مجدد درخواست صبر فرمایید.`
            : `سقف درخواست‌ها پر شده است. لطفاً ${check.retryAfterSeconds} ثانیه دیگر مجدداً امتحان نمایید.`;

        return {
          success: false,
          throttled: true,
          retryAfterSeconds: check.retryAfterSeconds,
          error: customErrorMessageFa || defaultMsg,
        };
      }

      // Record request and execute
      recordRequest();

      try {
        const result = await asyncFn();
        return {
          success: true,
          data: result,
          throttled: false,
        };
      } catch (err: any) {
        return {
          success: false,
          throttled: false,
          error: err?.message || 'خطا در اجرای درخواست.',
        };
      }
    },
    [canMakeRequest, onRateLimitExceeded, recordRequest]
  );

  const check = canMakeRequest();

  return {
    canMakeRequest: check.allowed,
    remainingRequests: check.remaining,
    retryAfterSeconds: isThrottled ? retryAfterSeconds : check.retryAfterSeconds,
    isThrottled,
    recordRequest,
    executeWithRateLimit,
    reset,
  };
}
