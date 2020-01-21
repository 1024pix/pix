const { expect, sinon } = require('../../../test-helper');
const LayeredCache = require('../../../../lib/infrastructure/caches/LayeredCache');

describe('Unit | Infrastructure | Caches | LayeredCache', () => {

  const layeredCacheInstance = new LayeredCache();

  beforeEach(() => {
    layeredCacheInstance._firstLevelCache = {
      get: sinon.stub(),
      set: sinon.stub(),
      flushAll: sinon.stub(),
    };
    layeredCacheInstance._secondLevelCache = {
      get: sinon.stub(),
      set: sinon.stub(),
      flushAll: sinon.stub(),
    };
  });

  describe('#get', () => {

    const cachedObject = { foo: 'bar' };
    const cacheKey = 'cache-key';
    const generator = () => cachedObject;

    it('should delegate to first level cache, by passing it the second level cache as generator', async () => {
      // given
      layeredCacheInstance._firstLevelCache.get.withArgs(cacheKey).callsFake((key, generator) => generator());
      layeredCacheInstance._secondLevelCache.get.withArgs(cacheKey, generator).callsFake((key, generator) => generator());

      // when
      const result = await layeredCacheInstance.get(cacheKey, generator);

      // then
      expect(result).to.deep.equal(cachedObject);
    });
  });

  describe('#set', () => {

    const cacheKey = 'cache-key';
    const objectToCache = { foo: 'bar' };

    it('should delegate to first level cache, by passing it the second level cache as generator', async () => {
      // given
      layeredCacheInstance._secondLevelCache.set.withArgs(cacheKey, objectToCache).resolves(objectToCache);

      // when
      const result = await layeredCacheInstance.set(cacheKey, objectToCache);

      // then
      expect(layeredCacheInstance._firstLevelCache.flushAll).to.have.been.calledOnce;
      expect(result).to.deep.equal(objectToCache);
    });
  });

  describe('#flushAll', () => {

    it('should flush all entries for both first and second level caches', async () => {
      // given

      // when
      await layeredCacheInstance.flushAll();

      // then
      expect(layeredCacheInstance._firstLevelCache.flushAll).to.have.been.calledOnce;
      expect(layeredCacheInstance._secondLevelCache.flushAll).to.have.been.calledOnce;
    });
  });
});
