const { expect, sinon } = require('../../../test-helper');
const RedisTemporaryStorage = require('../../../../lib/infrastructure/temporary-storage/RedisTemporaryStorage');

describe('Unit | Infrastructure | temporary-storage | RedisTemporaryStorage', function () {
  const REDIS_URL = 'redis_url';

  let clientStub;

  beforeEach(function () {
    clientStub = {
      get: sinon.stub(),
      set: sinon.stub(),
      del: sinon.stub(),
    };

    sinon.stub(RedisTemporaryStorage, 'createClient').withArgs(REDIS_URL).returns(clientStub);
  });

  describe('#constructor', function () {
    it('should call static method createClient', function () {
      // when
      const redisTemporaryStorage = new RedisTemporaryStorage(REDIS_URL);

      // then
      expect(RedisTemporaryStorage.createClient).to.have.been.called;
      expect(redisTemporaryStorage._client).to.exist;
    });
  });

  describe('#save', function () {
    it('should generated key if key parameter is not valid', async function () {
      // given
      const keyParameter = '  ';
      const value = { name: 'name' };
      const expirationDelaySeconds = 1000;
      sinon.spy(RedisTemporaryStorage, 'generateKey');

      const redisTemporaryStorage = new RedisTemporaryStorage(REDIS_URL);

      // when
      await redisTemporaryStorage.save({
        key: keyParameter,
        value,
        expirationDelaySeconds,
      });

      // then
      expect(RedisTemporaryStorage.generateKey).to.have.been.called;
    });

    it('should use passed key parameter if valid', async function () {
      // given
      const keyParameter = 'KEY-PARAMETER';
      const value = { name: 'name' };
      const expirationDelaySeconds = 1000;
      sinon.spy(RedisTemporaryStorage, 'generateKey');

      const redisTemporaryStorage = new RedisTemporaryStorage(REDIS_URL);

      // when
      await redisTemporaryStorage.save({
        key: keyParameter,
        value,
        expirationDelaySeconds,
      });

      // then
      expect(RedisTemporaryStorage.generateKey).not.have.been.called;
    });

    it('should call client set with value and EX parameters', async function () {
      // given
      const EXPIRATION_PARAMETER = 'ex';
      const value = { name: 'name' };
      const expirationDelaySeconds = 1000;
      clientStub.set.resolves();
      const redisTemporaryStorage = new RedisTemporaryStorage(REDIS_URL);

      // when
      await redisTemporaryStorage.save({ value, expirationDelaySeconds });

      // then
      expect(clientStub.set).to.have.been.calledWith(
        sinon.match.any,
        JSON.stringify(value),
        EXPIRATION_PARAMETER,
        expirationDelaySeconds
      );
    });
  });

  describe('#get', function () {
    it('should call client set and retrieve value', async function () {
      // given
      const key = 'valueKey';
      const value = { name: 'name' };
      clientStub.get.withArgs(key).resolves(JSON.stringify(value));
      const redisTemporaryStorage = new RedisTemporaryStorage(REDIS_URL);

      // when
      const result = await redisTemporaryStorage.get(key);

      // then
      expect(clientStub.get).to.have.been.called;
      expect(result).to.deep.equal(value);
    });
  });

  describe('#delete', function () {
    it('should call client set and delete value', async function () {
      // given
      const key = 'valueKey';
      clientStub.del.withArgs(key).resolves();
      const redisTemporaryStorage = new RedisTemporaryStorage(REDIS_URL);

      // when
      await redisTemporaryStorage.delete(key);

      // then
      expect(clientStub.del).to.have.been.called;
    });
  });
});
