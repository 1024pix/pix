const { expect, sinon } = require('../../../test-helper');
const LayeredCache = require('../../../../lib/infrastructure/caches/LayeredCache');

describe('Unit | Infrastructure | Caches | LayeredCache', () => {

  const layeredCacheInstance = new LayeredCache();

  beforeEach(() => {
    layeredCacheInstance._level1Cache = {
      get: sinon.stub(),
      set: sinon.stub(),
      flushAll: sinon.stub(),
    };
    layeredCacheInstance._level2Cache = {
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
      layeredCacheInstance._level1Cache.get.withArgs(cacheKey).callsFake((key, generator) => generator());
      layeredCacheInstance._level2Cache.get.withArgs(cacheKey, generator).callsFake((key, generator) => generator());

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
      layeredCacheInstance._level2Cache.set.withArgs(cacheKey, objectToCache).resolves(objectToCache);

      // when
      const result = await layeredCacheInstance.set(cacheKey, objectToCache);

      // then
      expect(layeredCacheInstance._level1Cache.flushAll).to.have.been.calledOnce;
      expect(result).to.deep.equal(objectToCache);
    });
  });

  describe('#flushAll', () => {

    it('shoud flush all entries for both first and second level cache', async () => {
      // given

      // when
      await layeredCacheInstance.flushAll();

      // then
      expect(layeredCacheInstance._level1Cache.flushAll).to.have.been.calledOnce;
      expect(layeredCacheInstance._level2Cache.flushAll).to.have.been.calledOnce;
    });
  });
});
