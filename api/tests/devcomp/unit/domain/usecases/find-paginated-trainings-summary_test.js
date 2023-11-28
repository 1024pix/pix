import { expect, sinon } from '../../../../test-helper.js';
import { findPaginatedTrainingSummaries } from '../../../../../src/devcomp/domain/usecases/find-paginated-training-summaries.js';

describe('Unit | Devcomp | Domain | UseCases | find-paginated-training-summaries', function () {
  it('should find filtered training summaries with pagination', async function () {
    // given
    const filter = { id: 1 };
    const page = { number: 1, size: 2 };

    const trainingRepository = {
      findPaginatedSummaries: sinon.stub(),
    };

    const resolvedPagination = Symbol('pagination');
    const trainingSummaries = Symbol('training-summaries');

    trainingRepository.findPaginatedSummaries.resolves({
      trainings: trainingSummaries,
      pagination: resolvedPagination,
    });

    // when
    const response = await findPaginatedTrainingSummaries({ filter, page, trainingRepository });

    // then
    expect(trainingRepository.findPaginatedSummaries).to.have.been.calledWithExactly({ filter, page });
    expect(response.trainings).to.equal(trainingSummaries);
    expect(response.meta.pagination).to.equal(resolvedPagination);
  });
});
