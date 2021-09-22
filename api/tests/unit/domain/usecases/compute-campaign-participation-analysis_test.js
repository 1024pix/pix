const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { computeCampaignParticipationAnalysis } = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');
const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const { FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

const { TO_SHARE } = CampaignParticipation.statuses;

describe('Unit | UseCase | compute-campaign-participation-analysis', function() {

  let campaignRepository;
  let campaignAnalysisRepository;
  let campaignParticipationRepository;
  let targetProfileWithLearningContentRepository;
  let tutorialRepository;

  const userId = 1;
  const campaignId = 'someCampaignId';
  const campaignParticipationId = 'campaignParticipationId';
  let campaignParticipation;
  const locale = FRENCH_SPOKEN;

  beforeEach(function() {
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    campaignParticipationRepository = { get: sinon.stub() };
    campaignAnalysisRepository = { getCampaignParticipationAnalysis: sinon.stub() };
    targetProfileWithLearningContentRepository = { getByCampaignId: sinon.stub() };
    tutorialRepository = { list: sinon.stub() };

    campaignParticipation = domainBuilder.buildCampaignParticipation({ campaignId, isShared: true });
  });

  context('User has access to this result', function() {
    context('Participant has shared its results', function() {
      it('should returns two CampaignTubeRecommendations but with two skills in the same tube', async function() {
        // given
        const targetProfile = Symbol('targetProfile');
        const tutorials = Symbol('tutorials');
        const campaignParticipationAnalysis = Symbol('analysis');
        campaignParticipation.userId = userId;
        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
        campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
        targetProfileWithLearningContentRepository.getByCampaignId.withArgs({ campaignId, locale }).resolves(targetProfile);
        tutorialRepository.list.withArgs({ locale }).resolves(tutorials);
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
          locale,
        });

        // then
        expect(actualCampaignParticipationAnalysis).to.deep.equal(campaignParticipationAnalysis);
      });
    });

    context('Participant has not shared its results', function() {
      it('should returns null', async function() {
        // given
        campaignParticipation.userId = userId;
        campaignParticipation.status = TO_SHARE;
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
          locale,
        });

        // then
        expect(actualCampaignParticipationAnalysis).to.be.null;
      });
    });
  });

  context('User does not have access to this result', function() {
    beforeEach(function() {
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(false);
    });

    it('should throw an UserNotAuthorizedToAccessEntityError error', async function() {
      // when
      const result = await catchErr(computeCampaignParticipationAnalysis)({
        userId,
        campaignParticipationId,
        campaignRepository,
        campaignParticipationRepository,
        campaignAnalysisRepository,
        targetProfileWithLearningContentRepository,
        tutorialRepository,
        locale,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });

});
