const { expect, sinon } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/cache');
const preloader = require('../../../../lib/infrastructure/caches/preloader');
const reloadCacheEntry = require('../../../../lib/domain/usecases/reload-cache-entry');

describe('Unit | UseCase | reloadCacheEntry', () => {

  beforeEach(() => {
    sinon.stub(cache, 'del').resolves();
    sinon.stub(preloader, 'loadTable').resolves();
  });

  afterEach(() => {
    cache.del.restore();
    preloader.loadTable.restore();
  });

  it('should call the cache method to delete key', () => {
    // given
    const cacheKey = 'test-cache-key';

    // when
    const promise = reloadCacheEntry({ preloader, cacheKey, cache });

    // Then
    return promise.then(() => {
      expect(cache.del).to.have.been.calledWith(cacheKey);
    });
  });

  it('should load the table', () => {
    // given
    const cacheKey = 'test-cache-key';

    // when
    const promise = reloadCacheEntry({ preloader, cacheKey, cache });

    // Then
    return promise.then(() => {
      expect(preloader.loadTable).to.have.been.calledWith(cacheKey);
    });
  });

});

