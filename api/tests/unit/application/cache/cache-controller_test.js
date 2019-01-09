const { expect, sinon, hFake } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const cache = require('../../../../lib/infrastructure/caches/cache');
const preloader = require('../../../../lib/infrastructure/caches/preloader');
const logger = require('../../../../lib/infrastructure/logger');
const cacheController = require('../../../../lib/application/cache/cache-controller');

describe('Unit | Controller | cache-controller', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#reloadCacheEntry', () => {

    const request = {
      params: {
        cachekey: 'Epreuves_recABCDEF'
      }
    };

    beforeEach(() => {
      sandbox.stub(usecases, 'reloadCacheEntry');
    });

    it('should reply with 204 when the cache key exists', async () => {
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
      expect(response.source).to.deep.equal();
      expect(response.statusCode).to.equal(204);
    });

    it('should reply with 204 when the cache key does not exist', async () => {
      // given
      const numberOfDeletedKeys = 0;
      usecases.reloadCacheEntry.resolves(numberOfDeletedKeys);

      // when
      const response = await cacheController.reloadCacheEntry(request, hFake);

      // Then
      expect(response.statusCode).to.equal(204);
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
      expect(response.statusCode).to.equal(204);
    });

    context('when cache reloading fails', () => {

      it('should reply with a JSON API error', async () => {
        // given
        const cacheError = new Error('Cache Error');
        usecases.reloadCacheEntry.rejects(cacheError);

        // when
        const response = await cacheController.reloadCacheEntry(request, hFake);

        // Then
        const expectedJsonApiError = {
          errors: [{ code: '500', detail: 'Cache Error', title: 'Internal Server Error' }]
        };
        expect(response.source).to.deep.equal(expectedJsonApiError);
        expect(response.statusCode).to.equal(500);
      });
    });

  });

  describe('#removeAllCacheEntries', () => {
    const request = {};

    beforeEach(() => {
      sinon.stub(usecases, 'removeAllCacheEntries');
    });

    it('should reply with 204 when there is no error', async () => {
      // given
      usecases.removeAllCacheEntries.resolves();

      // when
      const response = await cacheController.removeAllCacheEntries(request, hFake);

      // Then
      expect(usecases.removeAllCacheEntries).to.have.been.calledWith({ cache });
      expect(response.statusCode).to.equal(204);
    });

    context('when cache deletion fails', () => {

      it('should reply with server error', async () => {
        // given
        const cacheError = new Error('Cache Error');
        usecases.removeAllCacheEntries.rejects(cacheError);

        // when
        const response = await cacheController.removeAllCacheEntries(request, hFake);

        // Then
        const expectedJsonApiError = {
          errors: [{ code: '500', detail: 'Cache Error', title: 'Internal Server Error' }]
        };
        expect(response.source).to.deep.equal(expectedJsonApiError);
        expect(response.statusCode).to.equal(500);
      });
    });

  });

  describe('#preloadCacheEntries', () => {
    const request = {};

    beforeEach(() => {
      sinon.stub(usecases, 'preloadCacheEntries');
    });

    it('should reply with 204 when there is no error', async () => {
      // given
      usecases.preloadCacheEntries.resolves();

      // when
      const response = await cacheController.preloadCacheEntries(request, hFake);

      // Then
      expect(usecases.preloadCacheEntries).to.have.been.calledWith({ preloader, logger });
      expect(response.statusCode).to.equal(204);
    });

    context('when cache preload fails', () => {

      it('should reply with server error', async () => {
        // given
        const cacheError = new Error('Cache Error');
        usecases.preloadCacheEntries.rejects(cacheError);

        // when
        const response = await cacheController.preloadCacheEntries(request, hFake);

        // Then
        const expectedJsonApiError = {
          errors: [{ code: '500', detail: 'Cache Error', title: 'Internal Server Error' }]
        };
        expect(response.source).to.deep.equal(expectedJsonApiError);
        expect(response.statusCode).to.equal(500);
      });
    });

  });
});
