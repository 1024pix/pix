import { expect, sinon, hFake } from '../../../test-helper';
import cacheController from '../../../../lib/application/cache/cache-controller';
import learningContentDatasources from '../../../../lib/infrastructure/datasources/learning-content';
import learningContentDatasource from '../../../../lib/infrastructure/datasources/learning-content/datasource';
import logger from '../../../../lib/infrastructure/logger';

describe('Unit | Controller | cache-controller', function () {
  describe('#refreshCacheEntry', function () {
    const request = {
      params: {
        model: 'challenges',
        id: 'recId',
      },
      payload: {
        property: 'updatedValue',
      },
    };

    beforeEach(function () {
      sinon.stub(learningContentDatasources.ChallengeDatasource, 'refreshLearningContentCacheRecord');
    });

    it('should reply with null when the cache key exists', async function () {
      // given
      learningContentDatasources.ChallengeDatasource.refreshLearningContentCacheRecord.resolves();

      // when
      const response = await cacheController.refreshCacheEntry(request, hFake);

      // then
      expect(
        learningContentDatasources.ChallengeDatasource.refreshLearningContentCacheRecord
      ).to.have.been.calledWithExactly('recId', { property: 'updatedValue' });
      expect(response).to.be.null;
    });

    it('should reply with null when the cache key does not exist', async function () {
      // given
      learningContentDatasources.ChallengeDatasource.refreshLearningContentCacheRecord.resolves();

      // when
      const response = await cacheController.refreshCacheEntry(request, hFake);

      // Then
      expect(
        learningContentDatasources.ChallengeDatasource.refreshLearningContentCacheRecord
      ).to.have.been.calledWithExactly('recId', { property: 'updatedValue' });
      expect(response).to.be.null;
    });
  });

  describe('#refreshCacheEntries', function () {
    const request = {};

    context('nominal case', function () {
      it('should reply with http status 202', async function () {
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

    context('error case', function () {
      let response;

      beforeEach(async function () {
        // given
        sinon.stub(logger, 'error');
        sinon.stub(learningContentDatasource, 'refreshLearningContentCacheRecords').rejects();

        // when
        response = await cacheController.refreshCacheEntries(request, hFake);
      });

      it('should reply with http status 202', async function () {
        // then
        expect(response.statusCode).to.equal(202);
      });

      it('should call log errors', async function () {
        // then
        expect(logger.error).to.have.been.calledOnce;
      });
    });
  });
});
