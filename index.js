'use strict';

const IORedis = require('ioredis');

/**
 * @class
 */
class Redis extends IORedis {
  /**
   * @param {object} config
   */
  constructor(config) {
    super(config);

    this.NAME = 'redis';
  }

  /**
   * Wrapper for scanStream that returns a promise
   * @param {*[]} args
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
   * @param {*} results
   * @returns {*}
   */
  static processMultiResults(results) {
    const ERR_INDEX = 0;
    const RESULT_INDEX = 1;

    if (Array.isArray(results) || !results.every(Array.isArray)) {
      throw new Error('results must be an array of arrays');
    }

    return results.map((result) => {
      if (result[ERR_INDEX]) {
        throw new Error(`error during multi: ${result[ERR_INDEX]}`);
      }

      return result[RESULT_INDEX];
    });
  }
}

module.exports = Redis;
