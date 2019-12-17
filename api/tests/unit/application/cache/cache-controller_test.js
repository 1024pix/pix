const { expect, sinon, hFake } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const cacheController = require('../../../../lib/application/cache/cache-controller');
const AirtableDatasources = require('../../../../lib/infrastructure/datasources/airtable');
const _ = require('lodash');

describe('Unit | Controller | cache-controller', () => {

  describe('#reloadCacheEntry', () => {

    const request = {
      params: {
        cachekey: 'Epreuves_recABCDEF'
      }
    };

    beforeEach(() => {
      sinon.stub(AirtableDatasources.ChallengeDatasource, 'loadEntry');
    });

    it('should reply with null when the cache key exists', async () => {
      // given
      const numberOfDeletedKeys = 1;
      AirtableDatasources.ChallengeDatasource.loadEntry.resolves(numberOfDeletedKeys);

      // when
      const response = await cacheController.reloadCacheEntry(request, hFake);

      // then
      expect(AirtableDatasources.ChallengeDatasource.loadEntry).to.have.been.calledWithExactly('recABCDEF');
      expect(response).to.be.null;
    });

    it('should reply with null when the cache key does not exist', async () => {
      // given
      const numberOfDeletedKeys = 0;
      AirtableDatasources.ChallengeDatasource.loadEntry.resolves(numberOfDeletedKeys);

      // when
      const response = await cacheController.reloadCacheEntry(request, hFake);

      // Then
      expect(response).to.be.null;
    });
  });

  describe('#removeCacheEntries', () => {

    const request = {};

    it('should reply with null when there is no error', async () => {
      // given
      sinon.stub(cache, 'flushAll').resolves();

      // when
      const response = await cacheController.removeCacheEntries(request, hFake);

      // Then
      expect(cache.flushAll).to.have.been.calledOnce;
      expect(response).to.be.null;
    });
  });

  describe('#reloadCacheEntries', () => {

    const request = {};

    it('should reply with null when there is no error', async () => {
      // given
      _.map(AirtableDatasources, (datasource) => sinon.stub(datasource, 'loadEntries'));

      // when
      const response = await cacheController.reloadCacheEntries(request, hFake);

      // Then
      _.map(AirtableDatasources, (datasource) => expect(datasource.loadEntries).to.have.been.calledOnce);
      expect(response).to.be.null;
    });
  });
});
