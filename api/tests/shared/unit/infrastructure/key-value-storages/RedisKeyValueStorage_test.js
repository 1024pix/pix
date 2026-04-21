import sinon from 'sinon';

import { RedisKeyValueStorage } from '../../../../../src/shared/infrastructure/key-value-storages/RedisKeyValueStorage.js';

describe('Unit | Infrastructure | key-value-storage | RedisKeyValueStorage', function () {
  const REDIS_URL = 'redis_url';

  let clientStub;

  beforeEach(function () {
    clientStub = {
      get: sinon.stub(),
      set: sinon.stub(),
      incr: sinon.stub(),
      decr: sinon.stub(),
      del: sinon.stub(),
      expire: sinon.stub(),
      ttl: sinon.stub(),
      lpush: sinon.stub(),
      lrem: sinon.stub(),
      lrange: sinon.stub(),
      keys: sinon.stub(),
    };

    sinon.stub(RedisKeyValueStorage, 'createClient').withArgs(REDIS_URL, 'some-prefix:').returns(clientStub);
  });

  describe('#constructor', function () {
    it('should call static method createClient', function () {
      // when
      const redisKeyValueStorage = new RedisKeyValueStorage(REDIS_URL, 'some-prefix:');

      // then
      expect(RedisKeyValueStorage.createClient).to.have.been.called;
      expect(redisKeyValueStorage._client).to.exist;
    });
  });

  describe('#save', function () {
    it('should generated key if key parameter is not valid', async function () {
      // given
      const keyParameter = '  ';
      const value = { name: 'name' };
      const expirationDelaySeconds = 1000;
      sinon.spy(RedisKeyValueStorage, 'generateKey');

      const redisKeyValueStorage = new RedisKeyValueStorage(REDIS_URL, 'some-prefix:');

      // when
      await redisKeyValueStorage.save({
        key: keyParameter,
        value,
        expirationDelaySeconds,
      });

      // then
      expect(RedisKeyValueStorage.generateKey).to.have.been.called;
    });

    it('should use passed key parameter if valid', async function () {
      // given
      const keyParameter = 'KEY-PARAMETER';
      const value = { name: 'name' };
      const expirationDelaySeconds = 1000;
      sinon.spy(RedisKeyValueStorage, 'generateKey');

      const redisKeyValueStorage = new RedisKeyValueStorage(REDIS_URL, 'some-prefix:');

      // when
      await redisKeyValueStorage.save({
        key: keyParameter,
        value,
        expirationDelaySeconds,
      });

      // then
      expect(RedisKeyValueStorage.generateKey).not.have.been.called;
    });

    it('should call client set with value and EX parameters', async function () {
      // given
      const EXPIRATION_PARAMETER = 'ex';
      const value = { name: 'name' };
      const expirationDelaySeconds = 1000;
      clientStub.set.resolves();
      const redisKeyValueStorage = new RedisKeyValueStorage(REDIS_URL, 'some-prefix:');

      // when
      await redisKeyValueStorage.save({ value, expirationDelaySeconds });

      // then
      expect(clientStub.set).to.have.been.calledWithExactly(
        sinon.match.any,
        JSON.stringify(value),
        EXPIRATION_PARAMETER,
        expirationDelaySeconds,
      );
    });
  });

  describe('#increment', function () {
    it('should call client incr to increment value', async function () {
      // given
      const key = 'valueKey';
      const redisKeyValueStorage = new RedisKeyValueStorage(REDIS_URL, 'some-prefix:');

      // when
      await redisKeyValueStorage.increment(key);

      // then
      expect(clientStub.incr).to.have.been.calledWith(key);
    });
  });

  describe('#decrement', function () {
    it('should call client incr to decrement value', async function () {
      // given
      const key = 'valueKey';
      const redisKeyValueStorage = new RedisKeyValueStorage(REDIS_URL, 'some-prefix:');

      // when
      await redisKeyValueStorage.decrement(key);

      // then
      expect(clientStub.decr).to.have.been.calledWith(key);
    });
  });

  describe('#get', function () {
    it('should call client get to retrieve value', async function () {
      // given
      const key = 'valueKey';
      const value = { name: 'name' };
      clientStub.get.withArgs(key).resolves(JSON.stringify(value));
      const redisKeyValueStorage = new RedisKeyValueStorage(REDIS_URL, 'some-prefix:');

      // when
      const result = await redisKeyValueStorage.get(key);

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
      const redisKeyValueStorage = new RedisKeyValueStorage(REDIS_URL, 'some-prefix:');

      // when
      await redisKeyValueStorage.update(key, value);

      // then
      expect(clientStub.set).to.have.been.calledWithExactly(sinon.match.any, JSON.stringify(value), KEEPTTL_PARAMETER);
    });
  });

  describe('#delete', function () {
    it('should call client del to delete value', async function () {
      // given
      const key = 'valueKey';
      clientStub.del.withArgs(key).resolves();
      const redisKeyValueStorage = new RedisKeyValueStorage(REDIS_URL, 'some-prefix:');

      // when
      await redisKeyValueStorage.delete(key);

      // then
      expect(clientStub.del).to.have.been.called;
    });
  });

  describe('#expire', function () {
    it('should call client expire to add a value to a list', async function () {
      // given
      const key = 'key';
      const expirationDelaySeconds = 120;
      clientStub.expire.resolves();
      const redisKeyValueStorage = new RedisKeyValueStorage(REDIS_URL, 'some-prefix:');

      // when
      await redisKeyValueStorage.expire({ key, expirationDelaySeconds });

      // then
      expect(clientStub.expire).to.have.been.calledWithExactly(key, expirationDelaySeconds);
    });
  });

  describe('#ttl', function () {
    it('should call client ttl to retrieve the remaining expiration time', async function () {
      // given
      const key = 'key';
      clientStub.ttl.resolves(12);
      const redisKeyValueStorage = new RedisKeyValueStorage(REDIS_URL, 'some-prefix:');

      // when
      const remainingTtl = await redisKeyValueStorage.ttl(key);

      // then
      expect(clientStub.ttl).to.have.been.calledWithExactly(key);
      expect(remainingTtl).to.equal(12);
    });
  });

  describe('#lpush', function () {
    it('should call client lpush to add a value to a list', async function () {
      // given
      const key = 'key';
      const value = 'valueToAdd';
      clientStub.lpush.resolves();
      const redisKeyValueStorage = new RedisKeyValueStorage(REDIS_URL, 'some-prefix:');

      // when
      await redisKeyValueStorage.lpush(key, value);

      // then
      expect(clientStub.lpush).to.have.been.calledWithExactly('key', 'valueToAdd');
    });
  });

  describe('#lrem', function () {
    it('should call client lrem to remove a value from a list', async function () {
      // given
      const key = 'key';
      const value = 'valueToRemove';
      clientStub.lrem.resolves();
      const redisKeyValueStorage = new RedisKeyValueStorage(REDIS_URL, 'some-prefix:');

      // when
      await redisKeyValueStorage.lrem(key, value);

      // then
      expect(clientStub.lrem).to.have.been.calledWithExactly('key', 0, 'valueToRemove');
    });
  });

  describe('#lrange', function () {
    it('should call client lrange to return a list', async function () {
      // given
      const key = 'key';
      const start = 0;
      const stop = -1;
      clientStub.lrange.resolves(['value']);
      const redisKeyValueStorage = new RedisKeyValueStorage(REDIS_URL, 'some-prefix:');

      // when
      await redisKeyValueStorage.lrange(key, start, stop);

      // then
      expect(clientStub.lrange).to.have.been.calledWithExactly('key', 0, -1);
    });
  });

  describe('#keys', function () {
    it('should call client keys and return matching keys', async function () {
      // given
      const pattern = 'prefix:*';
      clientStub.keys.withArgs(pattern).resolves(['some-prefix:key1', 'some-prefix:key2']);
      const redisKeyValueStorage = new RedisKeyValueStorage(REDIS_URL, 'some-prefix:');

      // when
      const actualKeys = await redisKeyValueStorage.keys(pattern);

      // then
      expect(actualKeys).to.deep.equal(['key1', 'key2']);
    });
  });
});
