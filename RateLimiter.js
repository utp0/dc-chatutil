const pq = require("p-queue").default;

/**
 * Manages a rate-limiting queue for API requests.
 */
class RateLimiter {
    static queue = undefined;

    /**
     * Creates the rate limiter queue if it doesn't exist.
     *
     * @param {Object} [options={}] Configuration options for p-queue.
     * @param {number} [options.concurrency=40] Concurrency limit.
     * @param {number} [options.intervalCap=40] Max requests per interval.
     * @param {number} [options.interval=1010] Interval in milliseconds.
     * @param {number} [options.timeout=185000] Timeout in milliseconds.
     * @param {boolean} [options.autoStart=true] Whether to auto-start the queue.
     * @param {boolean} [options.carryoverConcurrencyCount=false] Carry over concurrency count.
     * @param {boolean} [options.throwOnTimeout=true] Whether to throw on timeout.
     */
    static createQueue(options = {}) {
        if(this.queue !== undefined) {
            console.warn("Queue already exists, not creating it.");
            return;
        }
        /**
         * @type {pq}
         */
        RateLimiter.queue = new pq({
            concurrency: options.concurrency || 40,  // 50
            intervalCap: options.intervalCap || 40,  
            interval: options.interval || 1010,  // 1000
            timeout: options.timeout || 185000,
            autoStart: options.autoStart ?? true,
            carryoverConcurrencyCount: options.carryoverConcurrencyCount ?? false,
            throwOnTimeout: options.throwOnTimeout ?? true,
        });
    }

    /**
     * Retrieves the rate limiter queue.
     * @returns {PQueue} The p-queue instance.
     */
    static getQueue() {
        return RateLimiter.queue;
    }
}

module.exports = {
    createQueue: RateLimiter.createQueue,
    getQueue: RateLimiter.getQueue,
};
