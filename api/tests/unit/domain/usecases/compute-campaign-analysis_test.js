const { expect, sinon, catchErr } = require('../../../test-helper');
const { computeCampaignAnalysis } = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');
const { FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Unit | UseCase | compute-campaign-analysis', () => {

  let campaignRepository;
  let campaignAnalysisRepository;
  let targetProfileWithLearningContentRepository;
  let tutorialRepository;

  const userId = 1;
  const campaignId = 'someCampaignId';
  const locale = FRENCH_SPOKEN;

  beforeEach(() => {
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    campaignAnalysisRepository = { getCampaignAnalysis: sinon.stub() };
    targetProfileWithLearningContentRepository = { getByCampaignId: sinon.stub() };
    tutorialRepository = { list: sinon.stub() };
  });

  context('User has access to this result', () => {
    it('should return the campaign analysis', async () => {
      // given
      const targetProfile = Symbol('targetProfile');
      const tutorials = Symbol('tutorials');
      const campaignAnalysis = Symbol('analysis');
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
      targetProfileWithLearningContentRepository.getByCampaignId.withArgs({ campaignId, locale }).resolves(targetProfile);
      tutorialRepository.list.withArgs({ locale }).resolves(tutorials);
      campaignAnalysisRepository.getCampaignAnalysis.withArgs(campaignId, targetProfile, tutorials).resolves(campaignAnalysis);

      // when
      const actualCampaignAnalysis = await computeCampaignAnalysis({
        userId,
        campaignId,
        campaignRepository,
        campaignAnalysisRepository,
        targetProfileWithLearningContentRepository,
        tutorialRepository,
        locale,
      });

      // then
      expect(actualCampaignAnalysis).to.deep.equal(campaignAnalysis);
    });
  });

  context('User has not access to this result', () => {
    beforeEach(() => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(false);
    });

    it('should throw an UserNotAuthorizedToAccessEntityError error', async () => {
      // when
      const result = await catchErr(computeCampaignAnalysis)({
        userId,
        campaignId,
        campaignRepository,
        campaignAnalysisRepository,
        targetProfileWithLearningContentRepository,
        locale,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });

});
