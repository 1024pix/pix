const { expect, sinon, hFake } = require('../../../test-helper');
const cacheController = require('../../../../lib/application/cache/cache-controller');
const AirtableDatasources = require('../../../../lib/infrastructure/datasources/airtable');
const _ = require('lodash');

describe('Unit | Controller | cache-controller', () => {

  describe('#refreshCacheEntry', () => {

    const request = {
      params: {
        cachekey: 'Epreuves_recABCDEF'
      }
    };

    beforeEach(() => {
      sinon.stub(AirtableDatasources.ChallengeDatasource, 'refreshAirtableCacheRecord');
    });

    it('should reply with null when the cache key exists', async () => {
      // given
      const numberOfDeletedKeys = 1;
      AirtableDatasources.ChallengeDatasource.refreshAirtableCacheRecord.resolves(numberOfDeletedKeys);

      // when
      const response = await cacheController.refreshCacheEntry(request, hFake);

      // then
      expect(AirtableDatasources.ChallengeDatasource.refreshAirtableCacheRecord).to.have.been.calledWithExactly('recABCDEF');
      expect(response).to.be.null;
    });

    it('should reply with null when the cache key does not exist', async () => {
      // given
      const numberOfDeletedKeys = 0;
      AirtableDatasources.ChallengeDatasource.refreshAirtableCacheRecord.resolves(numberOfDeletedKeys);

      // when
      const response = await cacheController.refreshCacheEntry(request, hFake);

      // Then
      expect(response).to.be.null;
    });
  });

  describe('#refreshCacheEntries', () => {

    const request = {};

    it('should reply with null when there is no error', async () => {
      // given
      _.map(AirtableDatasources, (datasource) => sinon.stub(datasource, 'refreshAirtableCacheRecords'));

      // when
      const response = await cacheController.refreshCacheEntries(request, hFake);

      // Then
      _.map(AirtableDatasources, (datasource) => expect(datasource.refreshAirtableCacheRecords).to.have.been.calledOnce);
      expect(response).to.be.null;
    });
  });
});
