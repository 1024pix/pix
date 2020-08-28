const { expect, sinon, catchErr } = require('../../../test-helper');
const findCampaignParticipationsRelatedToAssessment = require('../../../../lib/domain/usecases/find-campaign-participations-related-to-assessment');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-campaign-participations-related-to-assessment', () => {

  let userCampaignParticipation;
  let requestErr;

  let userId;
  let assessmentId;
  let campaignParticipations;

  const assessmentRepository = { ownedByUser: sinon.stub() };
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
        assessmentRepository.ownedByUser.withArgs({ id: assessmentId, userId }).resolves(true);
        campaignParticipationRepository.findByAssessmentId.resolves(campaignParticipations);

        userCampaignParticipation = await findCampaignParticipationsRelatedToAssessment({ userId, assessmentId, campaignParticipationRepository, assessmentRepository });
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
        assessmentRepository.ownedByUser.withArgs({ id: assessmentId, userId }).resolves(false);

        requestErr = await catchErr(findCampaignParticipationsRelatedToAssessment)({ userId, assessmentId, campaignParticipationRepository, assessmentRepository });
      });
      it('should throw a UserNotAuthorizedToAccessEntity error', () => {
        expect(requestErr).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
      });
    });
  });

});
