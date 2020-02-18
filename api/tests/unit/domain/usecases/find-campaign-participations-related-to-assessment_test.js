const { expect, sinon, catchErr } = require('../../../test-helper');
const findCampaignParticipationsRelatedToAssessment = require('../../../../lib/domain/usecases/find-campaign-participations-related-to-assessment');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-campaign-participations-related-to-assessment', () => {

  let userCampaignParticipation;
  let requestErr;

  let userId;
  let assessmentId;
  let campaignParticipations;

  const smartPlacementAssessmentRepository = { doesAssessmentBelongToUser: sinon.stub() };
  const campaignParticipationRepository = { findByAssessmentId: sinon.stub() };

  beforeEach(() => {
    requestErr = null;
    userId = 'dummy userId';
    assessmentId = 'dummy assessmentId';
    campaignParticipations = ['some campaigns participations'];
  });

  context('the campaign participation is searched by assessment id', () => {

    context('the assessment belongs to the user', () => {
      beforeEach(async () => {
        smartPlacementAssessmentRepository.doesAssessmentBelongToUser.resolves(true);
        campaignParticipationRepository.findByAssessmentId.resolves(campaignParticipations);

        userCampaignParticipation = await findCampaignParticipationsRelatedToAssessment({ userId, assessmentId, campaignParticipationRepository, smartPlacementAssessmentRepository });
      });
      it('should check if the assessment belongs to the user', () => {
        expect(smartPlacementAssessmentRepository.doesAssessmentBelongToUser).to.have.been.calledWithExactly(assessmentId, userId);
      });
      it('should find the campaign participations', () => {
        expect(campaignParticipationRepository.findByAssessmentId).to.have.been.calledWithExactly(assessmentId);
      });
      it('should return the campaign participations', () => {
        expect(userCampaignParticipation).to.deep.equal(campaignParticipations);
      });
    });
    context('the assessment does not belong to the user', () => {
      beforeEach(async () => {
        smartPlacementAssessmentRepository.doesAssessmentBelongToUser.resolves(false);

        requestErr = await catchErr(findCampaignParticipationsRelatedToAssessment)({ userId, assessmentId, campaignParticipationRepository, smartPlacementAssessmentRepository });
      });
      it('should throw a UserNotAuthorizedToAccessEntity error', () => {
        expect(requestErr).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
      });
    });
  });

});
