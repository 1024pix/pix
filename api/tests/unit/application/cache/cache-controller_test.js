const { expect, sinon, hFake } = require('../../../test-helper');
const cacheController = require('../../../../lib/application/cache/cache-controller');
const learningContentDatasources = require('../../../../lib/infrastructure/datasources/learning-content');
const learningContentDatasource = require('../../../../lib/infrastructure/datasources/learning-content/datasource');
const logger = require('../../../../lib/infrastructure/logger');

describe('Unit | Controller | cache-controller', () => {

  describe('#refreshCacheEntry', () => {

    const request = {
      params: {
        cachekey: 'Epreuves_recABCDEF',
      },
    };

    beforeEach(() => {
      sinon.stub(learningContentDatasources.ChallengeDatasource, 'refreshLearningContentCacheRecord');
    });

    it('should reply with null when the cache key exists', async () => {
      // given
      const numberOfDeletedKeys = 1;
      learningContentDatasources.ChallengeDatasource.refreshLearningContentCacheRecord.resolves(numberOfDeletedKeys);

      // when
      const response = await cacheController.refreshCacheEntry(request, hFake);

      // then
      expect(learningContentDatasources.ChallengeDatasource.refreshLearningContentCacheRecord).to.have.been.calledWithExactly('recABCDEF');
      expect(response).to.be.null;
    });

    it('should reply with null when the cache key does not exist', async () => {
      // given
      const numberOfDeletedKeys = 0;
      learningContentDatasources.ChallengeDatasource.refreshLearningContentCacheRecord.resolves(numberOfDeletedKeys);

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
        sinon.stub(learningContentDatasource, 'refreshLearningContentCacheRecords').resolves(numberOfDeletedKeys);

        // when
        const response = await cacheController.refreshCacheEntries(request, hFake);

        // then
        expect(learningContentDatasource.refreshLearningContentCacheRecords).to.have.been.calledOnce;
        expect(response.statusCode).to.equal(202);
      });
    });

    context('error case', () => {
      let response;

      beforeEach(async () => {
        // given
        sinon.stub(logger, 'error');
        sinon.stub(learningContentDatasource, 'refreshLearningContentCacheRecords').rejects();

        // when
        response = await cacheController.refreshCacheEntries(request, hFake);
      });

      it('should reply with http status 202', async () => {
        // then
        expect(response.statusCode).to.equal(202);
      });

      it('should call log errors', async () => {
        // then
        expect(logger.error).to.have.been.calledOnce;
      });
    });

  });
});
