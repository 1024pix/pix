import { targetProfileController } from '../../../../lib/application/target-profiles/target-profile-controller.js';
import { usecases as devcompUsecases } from '../../../../src/devcomp/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Controller | target-profile-controller', function () {
  describe('#findPaginatedTrainings', function () {
    it('should return trainings summaries', async function () {
      // given
      const targetProfileId = 123;
      const expectedResult = Symbol('serialized-training-summaries');
      const trainingSummaries = Symbol('trainingSummaries');
      const meta = Symbol('meta');
      const useCaseParameters = {
        targetProfileId,
        page: { size: 2, number: 1 },
      };

      sinon.stub(devcompUsecases, 'findPaginatedTargetProfileTrainingSummaries').resolves({
        trainings: trainingSummaries,
        meta,
      });

      const trainingSummarySerializer = {
        serialize: sinon.stub(),
      };
      trainingSummarySerializer.serialize.withArgs(trainingSummaries, meta).returns(expectedResult);

      // when
      const response = await targetProfileController.findPaginatedTrainings(
        {
          params: {
            id: targetProfileId,
          },
          query: {
            page: { size: 2, number: 1 },
          },
        },
        hFake,
        { trainingSummarySerializer },
      );

      // then
      expect(devcompUsecases.findPaginatedTargetProfileTrainingSummaries).to.have.been.calledWithExactly(
        useCaseParameters,
      );
      expect(response).to.deep.equal(expectedResult);
    });
  });
});
