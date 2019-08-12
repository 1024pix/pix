const { expect, sinon, domainBuilder } = require('../../../test-helper');
const startImprovmentOfAssessment = require('../../../../lib/domain/usecases/start-improvment-of-assessment');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | UseCase | start-placement-assessment', () => {
  const assessmentRepository = {
    updateStateById: () => undefined,
  };

  beforeEach(() => {
    sinon.stub(assessmentRepository, 'updateStateById');
  });

  it('should return the assessment repository with updated state at Improving', async () => {
    // given
    const givenAssessment = domainBuilder.buildAssessment();
    const updatedAssessment = givenAssessment;
    updatedAssessment.state = Assessment.states.IMPROVING;

    assessmentRepository.updateStateById.withArgs({ id: givenAssessment.id, state: Assessment.states.IMPROVING })
      .resolves(updatedAssessment);

    // when
    const newAssessment = await startImprovmentOfAssessment({ assessmentId: givenAssessment.id, assessmentRepository });

    // then
    expect(newAssessment).to.equal(updatedAssessment);
    expect(newAssessment.state).to.equal(Assessment.states.IMPROVING);
  });

});
