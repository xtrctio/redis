'use strict';

const IORedis = require('ioredis');
const Redlock = require('redlock');
const Promise = require('bluebird');
const Cached = require('./cached');

IORedis.Promise = Promise;

/**
 * @class
 */
class Redis extends IORedis {
  /**
   * @param {object} config ioredis config
   */
  constructor(config) {
    super(config);

    this.NAME = 'redis';
    this.redlock = this.createRedlock();

    this.__debounced = {};
  }

  /**
   * Acquire lock in Redis
   * @param {string} key
   * @param {number} ttl
   * @returns {Promise<Lock|null>}
   */
  async lock(key, ttl) {
    return this.redlock.lock(key, ttl).catch((err) => {
      if (err && err.message && err.message.includes('attempts to lock the resource')) {
        return null;
      }

      throw err;
    });
  }

  /**
   * Get redlock instance
   * @link https://www.npmjs.com/package/redlock
   * @param {object} [config={ retryCount: 5 }]
   * @returns {Redlock}
   */
  createRedlock(config = { retryCount: 0 }) {
    const self = this;
    return new Redlock([self], config);
  }

  /**
   * Wrapper for scanStream that returns a promise
   * @param {*} args
   * @returns {Promise<*>}
   */
  async scanPromise(...args) {
    return new Promise((res, rej) => {
      const stream = this.scanStream(...args);
      const keys = [];

      stream.on('data', (resultKeys) => {
        for (let i = 0; i < resultKeys.length; i++) {
          keys.push(resultKeys[i]);
        }
      });

      stream.on('error', (err) => rej(err));
      stream.on('end', () => res(keys));
    });
  }

  /**
   * Process the returned array from a transaction, throwing errors if any exist
   * @param {object[]} results
   * @returns {object[]}
   */
  static processMultiResults(results) {
    const ERR_INDEX = 0;
    const RESULT_INDEX = 1;

    if (!Array.isArray(results) || !results.every(Array.isArray)) {
      throw new Error('results must be an array of arrays');
    }

    return results.map((result) => {
      if (result[ERR_INDEX]) {
        throw new Error(`error during multi: ${result[ERR_INDEX]}`);
      }

      return result[RESULT_INDEX];
    });
  }

  /**
   * Debounce a callback using Redis and setTimeout locally
   * @param {Function} callback
   * @param {string} key
   * @param {number} timeoutMs
   * @param {number} [skewMs=5]
   * @returns {Promise<void>}
   */
  async debounce(callback, key, timeoutMs, skewMs = 5) {
    const self = this;

    if (this.__debounced[key]) {
      clearTimeout(this.__debounced[key]);
      delete this.__debounced[key];
    }

    const transaction = self.multi()
      .pttl(key)
      .set(key, 'true', 'NX', 'PX', timeoutMs);

    const result = Redis.processMultiResults(await transaction.exec());
    const retryMs = result[0] < 0 ? timeoutMs : Math.max(result[0] + skewMs, timeoutMs);

    if (!result[1]) {
      this.__debounced[key] = setTimeout(async () => {
        if (await self.set(key, 'true', 'NX', 'PX', timeoutMs)) {
          return callback();
        }
        return null;
      }, retryMs);
      return null;
    }

    return callback();
  }
}

Redis.Cached = Cached;
module.exports = Redis;
