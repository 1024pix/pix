const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { computeCampaignParticipationAnalysis } = require('../../../../lib/domain/usecases/index.js');
const {
  UserNotAuthorizedToAccessEntityError,
  CampaignParticipationDeletedError,
} = require('../../../../lib/domain/errors');
const CampaignParticipationStatuses = require('../../../../lib/domain/models/CampaignParticipationStatuses');
const { FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

const { TO_SHARE } = CampaignParticipationStatuses;

describe('Unit | UseCase | compute-campaign-participation-analysis', function () {
  let campaignRepository;
  let campaignAnalysisRepository;
  let campaignParticipationRepository;
  let learningContentRepository;
  let tutorialRepository;

  const userId = 1;
  const campaignId = 'someCampaignId';
  const campaignParticipationId = 'campaignParticipationId';
  let campaignParticipation;
  const locale = FRENCH_SPOKEN;

  beforeEach(function () {
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    campaignParticipationRepository = { get: sinon.stub() };
    campaignAnalysisRepository = { getCampaignParticipationAnalysis: sinon.stub() };
    learningContentRepository = { findByCampaignId: sinon.stub() };
    tutorialRepository = { list: sinon.stub() };

    const campaign = domainBuilder.buildCampaign({ id: campaignId });
    campaignParticipation = domainBuilder.buildCampaignParticipation({ campaign });
  });

  context('User has access to this result', function () {
    context('Participant has shared its results', function () {
      it('should returns two CampaignTubeRecommendations but with two skills in the same tube', async function () {
        // given
        const learningContent = domainBuilder.buildLearningContent();
        const campaignLearningContent = domainBuilder.buildCampaignLearningContent(learningContent);
        const tutorials = Symbol('tutorials');
        const campaignParticipationAnalysis = Symbol('analysis');
        campaignParticipation.userId = userId;
        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
        campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
        learningContentRepository.findByCampaignId.withArgs(campaignId, locale).resolves(learningContent);
        tutorialRepository.list.withArgs({ locale }).resolves(tutorials);
        campaignAnalysisRepository.getCampaignParticipationAnalysis
          .withArgs(campaignId, campaignParticipation, campaignLearningContent, tutorials)
          .resolves(campaignParticipationAnalysis);

        // when
        const actualCampaignParticipationAnalysis = await computeCampaignParticipationAnalysis({
          userId,
          campaignParticipationId,
          campaignRepository,
          campaignAnalysisRepository,
          campaignParticipationRepository,
          learningContentRepository,
          tutorialRepository,
          locale,
        });

        // then
        expect(actualCampaignParticipationAnalysis).to.deep.equal(campaignParticipationAnalysis);
      });
    });

    context('Participation is deleted', function () {
      it('should throw a CampaignParticipationDeletedError', async function () {
        // given
        const campaign = domainBuilder.buildCampaign({ id: campaignId });
        campaignParticipation = domainBuilder.buildCampaignParticipation({
          campaign,
          deletedAt: new Date('2022-01-01'),
          userId,
        });

        campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
        campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);

        // when
        const error = await catchErr(computeCampaignParticipationAnalysis)({
          userId,
          campaignParticipationId,
          campaignRepository,
          campaignAnalysisRepository,
          campaignParticipationRepository,
          learningContentRepository,
          tutorialRepository,
          locale,
        });

        // then
        expect(error).to.be.instanceOf(CampaignParticipationDeletedError);
      });
    });

    context('Participant has not shared its results', function () {
      it('should returns null', async function () {
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
          learningContentRepository,
          tutorialRepository,
          locale,
        });

        // then
        expect(actualCampaignParticipationAnalysis).to.be.null;
      });
    });
  });

  context('User does not have access to this result', function () {
    beforeEach(function () {
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(false);
    });

    it('should throw an UserNotAuthorizedToAccessEntityError error', async function () {
      // when
      const result = await catchErr(computeCampaignParticipationAnalysis)({
        userId,
        campaignParticipationId,
        campaignRepository,
        campaignParticipationRepository,
        campaignAnalysisRepository,
        learningContentRepository,
        tutorialRepository,
        locale,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });
});
