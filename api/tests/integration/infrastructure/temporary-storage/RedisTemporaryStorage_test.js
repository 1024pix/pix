import { randomUUID } from 'node:crypto';

import { config as settings } from '../../../../lib/config.js';
import { RedisTemporaryStorage } from '../../../../lib/infrastructure/temporary-storage/RedisTemporaryStorage.js';
import { expect } from '../../../test-helper.js';

const REDIS_URL = settings.redis.url;

describe('Integration | Infrastructure | TemporaryStorage | RedisTemporaryStorage', function () {
  // this check is used to prevent failure when redis is not setup

  if (REDIS_URL !== undefined) {
    describe('#set', function () {
      it('should set new value', async function () {
        // given
        const TWO_MINUTES_IN_SECONDS = 2 * 60;
        const value = { url: 'url' };
        const storage = new RedisTemporaryStorage(REDIS_URL);
        const key = await storage.save({ value: 'c', expirationDelaySeconds: TWO_MINUTES_IN_SECONDS });

        // when
        await storage.update(key, value);

        // then
        const result = await storage.get(key);
        const expirationDelaySeconds = await storage._client.ttl(key);
        expect(result).to.deep.equal({ url: 'url' });
        expect(expirationDelaySeconds).to.equal(TWO_MINUTES_IN_SECONDS);
      });
    });

    describe('#expire', function () {
      it('should add an expiration time to the list', async function () {
        // given
        const key = randomUUID();
        const storage = new RedisTemporaryStorage(REDIS_URL);

        // when
        await storage.lpush(key, 'value');
        const result = await storage.expire({ key, expirationDelaySeconds: 1 });
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const list = await storage.lrange(key);

        // then
        expect(result).to.equal(1);
        expect(list).to.be.empty;
      });
    });

    describe('#ttl', function () {
      it('should retrieve the remaining expiration time from a list', async function () {
        // given
        const key = randomUUID();
        const storage = new RedisTemporaryStorage(REDIS_URL);

        // when
        await storage.lpush(key, 'value');
        await storage.expire({ key, expirationDelaySeconds: 120 });
        const remainingExpirationSeconds = await storage.ttl(key);

        // then
        expect(remainingExpirationSeconds).to.equal(120);
      });
    });

    describe('#lpush', function () {
      it('should add a value to a list and return the length of the list', async function () {
        // given
        const key = randomUUID();
        const storage = new RedisTemporaryStorage(REDIS_URL);

        // when
        const length = await storage.lpush(key, 'value');

        // then
        expect(length).to.equal(1);
        await storage.delete(key);
      });
    });

    describe('#lrem', function () {
      it('should remove a value from a list and return the number of removed elements', async function () {
        // given
        const key = randomUUID();
        const storage = new RedisTemporaryStorage(REDIS_URL);

        await storage.lpush(key, 'value1');
        await storage.lpush(key, 'value1');
        await storage.lpush(key, 'value2');

        // when
        const length = await storage.lrem(key, 'value1');

        // then
        expect(length).to.equal(2);
        await storage.delete(key);
      });
    });

    describe('#lrange', function () {
      it('should return a list of values', async function () {
        // given
        const key = randomUUID();
        const storage = new RedisTemporaryStorage(REDIS_URL);

        // when
        await storage.lpush(key, 'value1');
        await storage.lpush(key, 'value1');
        const length = await storage.lpush(key, 'value2');
        const values = await storage.lrange(key);

        // then
        expect(length).to.equal(3);
        expect(values).to.deep.equal(['value2', 'value1', 'value1']);
        await storage.delete(key);
      });
    });

    describe('#keys', function () {
      it('should return matching keys', async function () {
        // given
        const oneMinute = 60;
        const pattern = 'prefix:*';
        const storage = new RedisTemporaryStorage(REDIS_URL);
        await storage.save({ key: 'prefix:key1', value: true, expirationDelaySeconds: oneMinute });
        await storage.save({ key: 'prefix:key2', value: true, expirationDelaySeconds: oneMinute });
        await storage.save({ key: 'prefix:key3', value: true, expirationDelaySeconds: oneMinute });
        await storage.save({ key: 'otherprefix:key4', value: true, expirationDelaySeconds: oneMinute });

        // when
        const keys = await storage.keys(pattern);

        // then
        expect(keys).to.exactlyContain(['prefix:key1', 'prefix:key2', 'prefix:key3']);

        await storage.delete('prefix:key1');
        await storage.delete('prefix:key2');
        await storage.delete('prefix:key3');
        await storage.delete('otherprefix:key4');
      });
    });
  }
});
