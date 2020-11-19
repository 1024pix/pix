const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { computeCampaignParticipationAnalysis } = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | compute-campaign-participation-analysis', () => {

  let campaignRepository;
  let campaignAnalysisRepository;
  let campaignParticipationRepository;
  let targetProfileWithLearningContentRepository;
  let tutorialRepository;

  const userId = 1;
  const campaignId = 'someCampaignId';
  const campaignParticipationId = 'campaignParticipationId';
  let campaignParticipation;

  beforeEach(() => {
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    campaignParticipationRepository = { get: sinon.stub() };
    campaignAnalysisRepository = { getCampaignParticipationAnalysis: sinon.stub() };
    targetProfileWithLearningContentRepository = { getByCampaignId: sinon.stub() };
    tutorialRepository = { list: sinon.stub() };

    campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId, isShared: true });
  });

  context('User has access to this result', () => {
    context('Participant has shared its results', () => {
      it('should returns two CampaignTubeRecommendations but with two skills in the same tube', async () => {
        // given
        const targetProfile = Symbol('targetProfile');
        const tutorials = Symbol('tutorials');
        const campaignParticipationAnalysis = Symbol('analysis');
        campaignParticipation.userId = userId;
        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
        campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
        targetProfileWithLearningContentRepository.getByCampaignId.withArgs({ campaignId }).resolves(targetProfile);
        tutorialRepository.list.resolves(tutorials);
        campaignAnalysisRepository.getCampaignParticipationAnalysis
          .withArgs(campaignId, campaignParticipation, targetProfile, tutorials).resolves(campaignParticipationAnalysis);

        // when
        const actualCampaignParticipationAnalysis = await computeCampaignParticipationAnalysis({
          userId,
          campaignParticipationId,
          campaignRepository,
          campaignAnalysisRepository,
          campaignParticipationRepository,
          targetProfileWithLearningContentRepository,
          tutorialRepository,
        });

        // then
        expect(actualCampaignParticipationAnalysis).to.deep.equal(campaignParticipationAnalysis);
      });
    });

    context('Participant has not shared its results', () => {
      it('should returns null', async () => {
        // given
        campaignParticipation.userId = userId;
        campaignParticipation.isShared = false;
        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
        campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);

        // when
        const actualCampaignParticipationAnalysis = await computeCampaignParticipationAnalysis({
          userId,
          campaignParticipationId,
          campaignRepository,
          campaignAnalysisRepository,
          campaignParticipationRepository,
          targetProfileWithLearningContentRepository,
          tutorialRepository,
        });

        // then
        expect(actualCampaignParticipationAnalysis).to.be.null;
      });
    });
  });

  context('User does not have access to this result', () => {
    beforeEach(() => {
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(false);
    });

    it('it should throw an UserNotAuthorizedToAccessEntity error', async () => {
      // when
      const result = await catchErr(computeCampaignParticipationAnalysis)({
        userId,
        campaignParticipationId,
        campaignRepository,
        campaignParticipationRepository,
        campaignAnalysisRepository,
        targetProfileWithLearningContentRepository,
        tutorialRepository,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

});
