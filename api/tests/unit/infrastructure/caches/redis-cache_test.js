const { expect, sinon } = require('../../../test-helper');
const settings = require('../../../../lib/settings');
const Redlock = require('redlock');
const RedisCache = require('../../../../lib/infrastructure/caches/redis-cache');

describe('Unit | Infrastructure | Cache | redis-cache', () => {

  let stubbedClient;
  let redisCache;

  const REDIS_URL = 'redis_url';
  const CACHE_KEY = 'cache_key';
  const REDIS_CLIENT_ERROR = new Error('A Redis client error');

  beforeEach(() => {
    stubbedClient = {
      lockDisposer: sinon.stub().resolves(() => {})
    };
    sinon.stub(RedisCache, 'createClient')
      .withArgs(REDIS_URL)
      .returns(stubbedClient);
    redisCache = new RedisCache(REDIS_URL);
  });

  describe('#get', () => {
    beforeEach(() => {
      stubbedClient.get = sinon.stub();
      redisCache.set = sinon.stub();
    });

    context('when the value is already in cache', () => {

      it('should resolve with the existing value', () => {
        // given
        const cachedData = { foo: 'bar' };
        const redisCachedData = JSON.stringify(cachedData);
        stubbedClient.get.withArgs(CACHE_KEY).resolves(redisCachedData);

        // when
        const promise = redisCache.get(CACHE_KEY);

        // then
        return expect(promise).to.have.been.fulfilled
          .then((result) => {
            expect(result).to.deep.equal(cachedData);
          });
      });

    });

    context('when the value is not in cache', () => {

      beforeEach(() => {
        const cachedObject = { foo: 'bar' };
        const redisCachedValue = JSON.stringify(cachedObject);
        stubbedClient.get.withArgs(CACHE_KEY).onCall(0).resolves(null);
        stubbedClient.get.withArgs(CACHE_KEY).onCall(1).resolves(redisCachedValue);
        redisCache.set.resolves();
      });

      it('should try to lock the cache key', () => {
        // given
        const expectedLockedKey = 'locks:' + CACHE_KEY;
        const handler = sinon.stub().resolves();

        // when
        const promise = redisCache.get(CACHE_KEY, handler);

        // then
        return promise.then(() => {
          return expect(stubbedClient.lockDisposer).to.have.been.calledWith(expectedLockedKey, settings.caching.redisCacheKeyLockTTL);
        });
      });

      context('and the cache key is not already locked', () => {

        it('should add into the cache the value returned by the handler', () => {
          // given
          const dataFromHandler = { name: 'data from airtable' };
          const handler = () => Promise.resolve(dataFromHandler);

          // when
          const promise = redisCache.get(CACHE_KEY, handler);

          // then
          return promise.then(() => {
            return expect(redisCache.set).to.have.been.calledWith(CACHE_KEY, dataFromHandler);
          });
        });

        it('should return the value', () => {
          // given
          const dataFromHandler = { name: 'data from airtable' };
          const handler = () => Promise.resolve(dataFromHandler);
          redisCache.set.resolves(dataFromHandler);

          // when
          const promise = redisCache.get(CACHE_KEY, handler);

          // then
          return promise.then((value) => {
            return expect(value).to.equal(dataFromHandler);
          });
        });

      });

      context('and the cache key is already locked', () => {

        it('should wait and retry to get the value from the cache', () => {
          // given
          stubbedClient.lockDisposer.rejects(new Redlock.LockError());
          const handler = () => {
          };

          // when
          const promise = redisCache.get(CACHE_KEY, handler);

          // then
          return promise.then(() => {
            expect(stubbedClient.get).to.have.been.calledTwice;
          });
        });

      });

    });

    it('should reject when the Redis cache client throws an error', () => {
      // given

      stubbedClient.get.rejects(REDIS_CLIENT_ERROR);

      // when
      const promise = redisCache.get(CACHE_KEY);

      // then
      return expect(promise).to.have.been.rejectedWith(REDIS_CLIENT_ERROR);
    });

    it('should reject when the previously cached value can not be parsed as JSON', () => {
      // given
      const redisCachedValue = 'Unprocessable JSON object';
      stubbedClient.get.resolves(redisCachedValue);

      // when
      const promise = redisCache.get(CACHE_KEY);

      // then
      return expect(promise).to.have.been.rejectedWith(SyntaxError);
    });
  });

  describe('#set', () => {

    const objectToCache = { foo: 'bar' };

    beforeEach(() => {
      stubbedClient.set = sinon.stub();
    });

    it('should resolve with the object to cache', () => {
      // given
      stubbedClient.set.resolves();

      // when
      const promise = redisCache.set(CACHE_KEY, objectToCache);

      // then
      return expect(promise).to.have.been.fulfilled
        .then((result) => {
          expect(result).to.deep.equal(objectToCache);
          expect(stubbedClient.set).to.have.been.calledWith(CACHE_KEY, JSON.stringify(objectToCache));
        });
    });

    it('should reject when the Redis cache client throws an error', () => {
      // given
      stubbedClient.set.rejects(REDIS_CLIENT_ERROR);

      // when
      const promise = redisCache.set(CACHE_KEY, objectToCache);

      // then
      return expect(promise).to.have.been.rejectedWith(REDIS_CLIENT_ERROR);
    });
  });

  describe('#del', () => {

    beforeEach(() => {
      stubbedClient.del = sinon.stub();
    });

    it('should resolve', () => {
      // given
      const numberOfDeletedKeys = 1;
      stubbedClient.del.resolves(numberOfDeletedKeys);

      // when
      const promise = redisCache.del(CACHE_KEY);

      // then
      return expect(promise).to.have.been.fulfilled;
    });

    it('should reject when the Redis cache client throws an error', () => {
      // given
      stubbedClient.del.rejects(REDIS_CLIENT_ERROR);

      // when
      const promise = redisCache.del(CACHE_KEY);

      // then
      return expect(promise).to.have.been.rejectedWith(REDIS_CLIENT_ERROR);
    });
  });

  describe('#flushAll', () => {

    beforeEach(() => {
      stubbedClient.flushall = sinon.stub();
    });

    it('should resolve', () => {
      // given
      stubbedClient.flushall.resolves();

      // when
      const promise = redisCache.flushAll();

      // then
      return expect(promise).to.have.been.fulfilled;
    });

    it('should reject when the Redis cache client throws an error', () => {
      // given
      stubbedClient.flushall.rejects(REDIS_CLIENT_ERROR);

      // when
      const promise = redisCache.flushAll();

      // then
      return expect(promise).to.have.been.rejectedWith(REDIS_CLIENT_ERROR);
    });
  });

});
