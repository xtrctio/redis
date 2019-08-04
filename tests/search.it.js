'use strict';

/* eslint-disable no-process-env, no-unused-expressions */
const { expect } = require('chai');

require('dotenv').config();
const Redis = require('../index');

describe('search integration tests', () => {
  let redis = null;

  afterEach(async () => {
    await redis.flushdb();
    redis && (await redis.disconnect());
  });

  it('creates index', async () => {
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    });

    expect(await redis.indexExists('some-index')).to.eql(false);
    await redis.createIndex('some-index', { thing: { type: 'text' } });
    expect(await redis.indexExists('some-index')).to.eql(true);
  });

  it('adds document to index', async () => {
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    });

    await redis.createIndex('some-index', { thing: { type: 'text' } });
    await redis.addToIndex('some-index', '123', { thing: 'something good', other: 'this will be dropped' });
    await redis.addToIndex('some-index', '124', { thing: 'something else', other: 'this will be dropped' });

    let results = await redis.search('some-index', 'something', { limit: 1 });

    expect(results).to.eql({
      total: 2,
      page: 0,
      ids: [
        '124',
      ],
    });

    results = await redis.search('some-index', 'dropped', { limit: 1 });

    expect(results).to.eql({
      total: 0,
      page: 0,
      ids: [],
    });
  });
});
