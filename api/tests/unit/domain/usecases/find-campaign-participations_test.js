const { expect, sinon, catchErr } = require('../../../test-helper');
const findCampaignParticipations = require('../../../../lib/domain/usecases/find-campaign-participations');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-campaign-participations', () => {

  let campaignParticipationsResult;
  let requestErr;

  let options;
  let userId;
  let assessmentId;
  let campaignId;
  let campaignParticipations;

  const smartPlacementAssessmentRepository = { checkIfAssessmentBelongToUser: sinon.stub() };
  const campaignParticipationRepository = { find: sinon.stub(), findWithUsersPaginated: sinon.stub() };

  beforeEach(() => {
    options = null;
    requestErr = null;
    userId = 'dummy userId';
    assessmentId = 'dummy assessmentId';
    campaignId = 'dummy campaignId';
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

        campaignParticipationsResult = await findCampaignParticipations({ userId, options, campaignParticipationRepository, smartPlacementAssessmentRepository });
      });
      it('should check if the assessment belongs to the user', () => {
        expect(smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser).to.have.been.calledWithExactly(assessmentId, userId);
      });
      it('should find the campaign participations', () => {
        expect(campaignParticipationRepository.find).to.have.been.calledWithExactly(options);
      });
      it('should return the campaign participations', () => {
        expect(campaignParticipationsResult).to.deep.equal(campaignParticipations);
      });
    });
    context('the assessment does not belong to the user', () => {
      beforeEach(async () => {
        smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser.resolves(false);

        requestErr = await catchErr(findCampaignParticipations)({ userId, options, campaignParticipationRepository, smartPlacementAssessmentRepository });
      });
      it('should throw a UserNotAuthorizedToAccessEntity error', () => {
        expect(requestErr).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
      });
    });
  });
  context('the campaign participation is searched by campaign id', () => {
    beforeEach(async () => {
      options = { filter: { campaignId } };
      campaignParticipationRepository.findWithUsersPaginated.resolves(campaignParticipations);

      campaignParticipationsResult = await findCampaignParticipations({ userId, options, campaignParticipationRepository, smartPlacementAssessmentRepository });
    });
    it('should find the campaign participations with users paginated', () => {
      expect(campaignParticipationRepository.findWithUsersPaginated).to.have.been.calledWithExactly(options);
    });
    it('should return the campaign participations', () => {
      expect(campaignParticipationsResult).to.deep.equal(campaignParticipations);
    });
  });

});
