const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { computeCampaignCollectiveResult } = require('../../../../lib/domain/usecases/index.js');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | compute-campaign-collective-result', function () {
  const userId = 1;
  const campaignId = 'someCampaignId';
  let campaignRepository;
  let campaignCollectiveResultRepository;
  let learningContentRepository;
  let learningContent;
  let campaignLearningContent;
  const locale = 'fr';

  beforeEach(function () {
    learningContent = domainBuilder.buildLearningContent();
    campaignLearningContent = domainBuilder.buildCampaignLearningContent(learningContent);
    campaignCollectiveResultRepository = { getCampaignCollectiveResult: sinon.stub() };
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    learningContentRepository = { findByCampaignId: sinon.stub() };
  });

  context('User has access to this result', function () {
    beforeEach(function () {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
      learningContentRepository.findByCampaignId.withArgs(campaignId, locale).resolves(learningContent);
    });

    it('should resolve a CampaignCollectiveResult', async function () {
      // given
      const expectedCampaignCollectiveResult = Symbol('campaignCollectiveResult');
      campaignCollectiveResultRepository.getCampaignCollectiveResult
        .withArgs(campaignId, campaignLearningContent)
        .resolves(expectedCampaignCollectiveResult);

      // when
      const actualCampaignCollectiveResult = await computeCampaignCollectiveResult({
        userId,
        campaignId,
        campaignRepository,
        campaignCollectiveResultRepository,
        learningContentRepository,
        locale,
      });

      // then
      expect(learningContentRepository.findByCampaignId).to.have.been.calledOnce;
      expect(actualCampaignCollectiveResult).to.equal(expectedCampaignCollectiveResult);
    });
  });

  context('User does not belong to the organization', function () {
    beforeEach(function () {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(false);
    });

    it('should throw an UserNotAuthorizedToAccessEntityError error', async function () {
      // when
      const result = await catchErr(computeCampaignCollectiveResult)({
        userId,
        campaignId,
        campaignRepository,
        campaignCollectiveResultRepository,
        learningContentRepository,
        locale,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });
});
