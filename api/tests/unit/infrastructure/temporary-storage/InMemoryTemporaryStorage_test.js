import { InMemoryTemporaryStorage } from '../../../../lib/infrastructure/temporary-storage/InMemoryTemporaryStorage.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | Infrastructure | temporary-storage | InMemoryTemporaryStorage', function () {
  let inMemoryTemporaryStorage;

  beforeEach(function () {
    inMemoryTemporaryStorage = new InMemoryTemporaryStorage();
  });

  describe('#save', function () {
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers({ toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('should resolve with the generated key', async function () {
      // when
      const key = await inMemoryTemporaryStorage.save({ value: {}, expirationDelaySeconds: 1000 });

      // then
      expect(key).to.be.a.string;
    });

    it('should return a key from passed key parameter if valid', async function () {
      // given
      const keyParameter = 'KEY-PARAMETER';

      // when
      const returnedKey = await inMemoryTemporaryStorage.save({
        key: keyParameter,
        value: {},
        expirationDelaySeconds: 1000,
      });

      // then
      expect(returnedKey).to.be.equal(keyParameter);
    });

    it('should return a generated key if key parameter is not valid', async function () {
      // given
      const keyParameter = '  ';

      // when
      const returnedKey = await inMemoryTemporaryStorage.save({
        key: keyParameter,
        value: {},
        expirationDelaySeconds: 1000,
      });

      // then
      expect(returnedKey).not.be.equal(keyParameter);
    });

    it('should save key value with a defined ttl in seconds', async function () {
      // given
      const TWO_MINUTES_IN_SECONDS = 2 * 60;
      const TWO_MINUTES_IN_MILLISECONDS = 2 * 60 * 1000;

      // when
      const key = await inMemoryTemporaryStorage.save({
        value: { name: 'name' },
        expirationDelaySeconds: TWO_MINUTES_IN_SECONDS,
      });

      // then
      const expirationKeyInTimestamp = await inMemoryTemporaryStorage._client.getTtl(key);
      expect(expirationKeyInTimestamp).to.equal(TWO_MINUTES_IN_MILLISECONDS);
    });
  });

  describe('#get', function () {
    it('should retrieve the value if it exists', async function () {
      // given
      const value = { name: 'name' };
      const expirationDelaySeconds = 1000;

      const key = await inMemoryTemporaryStorage.save({ value, expirationDelaySeconds });

      // when
      const result = await inMemoryTemporaryStorage.get(key);

      // then
      expect(result).to.deep.equal(value);
    });
  });

  describe('#update', function () {
    it('should set a new value', async function () {
      // given
      const key = await inMemoryTemporaryStorage.save({
        value: { name: 'name' },
      });

      // when
      await inMemoryTemporaryStorage.update(key, { url: 'url' });

      // then
      const result = await inMemoryTemporaryStorage.get(key);
      expect(result).to.deep.equal({ url: 'url' });
    });

    it('should not change the time to live', async function () {
      // given
      const keyWithTtl = await inMemoryTemporaryStorage.save({
        value: {},
        expirationDelaySeconds: 1,
      });
      const keyWithoutTtl = await inMemoryTemporaryStorage.save({ value: {} });

      // when
      await new Promise((resolve) => setTimeout(resolve, 500));
      await inMemoryTemporaryStorage.update(keyWithTtl, {});
      await inMemoryTemporaryStorage.update(keyWithoutTtl, {});
      await new Promise((resolve) => setTimeout(resolve, 600));

      // then
      expect(await inMemoryTemporaryStorage.get(keyWithTtl)).to.be.undefined;
      expect(await inMemoryTemporaryStorage.get(keyWithoutTtl)).not.to.be.undefined;
    });
  });

  describe('#delete', function () {
    it('should delete the value if it exists', async function () {
      // given
      const value = { name: 'name' };
      const expirationDelaySeconds = 1000;

      const key = await inMemoryTemporaryStorage.save({ value, expirationDelaySeconds });

      // when
      await inMemoryTemporaryStorage.delete(key);

      // then
      const savedKey = await inMemoryTemporaryStorage.get(key);
      expect(savedKey).to.be.undefined;
    });
  });

  describe('#expire', function () {
    it('should add an expiration time to the list', async function () {
      // given
      const inMemoryTemporaryStorage = new InMemoryTemporaryStorage();

      // when
      const key = 'key:lpush';
      await inMemoryTemporaryStorage.lpush(key, 'value');
      await inMemoryTemporaryStorage.expire({ key, expirationDelaySeconds: 1 });
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const list = inMemoryTemporaryStorage.lrange(key);

      // then
      expect(list).to.be.empty;
    });
  });

  describe('#ttl', function () {
    it('should retrieve the remaining expiration time from a list', async function () {
      // given
      const inMemoryTemporaryStorage = new InMemoryTemporaryStorage();

      // when
      const key = 'key:lpush';
      await inMemoryTemporaryStorage.lpush(key, 'value');
      await inMemoryTemporaryStorage.expire({ key, expirationDelaySeconds: 120 });
      const remainingExpirationSeconds = await inMemoryTemporaryStorage.ttl(key);

      // then
      expect(remainingExpirationSeconds).to.be.above(Date.now());
    });
  });

  describe('#lpush', function () {
    it('should add value into key list', async function () {
      // given
      const inMemoryTemporaryStorage = new InMemoryTemporaryStorage();

      // when
      const length = await inMemoryTemporaryStorage.lpush('key:lpush', 'value');

      // then
      expect(length).to.equal(1);
    });
  });

  describe('#lrem', function () {
    it('should remove values into key list', async function () {
      // given
      const inMemoryTemporaryStorage = new InMemoryTemporaryStorage();

      // when
      const key = 'key:lrem';
      await inMemoryTemporaryStorage.lpush(key, 'value1');
      await inMemoryTemporaryStorage.lpush(key, 'value2');
      await inMemoryTemporaryStorage.lpush(key, 'value1');

      const length = await inMemoryTemporaryStorage.lrem(key, 'value1');

      // then
      expect(length).to.equal(2);
    });
  });

  describe('#lrange', function () {
    it('should return key values list', async function () {
      // given
      const inMemoryTemporaryStorage = new InMemoryTemporaryStorage();

      // when
      const key = 'key:lrange';
      await inMemoryTemporaryStorage.lpush(key, 'value1');
      await inMemoryTemporaryStorage.lpush(key, 'value2');
      await inMemoryTemporaryStorage.lpush(key, 'value3');

      const values = await inMemoryTemporaryStorage.lrange(key);

      // then
      expect(values.length).to.equal(3);
      expect(values).to.deep.equal(['value3', 'value2', 'value1']);
    });
  });
});
