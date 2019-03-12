'use strict';

/* eslint-disable no-process-env, no-unused-expressions, require-jsdoc */
require('dotenv').config();
const { expect } = require('chai');

const Redis = require('../index');
const Cached = require('../cached');

describe('cached integration tests', () => {
  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  });

  beforeEach(() => redis.flushdb());

  after(async () => {
    redis && await redis.disconnect();
  });

  it('set and get values in cache', async () => {
    const cached = new Cached(redis, 'something', 10);

    await cached.cache.set('foo', 'bar');
    expect(await cached.cache.get('foo')).to.eql('bar');
  });

  it('honors prefix', async () => {
    const cached = new Cached(redis, 'something', 10);
    const otherCached = new Cached(redis, 'something-else', 10);

    await cached.cache.set('foo', 'bar');
    expect(await otherCached.cache.get('foo')).to.eql(null);
  });

  it('expires', async () => {
    const cached = new Cached(redis, 'something', 1);

    await cached.cache.set('foo', 'bar');
    await new Promise((res) => setTimeout(res, 1400));
    expect(await cached.cache.get('foo')).to.eql(null);
  });

  it('wraps class nicely', async () => {
    class Foo extends Cached {
      constructor() {
        super(redis, 'something', 10);
      }
    }

    const foo = new Foo();

    await foo.cache.set('foo', 'bar');
    expect(await foo.cache.get('foo')).to.eql('bar');
  });
});
