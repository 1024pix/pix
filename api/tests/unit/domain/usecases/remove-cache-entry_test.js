const { expect, sinon } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/cache');
const removeCacheEntry = require('../../../../lib/domain/usecases/remove-cache-entry');

describe('Unit | UseCase | removeCacheEntry', () => {

  beforeEach(() => {
    sinon.stub(cache, 'del');
  });

  afterEach(() => {
    cache.del.restore();
  });

  it('should call the corresponding cache method', () => {
    // given
    const cacheKey = 'test-cache-key';
    cache.del.resolves();

    // when
    const promise = removeCacheEntry({ cacheKey, cache });

    // Then
    return promise.then(() => {
      expect(cache.del).to.have.been.calledWith(cacheKey);
    });
  });
});

