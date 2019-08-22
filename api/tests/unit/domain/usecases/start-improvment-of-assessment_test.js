const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const startImprovmentOfAssessment = require('../../../../lib/domain/usecases/start-improvment-of-assessment');
const Assessment = require('../../../../lib/domain/models/Assessment');
const { AlreadySharedCampaignParticipationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | start-improvment-of-assessment', () => {
  const assessmentRepository = {
    updateStateById: () => undefined,
    get: () => undefined,
  };

  beforeEach(() => {
    sinon.stub(assessmentRepository, 'updateStateById');
    sinon.stub(assessmentRepository, 'get');
  });

  it('should return the assessment repository with updated state at Improving', async () => {
    // given
    const campaignParticipation = domainBuilder.buildCampaignParticipation({ isShared: false });
    const givenAssessment = domainBuilder.buildAssessment({ campaignParticipation });
    const updatedAssessment = givenAssessment;
    updatedAssessment.state = Assessment.states.IMPROVING;

    assessmentRepository.updateStateById.withArgs({ id: givenAssessment.id, state: 'improving' })
      .resolves(updatedAssessment);
    assessmentRepository.get.withArgs(givenAssessment.id)
      .resolves(givenAssessment);

    // when
    const newAssessment = await startImprovmentOfAssessment({ assessmentId: givenAssessment.id, assessmentRepository });

    // then
    expect(newAssessment).to.equal(updatedAssessment);
    expect(newAssessment.state).to.equal(Assessment.states.IMPROVING);
  });

  context('if campaign participation is shared', () => {
    it('should throw an error', async () => {
      // given
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ isShared: true });
      const givenAssessment = domainBuilder.buildAssessment({ campaignParticipation });
      const updatedAssessment = givenAssessment;
      updatedAssessment.state = Assessment.states.IMPROVING;

      assessmentRepository.updateStateById.withArgs({  id: givenAssessment.id, state: 'improving'  })
        .resolves(updatedAssessment);
      assessmentRepository.get.withArgs(givenAssessment.id)
        .resolves(givenAssessment);

      // when
      const requestErr = await catchErr(startImprovmentOfAssessment)({ assessmentId: givenAssessment.id, assessmentRepository });

      // then
      expect(requestErr).to.be.instanceOf(AlreadySharedCampaignParticipationError);
    });

  });
});
