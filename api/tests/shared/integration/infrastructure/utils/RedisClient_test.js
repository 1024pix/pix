import { randomUUID } from 'node:crypto';

import Redis from 'ioredis';
import Redlock from 'redlock';

import { config } from '../../../../../src/shared/config.js';
import { RedisClient } from '../../../../../src/shared/infrastructure/utils/RedisClient.js';
import { catchErr, expect } from '../../../../test-helper.js';

describe('Integration | Infrastructure | Utils | RedisClient', function () {
  beforeEach(async function () {
    const redisClient = new RedisClient(config.redis.url);
    await redisClient.flushall();
  });

  it('stores and retrieve a value for a key', async function () {
    // given
    const key = new Date().toISOString();
    const redisClient = new RedisClient(config.redis.url);

    // when
    await redisClient.set(key, 'value');
    const value = await redisClient.get(key);

    // then
    expect(value).to.equal('value');
    await redisClient.del(key);
  });

  it('should delete a value with prefix', async function () {
    // given
    const value = new Date().toISOString();
    const redisClientWithPrefix = new RedisClient(config.redis.url, { prefix: 'client-prefix:' });
    await redisClientWithPrefix.set('AVRIL', value);

    // when
    await redisClientWithPrefix.del('AVRIL');

    // then
    expect(await redisClientWithPrefix.get('AVRIL')).to.be.null;
  });

  it('should separate storage for identical keys saved with different prefixes', async function () {
    // given
    const redisClient1 = new RedisClient(config.redis.url, { prefix: 'test1' });
    const redisClient2 = new RedisClient(config.redis.url, { prefix: 'test2' });
    await redisClient1.set('key', 'value1');
    await redisClient2.set('key', 'value2');

    // when / then
    expect(await redisClient1.get('key')).to.equal('value1');
    expect(await redisClient2.get('key')).to.equal('value2');
    await redisClient1.del('key');
    await redisClient2.del('key');
  });

  it('should allow to handle a list of values for a key', async function () {
    // given
    const keyToAdd = randomUUID();
    const keyToRemove = randomUUID();
    const redisClient = new RedisClient(config.redis.url);

    await redisClient.lpush(keyToAdd, 'value2');

    await redisClient.lpush(keyToRemove, 'value1');
    await redisClient.lpush(keyToRemove, 'value2');

    // when
    const keyToAddLength1 = await redisClient.lpush(keyToAdd, 'value1');
    const keyToAddLength2 = await redisClient.rpush(keyToAdd, 'value3');
    const keyToAddList = await redisClient.lrange(keyToAdd, 0, -1);

    const valuesRemovedLength = await redisClient.lrem(keyToRemove, 0, 'value1');
    const keyToRemoveList = await redisClient.lrange(keyToRemove, 0, -1);

    // then
    expect(keyToAddLength1).to.equal(2);
    expect(keyToAddLength2).to.equal(3);
    expect(keyToAddList).to.deep.equal(['value1', 'value2', 'value3']);

    expect(valuesRemovedLength).to.equal(1);
    expect(keyToRemoveList).to.deep.equal(['value2']);

    await redisClient.del(keyToAdd);
    await redisClient.del(keyToRemove);
  });

  it('should flush all values', async function () {
    // given
    const client = new RedisClient(config.redis.url);
    await client.set('toto', 'tata');

    // when
    await client.flushall();

    // then
    expect(await client.get('toto')).to.equal(null);
  });

  it('should ping redis', async function () {
    // given
    const client = new RedisClient(config.redis.url);

    // when
    const result = await client.ping();

    // then
    expect(result).to.equal('PONG');
  });

  describe('lock', function () {
    it('locks a key', async function () {
      // given
      const client = new RedisClient(config.redis.url);
      const otherClient = new Redis(config.redis.url);

      // when
      await client.lock('locks:toto', 10000);

      // then
      const count = await otherClient.exists('locks:toto');
      expect(count).to.equal(1);
    });

    it('unlocks a key', async function () {
      // given
      const client = new RedisClient(config.redis.url);
      const otherClient = new Redis(config.redis.url);
      const lock = await client.lock('locks:toto', 10000);

      // when
      await lock.unlock();

      // then
      const count = await otherClient.exists('locks:toto');
      expect(count).to.equal(0);
    });

    it('throws a LockError when locking a locked resource', async function () {
      // given
      const client = new RedisClient(config.redis.url);
      await client.lock('locks:toto', 10000);

      // when
      const error = await catchErr(client.lock)('locks:toto', 10000);

      // then
      expect(error).to.be.instanceOf(Redlock.LockError);
    });
  });

  describe('quit', function () {
    it('should close the connection', async function () {
      // given
      const client = new RedisClient(config.redis.url);

      // when
      await client.quit();

      // then
      expect(client._client.status).to.equal('end');
    });

    context('when the connection is already closed', function () {
      it('should not throw an error', async function () {
        // given
        const client = new RedisClient(config.redis.url);

        // when
        await client.quit();
        await client.quit();

        // then
        expect(client._client.status).to.equal('end');
      });
    });
  });
});
