const { expect, sinon } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/cache');

describe('Unit | Infrastructure | Cache', () => {

  beforeEach(() => {
    cache._cache = {
      get: sinon.stub(),
      set: sinon.stub(),
      del: sinon.stub(),
      flushAll: sinon.stub(),
    };
  });

  describe('#get', () => {

    const cacheKey = 'cache_key';
    const cachedValue = 'cached_value';

    it('should fetch key from the cache', () => {
      // given
      cache._cache.get.withArgs(cacheKey).resolves(cachedValue);

      // when
      const promise = cache.get(cacheKey);

      // then
      return expect(promise).to.have.been.fulfilled
        .then((result) => {
          expect(result).to.equal(cachedValue);
        });
    });
  });

  describe('#set', () => {

    const cacheKey = 'cache_key';
    const valueToCache = 'value_to_cache';

    it('should add an entry to the cache', () => {
      // given
      cache._cache.set.withArgs(cacheKey, valueToCache).resolves(valueToCache);

      // when
      const promise = cache.set(cacheKey, valueToCache);

      // then
      return expect(promise).to.have.been.fulfilled
        .then((result) => {
          expect(result).to.equal(valueToCache);
        });
    });
  });

  describe('#flushAll', () => {

    it('should delete all entries from the cache', () => {
      // given
      cache._cache.flushAll.resolves();

      // when
      const promise = cache.flushAll();

      // then
      return expect(promise).to.have.been.fulfilled
        .then((result) => {
          expect(result).to.be.undefined;
        });
    });
  });

});
