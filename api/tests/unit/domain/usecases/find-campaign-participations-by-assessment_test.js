const { expect, sinon, catchErr } = require('../../../test-helper');
const findCampaignParticipationsByAssessment = require('../../../../lib/domain/usecases/find-campaign-participations-by-assessment');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-campaign-participations-by-assessment', () => {

  let userCampaignParticipation;
  let requestErr;

  let options;
  let userId;
  let assessmentId;
  let campaignParticipations;

  const smartPlacementAssessmentRepository = { checkIfAssessmentBelongToUser: sinon.stub() };
  const campaignParticipationRepository = { find: sinon.stub(), findWithUsersPaginated: sinon.stub() };

  beforeEach(() => {
    options = null;
    requestErr = null;
    userId = 'dummy userId';
    assessmentId = 'dummy assessmentId';
    campaignParticipations = ['some campaigns participations'];
  });

  context('the campaign participation is searched by assessment id', () => {
    beforeEach(() => {
      options = { filter: { assessmentId } };
    });
    context('the assessment belongs to the user', () => {
      beforeEach(async () => {
        smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser.resolves(true);
        campaignParticipationRepository.find.resolves(campaignParticipations);

        userCampaignParticipation = await findCampaignParticipationsByAssessment({ userId, options, campaignParticipationRepository, smartPlacementAssessmentRepository });
      });
      it('should check if the assessment belongs to the user', () => {
        expect(smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser).to.have.been.calledWithExactly(assessmentId, userId);
      });
      it('should find the campaign participations', () => {
        expect(campaignParticipationRepository.find).to.have.been.calledWithExactly(options);
      });
      it('should return the campaign participations', () => {
        expect(userCampaignParticipation).to.deep.equal(campaignParticipations);
      });
    });
    context('the assessment does not belong to the user', () => {
      beforeEach(async () => {
        smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser.resolves(false);

        requestErr = await catchErr(findCampaignParticipationsByAssessment)({ userId, options, campaignParticipationRepository, smartPlacementAssessmentRepository });
      });
      it('should throw a UserNotAuthorizedToAccessEntity error', () => {
        expect(requestErr).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
      });
    });
  });

});
