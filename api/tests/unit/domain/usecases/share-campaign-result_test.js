const { sinon, expect, domainBuilder } = require('../../../test-helper');
const { NotFoundError, UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const usecases = require('../../../../lib/domain/usecases');
const smartRandom = require('../../../../lib/domain/services/smart-random/smart-random');
const dataFetcher = require('../../../../lib/domain/services/smart-random/data-fetcher');

describe('Unit | UseCase | share-campaign-result', () => {

  let user;
  let userId;
  let assessment;
  let assessmentId;
  let campaignParticipation;
  let expectedCampaignParticipation;
  const campaignParticipationRepository = {
    updateCampaignParticipation() {
    },
    get() {
    },
  };
  const smartPlacementAssessmentRepository = {
    checkIfAssessmentBelongToUser() {
    },
  };

  beforeEach(() => {
    user = domainBuilder.buildUser();
    userId = user.id;
    assessment = domainBuilder.buildSmartPlacementAssessment({ userId: userId });
    assessmentId = assessment.id;
    campaignParticipation = domainBuilder.buildCampaignParticipation({ assessmentId });

    sinon.stub(smartPlacementAssessmentRepository, 'checkIfAssessmentBelongToUser');
    sinon.stub(campaignParticipationRepository, 'get').resolves();
    sinon.stub(dataFetcher, 'fetchForCampaigns').resolves();
    sinon.stub(smartRandom, 'getNextChallenge').returns({ assessmentEnded: true });
  });

  context('when the share request comes from the owner of the assessment', () => {

    beforeEach(() => {
      smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser.resolves(true);
    });

    context('when the assessmentId is in the database', () => {

      beforeEach(() => {
        campaignParticipationRepository.get.resolves(campaignParticipation);

        expectedCampaignParticipation = domainBuilder.buildCampaignParticipation({
          assessmentId: campaignParticipation.assessmentId,
          campaignId: campaignParticipation.campaignId,
          isShared: true
        });

        sinon.stub(campaignParticipationRepository, 'updateCampaignParticipation')
          .resolves(expectedCampaignParticipation);
      });

      it('should return a modified campaign participation', () => {
        // when
        const promise = usecases.shareCampaignResult({
          userId,
          assessmentId,
          campaignParticipationRepository,
          smartPlacementAssessmentRepository,
        });

        // then
        return promise.then((result) => {
          expect(result).to.deep.equal(expectedCampaignParticipation);
        });
      });
    });

    context('when the assessmentId is not in the database', () => {

      beforeEach(() => {
        campaignParticipationRepository.get.rejects(new NotFoundError());
      });

      it('should reject with a Not Found Error', () => {
        // when
        const promise = usecases.shareCampaignResult({
          userId,
          assessmentId,
          campaignParticipationRepository,
          smartPlacementAssessmentRepository,
        });

        // then
        return expect(promise).to.have.been.rejectedWith(NotFoundError);
      });
    });
  });

  context('when the share request does not come from the owner of the assessment', () => {

    beforeEach(() => {
      campaignParticipationRepository.get.resolves(campaignParticipation);
      smartPlacementAssessmentRepository.checkIfAssessmentBelongToUser.resolves(false);
    });

    it('should reject an UserNotAuthorizedToAccessEntity error', () => {
      // given
      const wrongUserId = userId + 1;

      // when
      const promise = usecases.shareCampaignResult({
        userId: wrongUserId,
        assessmentId,
        campaignParticipationRepository,
        smartPlacementAssessmentRepository,
      });

      // then
      return expect(promise).to.have.been.rejectedWith(UserNotAuthorizedToAccessEntity);
    });

  });

});
