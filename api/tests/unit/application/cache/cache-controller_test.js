import { expect, sinon, hFake } from '../../../test-helper.js';
import { cacheController } from '../../../../lib/application/cache/cache-controller.js';
import * as learningContentDatasources from '../../../../lib/infrastructure/datasources/learning-content/index.js';
import { logger } from '../../../../lib/infrastructure/logger.js';

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
      sinon.stub(learningContentDatasources.challengeDatasource, 'refreshLearningContentCacheRecord');
    });

    it('should reply with null when the cache key exists', async function () {
      // given
      learningContentDatasources.challengeDatasource.refreshLearningContentCacheRecord.resolves();

      // when
      const response = await cacheController.refreshCacheEntry(request, hFake);

      // then
      expect(
        learningContentDatasources.challengeDatasource.refreshLearningContentCacheRecord,
      ).to.have.been.calledWithExactly('recId', { property: 'updatedValue' });
      expect(response.statusCode).to.equal(204);
    });

    it('should reply with null when the cache key does not exist', async function () {
      // given
      learningContentDatasources.challengeDatasource.refreshLearningContentCacheRecord.resolves();

      // when
      const response = await cacheController.refreshCacheEntry(request, hFake);

      // Then
      expect(
        learningContentDatasources.challengeDatasource.refreshLearningContentCacheRecord,
      ).to.have.been.calledWithExactly('recId', { property: 'updatedValue' });
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('#refreshCacheEntries', function () {
    const request = {};
    let learningContentDatasourceStub;

    beforeEach(function () {
      learningContentDatasourceStub = { refreshLearningContentCacheRecords: sinon.stub() };
    });

    context('nominal case', function () {
      it('should reply with http status 202', async function () {
        // given
        const numberOfDeletedKeys = 0;
        learningContentDatasourceStub.refreshLearningContentCacheRecords.resolves(numberOfDeletedKeys);

        // when
        const response = await cacheController.refreshCacheEntries(request, hFake, {
          learningContentDatasource: learningContentDatasourceStub,
        });

        // then
        expect(learningContentDatasourceStub.refreshLearningContentCacheRecords).to.have.been.calledOnce;
        expect(response.statusCode).to.equal(202);
      });
    });

    context('error case', function () {
      let response;

      beforeEach(async function () {
        // given
        sinon.stub(logger, 'error');
        learningContentDatasourceStub.refreshLearningContentCacheRecords.rejects();

        // when
        response = await cacheController.refreshCacheEntries(request, hFake, {
          learningContentDatasource: learningContentDatasourceStub,
        });
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
