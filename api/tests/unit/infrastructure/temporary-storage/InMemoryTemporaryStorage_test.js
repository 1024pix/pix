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
});
