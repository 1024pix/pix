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
      lpush: sinon.stub(),
      lrem: sinon.stub(),
      lrange: sinon.stub(),
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
    it('should call client get to retrieve value', async function () {
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

  describe('#update', function () {
    it('should call client set to set new value with KEEPTTL parameters', async function () {
      // given
      const KEEPTTL_PARAMETER = 'keepttl';
      const key = 'valueKey';
      const value = { name: 'name' };
      const redisTemporaryStorage = new RedisTemporaryStorage(REDIS_URL);

      // when
      await redisTemporaryStorage.update(key, value);

      // then
      expect(clientStub.set).to.have.been.calledWith(sinon.match.any, JSON.stringify(value), KEEPTTL_PARAMETER);
    });
  });

  describe('#delete', function () {
    it('should call client del to delete value', async function () {
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

  describe('#lpush', function () {
    it('should call client lPush to add a value to a list', async function () {
      // given
      const key = 'key';
      const value = 'valueToAdd';
      clientStub.lpush.withArgs(key, value).resolves();
      const redisTemporaryStorage = new RedisTemporaryStorage(REDIS_URL);

      // when
      await redisTemporaryStorage.lpush(key, value);

      // then
      expect(clientStub.lpush).to.have.been.calledWith('key', 'valueToAdd');
    });
  });

  describe('#lrem', function () {
    it('should call client lRem to remove a value from a list', async function () {
      // given
      const key = 'key';
      const value = 'valueToRemove';
      clientStub.lrem.withArgs(key, value).resolves();
      const redisTemporaryStorage = new RedisTemporaryStorage(REDIS_URL);

      // when
      await redisTemporaryStorage.lrem(key, value);

      // then
      expect(clientStub.lrem).to.have.been.calledWith('key', 0, 'valueToRemove');
    });
  });

  describe('#lrange', function () {
    it('should call client lRange to return a list', async function () {
      // given
      const key = 'key';
      const start = 0;
      const stop = -1;
      clientStub.lrange.withArgs(key, start, stop).resolves(['value']);
      const redisTemporaryStorage = new RedisTemporaryStorage(REDIS_URL);

      // when
      await redisTemporaryStorage.lrange(key, start, stop);

      // then
      expect(clientStub.lrange).to.have.been.calledWith('key', 0, -1);
    });
  });
});
