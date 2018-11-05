const { expect, sinon } = require('../../../test-helper');
const preloader = require('../../../../lib/infrastructure/caches/preloader');
const reloadCacheEntry = require('../../../../lib/domain/usecases/reload-cache-entry');

describe('Unit | UseCase | reloadCacheEntry', () => {

  beforeEach(() => {
    sinon.stub(preloader, 'loadKey').resolves();
  });

  afterEach(() => {
    preloader.loadKey.restore();
  });

  it('should load the table', () => {
    // given
    const cacheKey = 'test-cache-key';

    // when
    const promise = reloadCacheEntry({ preloader, cacheKey });

    // Then
    return promise.then(() => {
      expect(preloader.loadKey).to.have.been.calledWith(cacheKey);
    });
  });

});

