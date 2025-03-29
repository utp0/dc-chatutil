const pq = require("p-queue");

class RateLimiter {
    constructor(options = {}) {
        /**
         * @type {pq.default}
         */
        this.queue = new pq.default({
            concurrency: options.concurrency || 40,  // 50
            intervalCap: options.intervalCap || 40,  
            interval: options.interval || 1010,  // 1000
            timeout: options.timeout || 185000,
            autoStart: options.autoStart ?? true,
            carryoverConcurrencyCount: options.carryoverConcurrencyCount ?? false,
            throwOnTimeout: options.throwOnTimeout ?? true,
        });
    }
}

module.exports = RateLimiter;
