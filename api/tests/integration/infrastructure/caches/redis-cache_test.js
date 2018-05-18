const {expect, sinon} = require('../../../test-helper');
const factory = require('../../../factory');
const redis = require('redis');
const RedisCache = require('../../../../lib/infrastructure/caches/redis-cache');

describe('Integration | Infrastructure | Cache', () => {

  const stubbedClient = {
    set: () => undefined,
    get: () => undefined,
    del: () => undefined,
    flushall: () => undefined,
  };

  beforeEach(() => {
    sinon.stub(redis, 'createClient').returns(stubbedClient);
    sinon.stub(stubbedClient, 'set');
    sinon.stub(stubbedClient, 'get');
    sinon.stub(stubbedClient, 'del');
    sinon.stub(stubbedClient, 'flushall');
  });

  afterEach(() => {
    redis.createClient.restore();
    stubbedClient.set.restore();
    stubbedClient.get.restore();
    stubbedClient.del.restore();
    stubbedClient.flushall.restore();
  });

  it('should create redis client with redis url', () => {
    // given
    const redisUrl = 'redis_url';

    // when
    new RedisCache(redisUrl);

    // then
    expect(redis.createClient).to.have.been.calledWith(redisUrl);
  });

  describe('#get', () => {

    it('should call redis-cache lib with key', () => {
      // given
      const redisCache = new RedisCache('redis_url');
      const certificationCacheKey = 'certification_cache_key';
      const callback = () => undefined;

      // when
      redisCache.get(certificationCacheKey, callback);

      // then
      expect(stubbedClient.get).to.have.been.calledWith(certificationCacheKey);
    });

    it('should call callback with object after retrieving it if no error', () => {
      const redisCache = new RedisCache('redis_url');
      const certificationCacheKey = 'certification_cache_key';
      const error = undefined;
      const callback = sinon.stub();
      const expectedCertification = factory.buildCertification();

      stubbedClient.get.callsFake((key, callback) => {
        const value = JSON.stringify(expectedCertification);
        callback(error, value);
      });

      // when
      redisCache.get(certificationCacheKey, callback);

      // then
      expect(callback).to.have.been.calledWith(error, expectedCertification);
    });

    it('should call callback with error if error', () => {
      // given
      const redisCache = new RedisCache('redis_url');
      const certificationCacheKey = 'certification_cache_key';
      const error = new Error();
      const callback = sinon.stub();

      stubbedClient.get.callsFake((key, callback) => {
        const value = undefined;
        callback(error, value);
      });

      // when
      redisCache.get(certificationCacheKey, callback);

      // then
      expect(callback).to.have.been.calledWith(error);
    });
  });

  describe('#set', () => {

    it('should call redis-cache lib with key and stringified object', () => {
      // given
      const redisCache = new RedisCache('redis_url');
      const certificationCacheKey = 'certification_cache_key';
      const certificationToCache = factory.buildCertification();
      const stringifiedCertification = JSON.stringify(certificationToCache);

      // when
      redisCache.set(certificationCacheKey, certificationToCache);

      // then
      expect(stubbedClient.set).to.have.been.calledWith(certificationCacheKey, stringifiedCertification);
    });
  });

  describe('#del', () => {

    it('should call redis-cache lib with key and callback', () => {
      // given
      const redisCache = new RedisCache('redis_url');
      const certificationCacheKey = 'certification_cache_key';
      const callback = () => undefined;

      // when
      redisCache.del(certificationCacheKey, callback);

      // then
      expect(stubbedClient.del).to.have.been.calledWith(certificationCacheKey, callback);
    });
  });

  describe('#flushall', () => {

    it('should call redis-cache flushall', () => {
      // given
      const redisCache = new RedisCache('redis_url');

      // when
      redisCache.flushAll();

      // then
      expect(stubbedClient.flushall).to.have.been.called;
    });
  });
});
