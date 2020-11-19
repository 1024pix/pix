const { expect, sinon, catchErr } = require('../../../test-helper');
const { computeCampaignAnalysis } = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | compute-campaign-analysis', () => {

  let campaignRepository;
  let campaignAnalysisRepository;
  let targetProfileWithLearningContentRepository;
  let tutorialRepository;

  const userId = 1;
  const campaignId = 'someCampaignId';

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
      targetProfileWithLearningContentRepository.getByCampaignId.withArgs({ campaignId }).resolves(targetProfile);
      tutorialRepository.list.resolves(tutorials);
      campaignAnalysisRepository.getCampaignAnalysis.withArgs(campaignId, targetProfile, tutorials).resolves(campaignAnalysis);

      // when
      const actualCampaignAnalysis = await computeCampaignAnalysis({
        userId,
        campaignId,
        campaignRepository,
        campaignAnalysisRepository,
        targetProfileWithLearningContentRepository,
        tutorialRepository,
      });

      // then
      expect(actualCampaignAnalysis).to.deep.equal(campaignAnalysis);
    });
  });

  context('User has not access to this result', () => {
    beforeEach(() => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(false);
    });

    it('it should throw an UserNotAuthorizedToAccessEntity error', async () => {
      // when
      const result = await catchErr(computeCampaignAnalysis)({
        userId,
        campaignId,
        campaignRepository,
        campaignAnalysisRepository,
        targetProfileWithLearningContentRepository,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

});
