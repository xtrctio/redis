'use strict';

const IORedis = require('ioredis');
const Redlock = require('redlock');
const Promise = require('bluebird');
const _ = require('lodash');
const Cached = require('./cached');

IORedis.Promise = Promise;

const CONSTANTS = {
  SEARCH_FIELD_TYPES: {
    TAG: 'tag',
    TEXT: 'text',
    NUMERIC: 'numeric',
    GEO: 'geo',
  },
};

CONSTANTS.SEARCH_FIELD_TYPE_VALUES = Object.values(CONSTANTS.SEARCH_FIELD_TYPES);

/**
 * @class
 */
class Redis extends IORedis {
  // eslint-disable-next-line
  constructor(...args) {
    super(...args);

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
      if (
        err
        && err.message
        && err.message.includes('attempts to lock the resource')
      ) {
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

    const transaction = self
      .multi()
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

  /**
   * Get size of search index
   * @param {string} index
   * @return {Promise<null|*>}
   */
  async indexSize(index) {
    if (!index) throw new Error('index name must be provided');

    try {
      const result = await this.call('FT.INFO', index);
      if (Array.isArray(result) && result.length > 0) return result[5];
    } catch (err) {
      if (err.message === 'Unknown Index name') return null;
      throw err;
    }

    return null;
  }

  /**
   * Check if search index exists
   * @param {string} index
   * @return {Promise<boolean>}
   */
  async indexExists(index) {
    return !!(await this.indexSize(index));
  }

  /**
   * @param {object} schema
   * @return {Array}
   * @private
   */
  static _processSchema(schema) {
    if (!_.isPlainObject(schema)) throw new Error('schema must be an object');

    return Object.keys(schema).reduce((result, key) => {
      const fieldOptions = schema[key];

      result.push(key);

      if (!fieldOptions.type || !CONSTANTS.SEARCH_FIELD_TYPE_VALUES.includes(fieldOptions.type)) {
        throw new Error(`type must be one of: ${CONSTANTS.SEARCH_FIELD_TYPE_VALUES.join(', ')}`);
      }

      result.push(fieldOptions.type.toUpperCase());

      if (fieldOptions.sortable) result.push('SORTABLE');
      if (fieldOptions.noStem) result.push('NOSTEM');

      return result;
    }, ['SCHEMA']);
  }

  /**
   * Create a search index
   * @param {string} index
   * @param {object} schema
   * @param {object} [options={
    ttl: false,
    highlighting: true,
    noStopwords: false,
  }]
   * @return {Promise<void>}
   */
  async createIndex(
    index,
    schema,
    options = {},
  ) {
    if (!index) throw new Error('index name must be provided');
    if (!schema) throw new Error('schema must be provided');

    options = _.defaultsDeep({}, options, {
      ttl: false,
      highlighting: true,
      noStopwords: false,
    });

    let args = [index];

    if (options.ttl) {
      args.push('TEMPORARY');
      args.push(options.ttl);
    }

    if (options.highlighting === false) {
      args.push('NOHL');
    }

    if (options.noStopwords === true) {
      args.push('STORWORDS');
      args.push('0');
    }

    if (schema) {
      args = args.concat(Redis._processSchema(schema));
    }

    await this.call('FT.CREATE', ...args);
  }

  /**
   * Add document to index
   * @param {string} index
   * @param {string} id
   * @param {object} document
   * @param {object} [options= { replace: true, noSave: false }]
   * @return {Promise<*>}
   */
  async addToIndex(
    index,
    id,
    document,
    options = {},
  ) {
    if (!index) throw new Error('index name must be provided');
    if (!id) throw new Error('id must be provided');
    if (!document || typeof document !== 'object') throw new Error('document must be an object');

    options = _.defaultsDeep({}, options, { replace: true, noSave: false });
    let args = [index, id, 1];

    if (options.noSave) {
      args.push('NOSAVE');
    }

    if (options.replace) {
      args.push('REPLACE');
    }

    args.push('FIELDS');

    args = Object.keys(document).reduce((_args, key) => {
      if (!document[key]) return _args;
      if (typeof document[key] === 'object') throw new Error('document properties cannot be objects');

      _args.push(key);
      _args.push(document[key]);
      return _args;
    }, args);

    return this.call('FT.ADD', ...args);
  }

  /**
   * Convert pairs in array into object
   * @param {*[]} array
   * @returns {object}
   * @private
   */
  static _pairsToObject(array) {
    if (!Array.isArray(array)) throw new Error(`must be array: ${array}`);

    const result = {};
    for (let i = 0; i < array.length; i += 2) {
      result[array[i]] = array[i + 1];
    }

    return result;
  }

  /**
   * Search index using query
   * @param {string} index
   * @param {string} query
   * @param {object} [options={ idOnly: false, sortBy: null, sortDirection: 'ASC', limit: 100, page: 0 }]
   * @return {Promise<{total: *, ids: *, page: *}>}
   */
  async search(index, query, options = {}) {
    if (!index) throw new Error('index name must be provided');
    if (!query) throw new Error('query must be provided');

    options = _.defaultsDeep({}, options, {
      idOnly: false, sortBy: null, sortDirection: 'ASC', limit: 100, page: 0,
    });

    let args = [index, query];

    if (options.idOnly) args.push('NOCONTENT');
    if (options.sortBy) args = args.concat(['SORTBY', options.sortBy, options.sortDirection]);
    if (options.limit) args = args.concat(['LIMIT', options.page, options.limit]);

    const results = await this.call('FT.SEARCH', ...args);
    let processedResults;

    if (options.idOnly) {
      processedResults = results.slice(1, results.length);
    } else {
      const documentsById = Redis._pairsToObject(results.slice(1, results.length));
      processedResults = _.reduce(documentsById, (_results, documentArray, id) => {
        _results.push({
          id,
          ...Redis._pairsToObject(documentArray),
        });
        return _results;
      }, []);
    }

    return {
      total: results[0],
      page: options.page,
      results: processedResults,
    };
  }

  /**
   * Remove document from index
   * @param {string} index
   * @param {string} id
   * @return {Promise<*>}
   */
  async removeFromIndex(index, id) {
    if (!index) throw new Error('index name must be provided');
    if (!id) throw new Error('id must be provided');

    return this.call('FT.DEL', index, id, 'DD');
  }

  /**
   * Delete index
   * @param {string} index
   * @return {Promise<void>}
   */
  async deleteIndex(index) {
    if (!index) throw new Error('index name must be provided');
    await this.call('FT.DROP', index);
  }
}

Redis.Cached = Cached;
module.exports = Redis;
