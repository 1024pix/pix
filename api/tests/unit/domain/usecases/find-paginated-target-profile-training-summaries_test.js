const { sinon, expect } = require('../../../test-helper');
const findTargetProfileSummariesForTraining = require('../../../../lib/domain/usecases/find-paginated-target-profile-training-summaries');

describe('Unit | UseCase | findPaginatedTargetProfileTrainingSummaries', function () {
  it('should call the repository with the right arguments and return summaries', async function () {
    // given
    const page = Symbol('page');
    const targetProfileId = Symbol('targetProfileId');
    const trainingRepository = {
      findPaginatedSummariesByTargetProfileId: sinon.stub(),
    };
    const response = { trainings: Symbol('trainingSummaries'), pagination: Symbol('pagination') };
    trainingRepository.findPaginatedSummariesByTargetProfileId.resolves(response);

    // when
    const result = await findTargetProfileSummariesForTraining({
      targetProfileId,
      page,
      trainingRepository,
    });

    // then
    expect(trainingRepository.findPaginatedSummariesByTargetProfileId).to.have.been.calledWith({
      targetProfileId,
      page,
    });
    expect(result.trainings).to.equal(response.trainings);
    expect(result.meta.pagination).to.equal(response.pagination);
  });
});
