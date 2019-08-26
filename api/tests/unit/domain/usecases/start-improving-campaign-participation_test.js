const { expect, sinon, domainBuilder } = require('../../../test-helper');

const Assessment = require('../../../../lib/domain/models/Assessment');
const usecases = require('../../../../lib/domain/usecases');
const { AlreadySharedCampaignParticipationError, UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | start-improving-campaign-participation', () => {

  const userId = 1;
  const oldAssessmentId = 1;
  const newAssessmentId = 2;
  const campaignParticipation = domainBuilder.buildCampaignParticipation({ userId, isShared: false, assessmentId: oldAssessmentId });
  const campaignParticipationId = campaignParticipation.id;
  const campaignParticipationRepository = { get: () => undefined, updateAssessmentIdByOldAssessmentId: () => undefined };
  const assessmentRepository = { save: () => undefined };

  beforeEach(() => {
    sinon.stub(campaignParticipationRepository, 'get');
    sinon.stub(campaignParticipationRepository, 'updateAssessmentIdByOldAssessmentId');
    sinon.stub(assessmentRepository, 'save');

    campaignParticipationRepository.get.resolves(campaignParticipation);
    campaignParticipationRepository.updateAssessmentIdByOldAssessmentId.resolves({});
    assessmentRepository.save.resolves({ id: newAssessmentId });
  });

  it('should throw an error if the campaign participation does not linked to user', () => {
    // when
    const promise = usecases.startImprovingCampaignParticipation({ campaignParticipationId, userId: 2, campaignParticipationRepository, assessmentRepository });

    // then
    return expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntity);
  });

  it('should throw an error if the campaign participation is shared', () => {
    // given
    const campaignParticipationShared = domainBuilder.buildCampaignParticipation({ userId, isShared: true });
    campaignParticipationRepository.get.resolves(campaignParticipationShared);

    // when
    const promise = usecases.startImprovingCampaignParticipation({ campaignParticipationId, userId , campaignParticipationRepository, assessmentRepository });

    // then
    return expect(promise).to.be.rejectedWith(AlreadySharedCampaignParticipationError);
  });

  it('should create a smart placement assessment with the campaignParticipationId and isImproving at true', () => {
    // given
    assessmentRepository.save.resolves({});

    // when
    const promise = usecases.startImprovingCampaignParticipation({ campaignParticipationId, userId , campaignParticipationRepository, assessmentRepository });

    // then
    return promise.then(() => {
      expect(assessmentRepository.save).to.have.been.called;

      const assessmentToSave = assessmentRepository.save.firstCall.args[0];
      expect(assessmentToSave.type).to.equal(Assessment.types.SMARTPLACEMENT);
      expect(assessmentToSave.state).to.equal(Assessment.states.STARTED);
      expect(assessmentToSave.userId).to.equal(userId);
      expect(assessmentToSave.courseId).to.equal('Smart Placement Tests CourseId Not Used');
      expect(assessmentToSave.campaignParticipationId).to.equal(campaignParticipationId);
      expect(assessmentToSave.isImproving).to.be.ok;
    });
  });

  it('should updated the campaign participation with new assessmentId', () => {
    // when
    const promise = usecases.startImprovingCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository });

    // then
    return promise.then(() => {
      expect(campaignParticipationRepository.updateAssessmentIdByOldAssessmentId).to.have.been.calledWith({
        oldAssessmentId,
        newAssessmentId
      });
    });
  });

});
