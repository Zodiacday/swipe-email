/**
 * Rate limiter utility for Gmail API requests.
 * Implements request queuing with exponential backoff for 429 errors.
 */

interface QueuedRequest<T> {
    fn: () => Promise<T>;
    resolve: (value: T) => void;
    reject: (error: Error) => void;
    retryCount: number;
}

class RateLimiter {
    private queue: QueuedRequest<unknown>[] = [];
    private isProcessing = false;
    private lastRequestTime = 0;
    private minInterval = 100; // Minimum ms between requests
    private maxRetries = 3;
    private backoffMultiplier = 2;
    private baseDelay = 1000; // 1 second base delay for retries

    /**
     * Queue a request to be executed with rate limiting.
     */
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push({
                fn,
                resolve: resolve as (value: unknown) => void,
                reject,
                retryCount: 0,
            });
            this.processQueue();
        });
    }

    private async processQueue(): Promise<void> {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;

        while (this.queue.length > 0) {
            const request = this.queue.shift()!;

            // Respect minimum interval between requests
            const now = Date.now();
            const elapsed = now - this.lastRequestTime;
            if (elapsed < this.minInterval) {
                await this.sleep(this.minInterval - elapsed);
            }

            try {
                this.lastRequestTime = Date.now();
                const result = await request.fn();
                request.resolve(result);
            } catch (error: unknown) {
                if (this.isRateLimitError(error) && request.retryCount < this.maxRetries) {
                    // Exponential backoff
                    const delay = this.baseDelay * Math.pow(this.backoffMultiplier, request.retryCount);
                    console.warn(`Rate limited, retrying in ${delay}ms (attempt ${request.retryCount + 1}/${this.maxRetries})`);

                    await this.sleep(delay);

                    // Re-queue with incremented retry count
                    request.retryCount++;
                    this.queue.unshift(request);
                } else {
                    request.reject(error instanceof Error ? error : new Error(String(error)));
                }
            }
        }

        this.isProcessing = false;
    }

    private isRateLimitError(error: unknown): boolean {
        if (error && typeof error === 'object') {
            const err = error as { status?: number; code?: number; message?: string };
            return (
                err.status === 429 ||
                err.code === 429 ||
                (err.message?.includes("429") ?? false) ||
                (err.message?.includes("rate limit") ?? false) ||
                (err.message?.includes("Too Many Requests") ?? false)
            );
        }
        return false;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current queue size for UI feedback.
     */
    get queueSize(): number {
        return this.queue.length;
    }

    /**
     * Clear the queue (use when user cancels or logs out).
     */
    clear(): void {
        this.queue.forEach(req => req.reject(new Error("Request cancelled")));
        this.queue = [];
    }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Wrap an async function with rate limiting.
 */
export function withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    return rateLimiter.execute(fn);
}
