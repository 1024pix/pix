import sinon from 'sinon';

import { findParticipationDataset } from '../../../../../src/maddo/domain/usecases/find-participation-dataset.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Maddo | Domain | Usecase | Find participation dataset', function () {
  it('delegates to the repository and returns its result', async function () {
    // given
    const page = { number: 1, size: 10 };
    const expectedResult = {
      models: [],
      meta: { page: 1, pageSize: 10, pageCount: 0 },
    };
    const participationDatasetRepository = {
      findAll: sinon.stub().resolves(expectedResult),
    };

    // when
    const result = await findParticipationDataset({
      page,
      participationDatasetRepository,
    });

    // then
    expect(participationDatasetRepository.findAll).to.have.been.calledOnceWith({
      page,
    });
    expect(result).to.deep.equal(expectedResult);
  });
});
