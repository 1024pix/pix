import { expect, sinon } from '../../../test-helper.js';
import { LayeredCache } from '../../../../lib/infrastructure/caches/LayeredCache.js';

describe('Unit | Infrastructure | Caches | LayeredCache', function () {
  const layeredCacheInstance = new LayeredCache();

  beforeEach(function () {
    layeredCacheInstance._firstLevelCache = {
      get: sinon.stub(),
      set: sinon.stub(),
      patch: sinon.stub(),
      flushAll: sinon.stub(),
    };
    layeredCacheInstance._secondLevelCache = {
      get: sinon.stub(),
      set: sinon.stub(),
      patch: sinon.stub(),
      flushAll: sinon.stub(),
    };
  });

  describe('#get', function () {
    const cachedObject = { foo: 'bar' };
    const cacheKey = 'cache-key';
    const generator = () => cachedObject;

    it('should delegate to first level cache, by passing it the second level cache as generator', async function () {
      // given
      layeredCacheInstance._firstLevelCache.get.withArgs(cacheKey).callsFake((key, generator) => generator());
      layeredCacheInstance._secondLevelCache.get
        .withArgs(cacheKey, generator)
        .callsFake((key, generator) => generator());

      // when
      const result = await layeredCacheInstance.get(cacheKey, generator);

      // then
      expect(result).to.deep.equal(cachedObject);
    });
  });

  describe('#set', function () {
    const cacheKey = 'cache-key';
    const objectToCache = { foo: 'bar' };

    it('should delegate to first level cache, by passing it the second level cache as generator', async function () {
      // given
      layeredCacheInstance._secondLevelCache.set.withArgs(cacheKey, objectToCache).resolves(objectToCache);

      // when
      const result = await layeredCacheInstance.set(cacheKey, objectToCache);

      // then
      expect(layeredCacheInstance._firstLevelCache.flushAll).to.have.been.calledOnce;
      expect(result).to.deep.equal(objectToCache);
      expect(layeredCacheInstance._secondLevelCache.set).to.have.been.calledBefore(
        layeredCacheInstance._firstLevelCache.flushAll,
      );
    });
  });

  describe('#flushAll', function () {
    it('should flush all entries for both first and second level caches', async function () {
      // given

      // when
      await layeredCacheInstance.flushAll();

      // then
      expect(layeredCacheInstance._firstLevelCache.flushAll).to.have.been.calledOnce;
      expect(layeredCacheInstance._secondLevelCache.flushAll).to.have.been.calledOnce;
    });
  });

  describe('#patch', function () {
    const cacheKey = 'learning-content';

    it('should apply patch in first and second level cache', async function () {
      // given
      const patch = {
        operation: 'assign',
        path: 'challenges[0]',
        value: { id: 'recChallenge1', instruction: 'Nouvelle consigne' },
      };

      // when
      await layeredCacheInstance.patch(cacheKey, patch);

      // then
      expect(layeredCacheInstance._firstLevelCache.patch).to.have.been.calledWith(cacheKey, patch);
      expect(layeredCacheInstance._secondLevelCache.patch).to.have.been.calledWith(cacheKey, patch);
    });
  });
});
