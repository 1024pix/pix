const { expect, sinon, hFake } = require('../../../test-helper');
const cacheController = require('../../../../lib/application/cache/cache-controller');
const AirtableDatasources = require('../../../../lib/infrastructure/datasources/learning-content');
const logger = require('../../../../lib/infrastructure/logger');
const _ = require('lodash');

describe('Unit | Controller | cache-controller', () => {

  describe('#refreshCacheEntry', () => {

    const request = {
      params: {
        cachekey: 'Epreuves_recABCDEF',
      },
    };

    beforeEach(() => {
      sinon.stub(AirtableDatasources.ChallengeDatasource, 'refreshLearningContentCacheRecord');
    });

    it('should reply with null when the cache key exists', async () => {
      // given
      const numberOfDeletedKeys = 1;
      AirtableDatasources.ChallengeDatasource.refreshLearningContentCacheRecord.resolves(numberOfDeletedKeys);

      // when
      const response = await cacheController.refreshCacheEntry(request, hFake);

      // then
      expect(AirtableDatasources.ChallengeDatasource.refreshLearningContentCacheRecord).to.have.been.calledWithExactly('recABCDEF');
      expect(response).to.be.null;
    });

    it('should reply with null when the cache key does not exist', async () => {
      // given
      const numberOfDeletedKeys = 0;
      AirtableDatasources.ChallengeDatasource.refreshLearningContentCacheRecord.resolves(numberOfDeletedKeys);

      // when
      const response = await cacheController.refreshCacheEntry(request, hFake);

      // Then
      expect(response).to.be.null;
    });
  });

  describe('#refreshCacheEntries', () => {

    const request = {};

    context('nominal case', () => {
      it('should reply with http status 202', async () => {
        // given
        const numberOfDeletedKeys = 0;
        _.forEach(AirtableDatasources, (datasource) => {
          sinon.stub(datasource, 'refreshLearningContentCacheRecords');
          datasource.refreshLearningContentCacheRecords.resolves(numberOfDeletedKeys);
        });

        // when
        const response = await cacheController.refreshCacheEntries(request, hFake);

        // then
        _.forEach(AirtableDatasources, (datasource) =>
          expect(datasource.refreshLearningContentCacheRecords).to.have.been.calledOnce,
        );
        expect(response.statusCode).to.equal(202);
      });
    });

    context('error case', () => {
      let datasourcesCount, response;

      beforeEach(async () => {
        // given
        sinon.stub(logger, 'error');
        datasourcesCount = Object.keys(AirtableDatasources).length;
        _.forEach(AirtableDatasources, (datasource) => {
          sinon.stub(datasource, 'refreshLearningContentCacheRecords');
          datasource.refreshLearningContentCacheRecords.rejects();
        });

        // when
        response = await cacheController.refreshCacheEntries(request, hFake);
      });

      it('should reply with http status 202', async () => {
        // then
        expect(response.statusCode).to.equal(202);
      });

      it('should call log errors as many times as there are datasources', async () => {
        // then
        _.forEach(AirtableDatasources, (datasource) =>
          expect(datasource.refreshLearningContentCacheRecords).to.have.been.calledOnce,
        );
        expect(logger.error.callCount).to.equal(datasourcesCount);
      });
    });

  });
});
