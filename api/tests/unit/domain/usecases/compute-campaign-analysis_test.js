const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { computeCampaignAnalysis } = require('../../../../lib/domain/usecases/index.js');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');
const { FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Unit | UseCase | compute-campaign-analysis', function () {
  let campaignRepository;
  let campaignAnalysisRepository;
  let learningContentRepository;
  let tutorialRepository;

  const userId = 1;
  const campaignId = 'someCampaignId';
  const locale = FRENCH_SPOKEN;

  beforeEach(function () {
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    campaignAnalysisRepository = { getCampaignAnalysis: sinon.stub() };
    learningContentRepository = { findByCampaignId: sinon.stub() };
    tutorialRepository = { list: sinon.stub() };
  });

  context('User has access to this result', function () {
    it('should return the campaign analysis', async function () {
      // given
      const learningContent = domainBuilder.buildLearningContent();
      const campaignLearningContent = domainBuilder.buildCampaignLearningContent(learningContent);
      const tutorials = Symbol('tutorials');
      const campaignAnalysis = Symbol('analysis');
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
      learningContentRepository.findByCampaignId.withArgs(campaignId, locale).resolves(learningContent);
      tutorialRepository.list.withArgs({ locale }).resolves(tutorials);
      campaignAnalysisRepository.getCampaignAnalysis
        .withArgs(campaignId, campaignLearningContent, tutorials)
        .resolves(campaignAnalysis);

      // when
      const actualCampaignAnalysis = await computeCampaignAnalysis({
        userId,
        campaignId,
        campaignRepository,
        campaignAnalysisRepository,
        learningContentRepository,
        tutorialRepository,
        locale,
      });

      // then
      expect(actualCampaignAnalysis).to.deep.equal(campaignAnalysis);
    });
  });

  context('User has not access to this result', function () {
    beforeEach(function () {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(false);
    });

    it('should throw an UserNotAuthorizedToAccessEntityError error', async function () {
      // when
      const result = await catchErr(computeCampaignAnalysis)({
        userId,
        campaignId,
        campaignRepository,
        campaignAnalysisRepository,
        learningContentRepository,
        locale,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });
});
