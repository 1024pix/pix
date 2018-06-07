const { expect, sinon } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/cache');
const removeAllCacheEntries = require('../../../../lib/domain/usecases/remove-all-cache-entries');

describe('Unit | UseCase | removeAllCacheEntries', () => {

  beforeEach(() => {
    sinon.stub(cache, 'flushAll');
  });

  afterEach(() => {
    cache.flushAll.restore();
  });

  it('should call the corresponding cache method', () => {
    // given
    cache.flushAll.resolves();

    // when
    const promise = removeAllCacheEntries({ cache });

    // Then
    return promise.then(() => {
      expect(cache.flushAll).to.have.been.called;
    });
  });
});

