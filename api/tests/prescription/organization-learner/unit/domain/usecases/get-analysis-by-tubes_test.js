import sinon from 'sinon';

import { getAnalysisByTubes } from '../../../../../../src/prescription/organization-learner/domain/usecases/get-analysis-by-tubes.js';

describe('Unit | UseCase | get-analysis-by-tubes', function () {
  it('should call findByTubes method from analysis repository', async function () {
    // given
    const organizationId = Symbol('organizationId');
    const expectedRepositoryResult = Symbol('expectedRepositoryResult');
    const analysisRepository = {
      findByTubes: sinon.stub(),
    };

    analysisRepository.findByTubes.withArgs({ organizationId }).resolves(expectedRepositoryResult);

    // when
    await getAnalysisByTubes({
      organizationId,
      analysisRepository,
    });

    // then
    expect(analysisRepository.findByTubes).to.have.been.called;
  });
});
