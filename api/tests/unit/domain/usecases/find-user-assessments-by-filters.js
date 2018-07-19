const { expect, sinon } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | find-user-assessments-by-filters', () => {

  const assessmentRepository = {
    findByFilters: () => {
    }
  };

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(assessmentRepository, 'findByFilters').resolves();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should resolve assessments that match filters and belong to the user', () => {
    // given
    const userId = 1234;
    const filters = { type: 'SMART_PLACEMENT' };
    const expectedFilters = { type: 'SMART_PLACEMENT', userId };

    // when
    const promise = usecases.findUserAssessmentsByFilters({ userId, filters, assessmentRepository });

    // then
    return promise.then(() => {
      expect(assessmentRepository.findByFilters).to.have.been.calledWithExactly(expectedFilters);
    });
  });
});
