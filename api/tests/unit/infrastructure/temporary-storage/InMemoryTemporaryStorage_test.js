const { expect, sinon } = require('../../../test-helper');
const InMemoryTemporaryStorage = require('../../../../lib/infrastructure/temporary-storage/InMemoryTemporaryStorage');

describe('Unit | Infrastructure | temporary-storage | InMemoryTemporaryStorage', function () {
  let inMemoryTemporaryStorage;

  beforeEach(function () {
    inMemoryTemporaryStorage = new InMemoryTemporaryStorage();
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
      // when
      const key = inMemoryTemporaryStorage.save({ value: {}, expirationDelaySeconds: 1000 });

      // then
      expect(key).to.exist;
    });

    it('should return a key from passed key parameter if valid', function () {
      // given
      const keyParameter = 'KEY-PARAMETER';

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

      // when
      const returnedKey = inMemoryTemporaryStorage.save({
        key: keyParameter,
        value: {},
        expirationDelaySeconds: 1000,
      });

      // then
      expect(returnedKey).not.be.equal(keyParameter);
    });

    it('should save key value with a defined ttl in seconds', function () {
      // given
      const TWO_MINUTES_IN_SECONDS = 2 * 60;
      const TWO_MINUTES_IN_MILLISECONDS = 2 * 60 * 1000;

      // when
      const key = inMemoryTemporaryStorage.save({
        value: { name: 'name' },
        expirationDelaySeconds: TWO_MINUTES_IN_SECONDS,
      });

      // then
      const expirationKeyInTimestamp = inMemoryTemporaryStorage._client.getTtl(key);
      expect(expirationKeyInTimestamp).to.equal(TWO_MINUTES_IN_MILLISECONDS);
    });
  });

  describe('#get', function () {
    it('should retrieve the value if it exists', function () {
      // given
      const value = { name: 'name' };
      const expirationDelaySeconds = 1000;

      const key = inMemoryTemporaryStorage.save({ value, expirationDelaySeconds });

      // when
      const result = inMemoryTemporaryStorage.get(key);

      // then
      expect(result).to.deep.equal(value);
    });
  });

  describe('#update', function () {
    it('should set a new value', function () {
      // given
      const key = inMemoryTemporaryStorage.save({
        value: { name: 'name' },
      });

      // when
      inMemoryTemporaryStorage.update(key, { url: 'url' });

      // then
      const result = inMemoryTemporaryStorage.get(key);
      expect(result).to.deep.equal({ url: 'url' });
    });

    it('should not change the time to live', function () {
      // given
      const keyWithTtl = inMemoryTemporaryStorage.save({
        value: {},
        expirationDelaySeconds: 1000,
      });
      const initialTtl = inMemoryTemporaryStorage._client.getTtl(keyWithTtl);
      const keyWithoutTtl = inMemoryTemporaryStorage.save({ value: {} });

      // when
      inMemoryTemporaryStorage.update(keyWithTtl, {});
      inMemoryTemporaryStorage.update(keyWithoutTtl, {});

      // then
      expect(inMemoryTemporaryStorage._client.getTtl(keyWithTtl)).to.equal(initialTtl);
      expect(inMemoryTemporaryStorage._client.getTtl(keyWithoutTtl)).to.equal(0);
    });
  });

  describe('#delete', function () {
    it('should delete the value if it exists', function () {
      // given
      const value = { name: 'name' };
      const expirationDelaySeconds = 1000;

      const key = inMemoryTemporaryStorage.save({ value, expirationDelaySeconds });

      // when
      inMemoryTemporaryStorage.delete(key);

      // then
      const savedKey = inMemoryTemporaryStorage.get(key);
      expect(savedKey).to.be.undefined;
    });
  });

  describe('#deleteByPrefix', function () {
    it('should delete all found keys with the given matching prefix', function () {
      // given
      const expirationDelaySeconds = 1000;

      inMemoryTemporaryStorage.save({ key: '456:c', value: {}, expirationDelaySeconds });
      inMemoryTemporaryStorage.save({ key: '123:a', value: {}, expirationDelaySeconds });
      inMemoryTemporaryStorage.save({ key: '123:b', value: {}, expirationDelaySeconds });

      // when
      inMemoryTemporaryStorage.deleteByPrefix('123:');

      // then
      expect(inMemoryTemporaryStorage.get('123:a')).to.be.undefined;
      expect(inMemoryTemporaryStorage.get('123:b')).to.be.undefined;
      expect(inMemoryTemporaryStorage.get('456:c')).to.exist;
    });
  });
});
