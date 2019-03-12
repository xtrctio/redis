'use strict';

const _ = require('lodash');

/**
 * @class
 */
class Cached {
  /**
   * @param {Redis} redis
   * @param {string} prefix
   * @param {number} ttlSec
   */
  constructor(redis, prefix, ttlSec) {
    if (!_.isObject(redis)) {
      throw new Error('redis must be an object');
    }

    if (!_.isString(prefix) || prefix.length === 0) {
      throw new Error('prefix must be a string with length');
    }

    if (!_.isInteger(ttlSec) || ttlSec <= 0) {
      throw new Error('ttlSec must be an integer gte 0');
    }

    this.cache = {
      prefix,
      ttlSec,
    };

    /**
     * Set value in cache
     * @param {string} key
     * @param {string} value
     * @returns {Promise<void>}
     */
    this.cache.set = async (key, value) => {
      if (!_.isString(key) || key.length === 0) {
        throw new Error('key must be a string with length');
      }

      if (!_.isString(value) || value.length === 0) {
        throw new Error('value must be a string with length');
      }

      await redis.setex(`${this.cache.prefix}${key}`, this.cache.ttlSec, value);
    };

    /**
     * Get value from cache by key
     * @param {string} key
     * @returns {Promise<void>}
     */
    this.cache.get = async (key) => {
      if (!_.isString(key) || key.length === 0) {
        throw new Error('key must be a string with length');
      }

      return redis.get(`${this.cache.prefix}${key}`);
    };

    /**
     * Invalidate any entries for this cache
     * @returns {Promise<*>}
     */
    this.cache.invalidate = async () => new Promise((res, rej) => {
      const stream = redis.scanStream({ match: `${this.cache.prefix}*`, count: 100 });
      stream.on('data', async (resultKeys) => {
        stream.pause();
        await redis.del(...resultKeys);
        stream.resume();
      });

      stream.on('end', () => res());
      stream.on('error', (err) => rej(err));
    });
  }
}

module.exports = Cached;
