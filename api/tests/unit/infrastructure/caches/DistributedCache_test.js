const { expect, sinon } = require('../../../test-helper');
const DistributedCache = require('../../../../lib/infrastructure/caches/DistributedCache');

describe('Unit | Infrastructure | Caches | DistributedCache', () => {

  let distributedCacheInstance;
  let underlyingCache;
  const channel = 'channel';

  beforeEach(() => {
    underlyingCache = {
      get: sinon.stub(),
      set: sinon.stub(),
      flushAll: sinon.stub(),
    };
    const redisUrl = 'redis://url.example.net';
    distributedCacheInstance = new DistributedCache(underlyingCache, redisUrl, channel);
  });

  describe('#get', () => {

    it('should resolve the underlying cache result for get() method', async () => {
      // given
      const cacheKey = 'cache-key';
      const cachedObject = { foo: 'bar' };
      const generator = () => cachedObject;
      underlyingCache.get.withArgs(cacheKey, generator).resolves(cachedObject);

      // when
      const result = await distributedCacheInstance.get(cacheKey, generator);

      // then
      expect(result).to.deep.equal(cachedObject);
    });
  });

  describe('#set', () => {

    it('should resovle the underlying cache result for set() method', async () => {
      // given
      const cacheKey = 'cache-key';
      const objectToCache = { foo: 'bar' };
      underlyingCache.set.withArgs(cacheKey, objectToCache).resolves(objectToCache);

      // when
      const result = await distributedCacheInstance.set(cacheKey, objectToCache);

      // then
      expect(result).to.deep.equal(objectToCache);
    });
  });

  describe('#flushAll', () => {

    it('shoud use Redis pub/sub notification mechanism to trigger the caches synchronization', async () => {
      // given
      distributedCacheInstance._redisClientPublisher = {
        publish: sinon.stub()
      };
      distributedCacheInstance._redisClientPublisher.publish.withArgs(channel, 'Flush all').resolves(true);

      // when
      const result = await distributedCacheInstance.flushAll();

      // then
      expect(result).to.be.true;
    });
  });
});
