const { expect, sinon, catchErr } = require('../../../test-helper');
const { computeCampaignCollectiveResult } = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | compute-campaign-collective-result', () => {
  const userId = 1;
  const campaignId = 'someCampaignId';
  let campaignRepository;
  let campaignCollectiveResultRepository;
  let targetProfileWithLearningContentRepository;
  const targetProfileWithLearningContent = Symbol('targetProfileWithLearningContent');
  const locale = 'fr';

  beforeEach(() => {
    campaignCollectiveResultRepository = { getCampaignCollectiveResult: sinon.stub() };
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    targetProfileWithLearningContentRepository = { getByCampaignId: sinon.stub() };
  });

  context('User has access to this result', () => {

    beforeEach(() => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
      targetProfileWithLearningContentRepository.getByCampaignId.withArgs({ campaignId, locale }).resolves(targetProfileWithLearningContent);
    });

    it('should resolve a CampaignCollectiveResult', async () => {
      // given
      const expectedCampaignCollectiveResult = Symbol('campaignCollectiveResult');
      campaignCollectiveResultRepository.getCampaignCollectiveResult.withArgs(campaignId, targetProfileWithLearningContent).resolves(expectedCampaignCollectiveResult);

      // when
      const actualCampaignCollectiveResult = await computeCampaignCollectiveResult({
        userId,
        campaignId,
        campaignRepository,
        campaignCollectiveResultRepository,
        targetProfileWithLearningContentRepository,
        locale,
      });

      // then
      expect(targetProfileWithLearningContentRepository.getByCampaignId).to.have.been.calledOnce;
      expect(actualCampaignCollectiveResult).to.equal(expectedCampaignCollectiveResult);
    });
  });

  context('User does not belong to the organization', () => {
    beforeEach(() => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(false);
    });

    it('should throw an UserNotAuthorizedToAccessEntityError error', async () => {
      // when
      const result = await catchErr(computeCampaignCollectiveResult)({
        userId,
        campaignId,
        campaignRepository,
        campaignCollectiveResultRepository,
        targetProfileWithLearningContentRepository,
        locale,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });

});
