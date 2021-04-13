const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const getCampaignParticipation = require('../../../../lib/domain/usecases/get-campaign-participation');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-campaign-participation', () => {

  const options = {};

  let campaignParticipationRepository, campaignRepository;

  beforeEach(() => {
    campaignParticipationRepository = {
      get: sinon.stub(),
    };
    campaignRepository = {
      checkIfUserOrganizationHasAccessToCampaign: sinon.stub(),
    };
  });

  context('when user is the user of the campaignParticipation', () => {

    it('should get the campaignParticipation', async () => {
      // given
      const campaignParticipationId = 1;
      const userId = 1;
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ id: campaignParticipationId, userId });
      campaignParticipationRepository.get.withArgs({ id: campaignParticipationId, options }).resolves(campaignParticipation);
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignParticipation.campaignId, userId).resolves(false);

      // when
      const result = await getCampaignParticipation({ campaignParticipationId, options, campaignParticipationRepository, campaignRepository, userId });

      // then
      expect(result).to.equal(campaignParticipation);
    });
  });

  context('when user is a member of the organization which is related to requested campaignParticipation', () => {

    it('should get the campaignParticipation', async () => {
      // given
      const campaignParticipationId = 1;
      const userId = 2;
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ id: campaignParticipationId, userId: 1 });
      campaignParticipationRepository.get.withArgs({ id: campaignParticipationId, options }).resolves(campaignParticipation);
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignParticipation.campaignId, userId).resolves(true);

      // when
      const result = await getCampaignParticipation({ campaignParticipationId, options, campaignParticipationRepository, campaignRepository, userId });

      // then
      expect(result).to.equal(campaignParticipation);
    });
  });

  context('when user is neither the user of the campaignParticipation nor the organization', () => {

    it('should not get the campaignParticipation', async () => {
      // given
      const campaignParticipationId = 1;
      const userId = 2;
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ id: campaignParticipationId, userId: 1 });
      campaignParticipationRepository.get.withArgs({ id: campaignParticipationId, options }).resolves(campaignParticipation);
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignParticipation.campaignId, userId).resolves(false);

      // when
      const result = await catchErr(getCampaignParticipation)({ campaignParticipationId, options, campaignParticipationRepository, campaignRepository, userId });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });
});
