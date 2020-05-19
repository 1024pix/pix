const { expect, sinon, catchErr } = require('../../../test-helper');
const findCampaignProfilesCollectionParticipationSummaries = require('../../../../lib/domain/usecases/find-campaign-profiles-collection-participation-summaries');
const CampaignProfilesCollectionParticipationSummary = require('../../../../lib/domain/models/CampaignProfilesCollectionParticipationSummary');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-campaign-profiles-collection-participation-summaries', () => {

  const userId = Symbol('user id');
  const campaignId = Symbol('campaign id');
  const campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
  const CampaignProfilesCollectionParticipationSummaryRepository = { findByCampaignId: sinon.stub() };

  const campaignProfilesCollectionParticipationSummaries = [
    new CampaignProfilesCollectionParticipationSummary({ campaignParticipationId: 1, firstName: 'Hello', lastName: 'World' })
  ];

  context('the user belongs to the organization of the campaign', () => {
    let participationSummaries;

    beforeEach(async () => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(true);
    });

    it('should retrieve the campaign participations datas', async () => {
      // given
      CampaignProfilesCollectionParticipationSummaryRepository
        .findByCampaignId
        .withArgs(campaignId)
        .resolves(campaignProfilesCollectionParticipationSummaries);

      participationSummaries = await findCampaignProfilesCollectionParticipationSummaries({
        userId,
        campaignId,
        campaignRepository,
        CampaignProfilesCollectionParticipationSummaryRepository,
      });

      // then
      expect(participationSummaries).to.equal(campaignProfilesCollectionParticipationSummaries);
    });
  });

  context('the user does not belong to the organization of the campaign', () => {
    beforeEach(() => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(false);
    });

    it('should throw a UserNotAuthorizedToAccessEntity error', async () => {
      const requestErr = await catchErr(findCampaignProfilesCollectionParticipationSummaries)({
        userId,
        campaignId,
        campaignRepository,
        CampaignProfilesCollectionParticipationSummaryRepository,
      });

      expect(requestErr).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });
});
