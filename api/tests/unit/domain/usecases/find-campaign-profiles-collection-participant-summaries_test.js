const { expect, sinon, catchErr } = require('../../../test-helper');
const findCampaignProfilesCollectionParticipantSummaries = require('../../../../lib/domain/usecases/find-campaign-profiles-collection-participant-summaries');
const CampaignProfilesCollectionParticipantSummary = require('../../../../lib/domain/models/CampaignProfilesCollectionParticipantSummary');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-campaign-profiles-collection-participant-summaries', () => {

  const userId = Symbol('user id');
  const campaignId = Symbol('campaign id');
  const campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
  const campaignProfilesCollectionParticipantSummaryRepository = { findByCampaignId: sinon.stub() };

  const campaignProfilesCollectionParticipantSummaries = [
    new CampaignProfilesCollectionParticipantSummary({ campaignParticipationId: 1, firstName: 'Hello', lastName: 'World' })
  ];

  context('the user belongs to the organization of the campaign', () => {
    let participantSummaries;
  
    beforeEach(async () => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(true);
    });
    
    it('should retrieve the campaign participations datas', async () => {
      // given
      campaignProfilesCollectionParticipantSummaryRepository
        .findByCampaignId
        .withArgs(campaignId)
        .resolves(campaignProfilesCollectionParticipantSummaries);

      participantSummaries = await findCampaignProfilesCollectionParticipantSummaries({
        userId,
        campaignId,
        campaignRepository,
        campaignProfilesCollectionParticipantSummaryRepository,
      });

      // then
      expect(participantSummaries).to.equal(campaignProfilesCollectionParticipantSummaries);
    });
  });

  context('the user does not belong to the organization of the campaign', () => {
    beforeEach(() => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(false);
    });

    it('should throw a UserNotAuthorizedToAccessEntity error', async () => {
      const requestErr = await catchErr(findCampaignProfilesCollectionParticipantSummaries)({
        userId,
        campaignId,
        campaignRepository,
        campaignProfilesCollectionParticipantSummaryRepository,
      });
    
      expect(requestErr).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });
});
