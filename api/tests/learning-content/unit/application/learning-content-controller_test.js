import { learningContentController } from '../../../../src/learning-content/application/learning-content-controller.js';
import { usecases } from '../../../../src/learning-content/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Learning Content | Unit | Controller | learning-content-controller', function () {
  describe('#createRelease', function () {
    it('should schedule createRelease job', async function () {
      // given
      sinon.stub(usecases, 'scheduleCreateLearningContentReleaseJob').resolves();

      // when
      await learningContentController.createRelease(
        {
          auth: {
            credentials: {
              userId: 123,
            },
          },
        },
        hFake,
      );

      // then
      expect(usecases.scheduleCreateLearningContentReleaseJob).to.have.been.calledOnce;
      expect(usecases.scheduleCreateLearningContentReleaseJob).to.have.been.calledWithExactly({ userId: 123 });
    });
  });

  describe('#patchCacheEntry', function () {
    const request = {
      params: {
        model: 'challenges',
        id: 'recId',
      },
      payload: {
        property: 'updatedValue',
      },
    };

    it('should call the usecase and return 204', async function () {
      // given
      sinon.stub(usecases, 'patchLearningContentCacheEntry');

      // when
      const response = await learningContentController.patchCacheEntry(request, hFake);

      // then
      expect(usecases.patchLearningContentCacheEntry).to.have.been.calledWithExactly({
        recordId: 'recId',
        updatedRecord: {
          property: 'updatedValue',
        },
        modelName: 'challenges',
      });
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('#refreshCache', function () {
    context('nominal case', function () {
      it('should reply with http status 202', async function () {
        // given
        sinon.stub(usecases, 'scheduleRefreshLearningContentCacheJob').resolves();

        // when
        const response = await learningContentController.refreshCache(
          {
            auth: {
              credentials: {
                userId: 123,
              },
            },
          },
          hFake,
        );

        // then
        expect(usecases.scheduleRefreshLearningContentCacheJob).to.have.been.calledOnce;
        expect(usecases.scheduleRefreshLearningContentCacheJob).to.have.been.calledWithExactly({ userId: 123 });
        expect(response.statusCode).to.equal(202);
      });
    });
  });
});
