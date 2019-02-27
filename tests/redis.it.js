'use strict';

/* eslint-disable no-process-env, no-unused-expressions */

require('dotenv').config();

const { expect } = require('chai');
const uuid = require('uuid/v4');
const Redis = require('../index');

describe('integration tests', () => {
  let redis = null;

  afterEach(async () => {
    redis && await redis.disconnect();
  });

  it('gets lock', async () => {
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    });

    const lockId = uuid();

    const lock = await redis.lock(lockId, 30);
    expect(lock).not.to.eql(null);

    const otherLock = await redis.lock(lockId, 30);
    expect(otherLock).to.eql(null);

    await lock.unlock();

    const lastLock = await redis.lock(lockId, 30);
    expect(lastLock).not.to.eql(null);
  });
});
