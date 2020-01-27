const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { computeCampaignCollectiveResult } = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | compute-campaign-collective-result', () => {
  const userId = 1;
  const campaignId = 'someCampaignId';
  let campaignRepository;
  let campaignCollectiveResultRepository;
  let competenceRepository;
  const expectedCompetences = [];

  beforeEach(() => {
    campaignCollectiveResultRepository = { getCampaignCollectiveResult: sinon.stub() };
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    competenceRepository = { list: sinon.stub() };
  });

  context('User has access to this result', () => {

    beforeEach(() => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
      competenceRepository.list.resolves(expectedCompetences);
    });

    it('should resolve a CampaignCollectiveResult', async () => {
      // given
      const expectedCampaignCollectiveResult = domainBuilder.buildCampaignCollectiveResult();
      campaignCollectiveResultRepository.getCampaignCollectiveResult.withArgs(campaignId, expectedCompetences).resolves(expectedCampaignCollectiveResult);

      // when
      const actualCampaignCollectiveResult = await computeCampaignCollectiveResult({
        userId,
        campaignId,
        campaignRepository,
        campaignCollectiveResultRepository,
        competenceRepository,
      });

      // then
      expect(competenceRepository.list).to.have.been.calledOnce;
      expect(actualCampaignCollectiveResult).to.equal(expectedCampaignCollectiveResult);
    });
  });

  context('User does not belong to the organization', () => {
    beforeEach(() => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(false);
    });

    it('it should throw an UserNotAuthorizedToAccessEntity error', async () => {
      // when
      const result = await catchErr(computeCampaignCollectiveResult)({
        userId,
        campaignId,
        campaignRepository,
        campaignCollectiveResultRepository,
        competenceRepository,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });

});
