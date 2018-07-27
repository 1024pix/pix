const { expect, sinon } = require('../../../test-helper');
const redis = require('redis');
const RedisCache = require('../../../../lib/infrastructure/caches/redis-cache');

describe('Unit | Infrastructure | Cache | redis-cache', () => {

  let stubbedClient;
  let redisCache;

  const REDIS_URL = 'redis_url';
  const CACHE_KEY = 'cache_key';
  const NO_ERROR = null;
  const REDIS_CLIENT_ERROR = new Error('A Redis client error');

  beforeEach(() => {
    stubbedClient = {};
    sinon.stub(redis, 'createClient').returns(stubbedClient);
    redisCache = new RedisCache(REDIS_URL);
  });

  afterEach(() => {
    redis.createClient.restore();
  });

  describe('#constructor', () => {

    it('should create redis client with redis url', () => {
      // when
      new RedisCache(REDIS_URL);

      // then
      expect(redis.createClient).to.have.been.calledWith(REDIS_URL);
    });
  });

  describe('#get', () => {

    beforeEach(() => {
      stubbedClient.get = sinon.stub();
    });

    it('should resolve with the previously cached value when it exists', () => {
      // given
      const cachedObject = { foo: 'bar' };
      const redisCachedValue = JSON.stringify(cachedObject);
      stubbedClient.get.yields(NO_ERROR, redisCachedValue);

      // when
      const promise = redisCache.get(CACHE_KEY);

      // then
      return expect(promise).to.have.been.fulfilled
        .then((result) => {
          expect(result).to.deep.equal(cachedObject);
          expect(stubbedClient.get).to.have.been.calledWith(CACHE_KEY);
        });
    });

    it('should resolve with null when no object was previously cached for given key', () => {
      // given
      const noRedisCachedValue = 'null';
      stubbedClient.get.yields(NO_ERROR, noRedisCachedValue);

      // when
      const promise = redisCache.get(CACHE_KEY);

      // then
      return expect(promise).to.have.been.fulfilled
        .then((result) => {
          expect(result).to.deep.equal(null);
        });
    });

    it('should reject when the Redis cache client throws an error', () => {
      // given

      stubbedClient.get.yields(REDIS_CLIENT_ERROR);

      // when
      const promise = redisCache.get(CACHE_KEY);

      // then
      return expect(promise).to.have.been.rejectedWith(REDIS_CLIENT_ERROR);
    });

    it('should reject when the previously cached value can not be parsed as JSON', () => {
      // given
      const redisCachedValue = 'Unprocessable JSON object';
      stubbedClient.get.yields(NO_ERROR, redisCachedValue);

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
      stubbedClient.set.yields(NO_ERROR);

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
      stubbedClient.set.yields(REDIS_CLIENT_ERROR);

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
      stubbedClient.del.yields(NO_ERROR, numberOfDeletedKeys);

      // when
      const promise = redisCache.del(CACHE_KEY);

      // then
      return expect(promise).to.have.been.fulfilled;
    });

    it('should reject when the Redis cache client throws an error', () => {
      // given
      stubbedClient.del.yields(REDIS_CLIENT_ERROR);

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
      stubbedClient.flushall.yields(NO_ERROR);

      // when
      const promise = redisCache.flushAll();

      // then
      return expect(promise).to.have.been.fulfilled;
    });

    it('should reject when the Redis cache client throws an error', () => {
      // given
      stubbedClient.flushall.yields(REDIS_CLIENT_ERROR);

      // when
      const promise = redisCache.flushAll();

      // then
      return expect(promise).to.have.been.rejectedWith(REDIS_CLIENT_ERROR);
    });
  });
});
