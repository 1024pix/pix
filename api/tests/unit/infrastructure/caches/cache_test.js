const {expect, sinon} = require('../../../test-helper');
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
    const cacheError = null;
    const cachedValue = 'cached_value';

    beforeEach(() => {
      cache._cache.get.withArgs(cacheKey).yields(cacheError, cachedValue);
    });

    it('should resolve the entry in the cache', () => {
      // when
      const promise = cache.get(cacheKey);

      // then
      return expect(promise).to.have.been.fulfilled
        .then((result) => {
          expect(result).to.equal(cachedValue);
        });
    });
  });

});
