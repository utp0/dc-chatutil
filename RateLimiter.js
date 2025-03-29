const pq = require("p-queue").default;

class RateLimiter {
    static queue = undefined;
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

    static getQueue() {
        return RateLimiter.queue;
    }
}

module.exports = {
    createQueue: RateLimiter.createQueue,
    getQueue: RateLimiter.getQueue,
};
