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

  describe('#constructor', () => {

  });

  describe('#get', () => {

    const cacheKey = 'cache_key';
    const cachedValue = 'cached_value';

    it('should resolves the entry in the cache', () => {
      // given
      const cacheError = null;
      cache._cache.get.withArgs(cacheKey).yields(cacheError, cachedValue);

      // when
      const promise = cache.get(cacheKey);

      // then
      return expect(promise).to.have.been.fulfilled
        .then((result) => {
          expect(result).to.equal(cachedValue);
        });
    });

    context('when cache yields an error', () => {

      it('should rejects with the cache error', () => {
        // given
        const cacheError = 'cache_error';
        cache._cache.get.withArgs(cacheKey).yields(cacheError, cachedValue);

        // when
        const promise = cache.get(cacheKey);

        // then
        return expect(promise).to.have.been.rejected
          .then((error) => {
            expect(error).to.equal(cacheError);
          });
      });
    });
  });

  describe('#set', () => {

    const cacheKey = 'cache_key';
    const valueToCache = 'value_to_cache';

    it('should resolves', () => {
      // given
      const cacheError = null;
      cache._cache.set.withArgs(cacheKey, valueToCache).yields(cacheError);

      // when
      const promise = cache.set(cacheKey, valueToCache);

      // then
      return expect(promise).to.have.been.fulfilled;
    });

    context('when cache yields an error', () => {

      it('should rejects with the cache error', () => {
        // given
        const cacheError = 'cache_error';
        cache._cache.set.withArgs(cacheKey, valueToCache).yields(cacheError);

        // when
        const promise = cache.set(cacheKey, valueToCache);

        // then
        return expect(promise).to.have.been.rejected
          .then((error) => {
            expect(error).to.equal(cacheError);
          });
      });
    });
  });

  describe('#del', () => {

    const cacheKey = 'cache_key';

    it('should resolves', () => {
      // given
      const cacheError = null;
      cache._cache.del.withArgs(cacheKey).yields(cacheError);

      // when
      const promise = cache.del(cacheKey);

      // then
      return expect(promise).to.have.been.fulfilled;
    });

    context('when cache yields an error', () => {

      it('should rejects with the cache error', () => {
        // given
        const cacheError = 'cache_error';
        cache._cache.del.withArgs(cacheKey).yields(cacheError);

        // when
        const promise = cache.del(cacheKey);

        // then
        return expect(promise).to.have.been.rejected
          .then((error) => {
            expect(error).to.equal(cacheError);
          });
      });
    });
  });

  describe('#flushAll', () => {

    it('should resolves', () => {
      // given
      cache._cache.flushAll.yields();

      // when
      const promise = cache.flushAll();

      // then
      return expect(promise).to.have.been.fulfilled;
    });
  });
});
