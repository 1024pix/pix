const NodeCache = require('node-cache');
const { expect, sinon } = require('../../../test-helper');
const InMemoryTemporaryStorage = require('../../../../lib/infrastructure/temporary-storage/InMemoryTemporaryStorage');

describe('Unit | Infrastructure | temporary-storage | InMemoryTemporaryStorage', function () {
  describe('#constructor', function () {
    it('should create an InMemoryTemporaryStorage instance', function () {
      // when
      const inMemoryTemporaryStorage = new InMemoryTemporaryStorage();

      // then
      expect(inMemoryTemporaryStorage._client).to.be.an.instanceOf(NodeCache);
    });
  });

  describe('#save', function () {
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers();
    });

    afterEach(function () {
      clock.restore();
    });

    it('should resolve with the generated key', function () {
      // given
      const inMemoryTemporaryStorage = new InMemoryTemporaryStorage();

      // when
      const key = inMemoryTemporaryStorage.save({ value: {}, expirationDelaySeconds: 1000 });

      // then
      expect(key).to.exist;
    });

    it('should return a key from passed key parameter if valid', function () {
      // given
      const keyParameter = 'KEY-PARAMETER';
      const inMemoryTemporaryStorage = new InMemoryTemporaryStorage();

      // when
      const returnedKey = inMemoryTemporaryStorage.save({
        key: keyParameter,
        value: {},
        expirationDelaySeconds: 1000,
      });

      // then
      expect(returnedKey).to.be.equal(keyParameter);
    });

    it('should return a generated key if key parameter is not valid', function () {
      // given
      const keyParameter = '  ';
      const inMemoryTemporaryStorage = new InMemoryTemporaryStorage();

      // when
      const returnedKey = inMemoryTemporaryStorage.save({
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

      const inMemoryTemporaryStorage = new InMemoryTemporaryStorage();

      // when
      const key = await inMemoryTemporaryStorage.save({
        value: { name: 'name' },
        expirationDelaySeconds: TWO_MINUTES_IN_SECONDS,
      });

      // then
      const expirationKeyInTimestamp = inMemoryTemporaryStorage._client.getTtl(key);
      expect(expirationKeyInTimestamp).to.equal(TWO_MINUTES_IN_MILLISECONDS);
    });
  });

  describe('#get', function () {
    it('should retrieve the value if it exists', async function () {
      // given
      const value = { name: 'name' };
      const expirationDelaySeconds = 1000;

      const inMemoryTemporaryStorage = new InMemoryTemporaryStorage();
      const key = await inMemoryTemporaryStorage.save({ value, expirationDelaySeconds });

      // when
      const result = await inMemoryTemporaryStorage.get(key);

      // then
      expect(result).to.deep.equal(value);
    });
  });

  describe('#update', function () {
    it('should set a new value', function () {
      // given
      const inMemoryTemporaryStorage = new InMemoryTemporaryStorage();
      const key = inMemoryTemporaryStorage.save({
        value: { name: 'name' },
        expirationDelaySeconds: 1000,
      });

      // when
      inMemoryTemporaryStorage.update(key, { url: 'url' });

      // then
      const result = inMemoryTemporaryStorage.get(key);
      expect(result).to.deep.equal({ url: 'url' });
    });
  });

  describe('#delete', function () {
    it('should delete the value if it exists', async function () {
      // given
      const value = { name: 'name' };
      const expirationDelaySeconds = 1000;

      const inMemoryTemporaryStorage = new InMemoryTemporaryStorage();
      const key = await inMemoryTemporaryStorage.save({ value, expirationDelaySeconds });

      // when
      await inMemoryTemporaryStorage.delete(key);

      // then
      const savedKey = await inMemoryTemporaryStorage.get(key);
      expect(savedKey).to.be.undefined;
    });
  });

  describe('#deleteByPrefix', function () {
    it('should delete all found keys with the given matching prefix', async function () {
      // given
      const expirationDelaySeconds = 1000;

      const inMemoryTemporaryStorage = new InMemoryTemporaryStorage();
      await inMemoryTemporaryStorage.save({ key: '456:c', value: {}, expirationDelaySeconds });
      await inMemoryTemporaryStorage.save({ key: '123:a', value: {}, expirationDelaySeconds });
      await inMemoryTemporaryStorage.save({ key: '123:b', value: {}, expirationDelaySeconds });

      // when
      await inMemoryTemporaryStorage.deleteByPrefix('123:');

      // then
      expect(await inMemoryTemporaryStorage.get('123:a')).to.be.undefined;
      expect(await inMemoryTemporaryStorage.get('123:b')).to.be.undefined;
      expect(await inMemoryTemporaryStorage.get('456:c')).to.exist;
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
