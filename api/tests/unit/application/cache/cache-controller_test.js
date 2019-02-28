const { expect, sinon, hFake } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const cache = require('../../../../lib/infrastructure/caches/cache');
const preloader = require('../../../../lib/infrastructure/caches/preloader');
const logger = require('../../../../lib/infrastructure/logger');
const cacheController = require('../../../../lib/application/cache/cache-controller');

describe('Unit | Controller | cache-controller', () => {

  describe('#reloadCacheEntry', () => {

    const request = {
      params: {
        cachekey: 'Epreuves_recABCDEF'
      }
    };

    beforeEach(() => {
      sinon.stub(usecases, 'reloadCacheEntry');
    });

    it('should reply with null when the cache key exists', async () => {
      // given
      const numberOfDeletedKeys = 1;
      usecases.reloadCacheEntry.resolves(numberOfDeletedKeys);

      // when
      const response = await cacheController.reloadCacheEntry(request, hFake);

      // then
      expect(usecases.reloadCacheEntry).to.have.been.calledWith({
        preloader,
        tableName: 'Epreuves',
        recordId: 'recABCDEF'
      });
      expect(response).to.be.null;
    });

    it('should reply with null when the cache key does not exist', async () => {
      // given
      const numberOfDeletedKeys = 0;
      usecases.reloadCacheEntry.resolves(numberOfDeletedKeys);

      // when
      const response = await cacheController.reloadCacheEntry(request, hFake);

      // Then
      expect(response).to.be.null;
    });

    it('should allow a table name without a record id', async () => {
      // given
      const numberOfDeletedKeys = 1;
      usecases.reloadCacheEntry.resolves(numberOfDeletedKeys);

      // when
      const response = await cacheController.reloadCacheEntry({ params: { cachekey: 'Epreuves' } }, hFake);

      // Then
      expect(usecases.reloadCacheEntry).to.have.been.calledWith({
        preloader,
        tableName: 'Epreuves',
        recordId: undefined
      });
      expect(response).to.be.null;
    });
  });

  describe('#removeAllCacheEntries', () => {
    const request = {};

    beforeEach(() => {
      sinon.stub(usecases, 'removeAllCacheEntries');
    });

    it('should reply with null when there is no error', async () => {
      // given
      usecases.removeAllCacheEntries.resolves();

      // when
      const response = await cacheController.removeAllCacheEntries(request, hFake);

      // Then
      expect(usecases.removeAllCacheEntries).to.have.been.calledWith({ cache });
      expect(response).to.be.null;
    });
  });

  describe('#preloadCacheEntries', () => {
    const request = {};

    beforeEach(() => {
      sinon.stub(usecases, 'preloadCacheEntries');
    });

    it('should reply with null when there is no error', async () => {
      // given
      usecases.preloadCacheEntries.resolves();

      // when
      const response = await cacheController.preloadCacheEntries(request, hFake);

      // Then
      expect(usecases.preloadCacheEntries).to.have.been.calledWith({ preloader, logger });
      expect(response).to.be.null;
    });
  });
});
