import { expect, sinon } from '../../../test-helper';
import findPaginatedTrainingSummaries from '../../../../lib/domain/usecases/find-paginated-training-summaries';

describe('Unit | UseCase | find-paginated-training-summaries', function () {
  it('should find all training summaries with pagination', async function () {
    // given
    const page = { number: 1, size: 2 };

    const trainingRepository = {
      findPaginatedSummaries: sinon.stub(),
    };

    const resolvedPagination = Symbol('pagination');
    const trainingSummaries = Symbol('training-summaries');

    trainingRepository.findPaginatedSummaries
      .withArgs({ page })
      .resolves({ trainings: trainingSummaries, pagination: resolvedPagination });

    // when
    const response = await findPaginatedTrainingSummaries({ page, trainingRepository });

    // then
    expect(trainingRepository.findPaginatedSummaries).to.have.been.calledWithExactly({ page });
    expect(response.trainings).to.equal(trainingSummaries);
    expect(response.meta.pagination).to.equal(resolvedPagination);
  });
});
