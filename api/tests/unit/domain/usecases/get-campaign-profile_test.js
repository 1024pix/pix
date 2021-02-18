const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const getCampaignProfile = require('../../../../lib/domain/usecases/get-campaign-profile');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');
const { FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Unit | UseCase | get-campaign-profile', () => {

  let campaignRepository, campaignProfileRepository;
  let userId, campaignId, campaignParticipationId;
  const locale = FRENCH_SPOKEN;

  beforeEach(() => {
    campaignRepository = {
      checkIfUserOrganizationHasAccessToCampaign: sinon.stub(),
    };
    campaignProfileRepository = {
      findProfile: sinon.stub(),
    };
  });

  context('when user has access to organization that owns campaign', () => {

    beforeEach(() => {
      userId = domainBuilder.buildUser().id;
      campaignId = domainBuilder.buildCampaign().id;
      campaignParticipationId = domainBuilder.buildCampaignParticipation({ campaignId, userId }).id;
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
    });

    it('should get the campaignProfile', async () => {
      // given
      const expectedResult = Symbol('Result');
      campaignProfileRepository.findProfile.withArgs({ campaignId, campaignParticipationId, locale }).resolves(expectedResult);

      // when
      const result = await getCampaignProfile({ userId, campaignId, campaignParticipationId, campaignRepository, campaignProfileRepository, locale });

      // then
      expect(result).to.equal(expectedResult);
    });
  });

  context('when user does not have access to organization that owns campaign', () => {
    beforeEach(() => {
      userId = domainBuilder.buildUser().id;
      campaignId = domainBuilder.buildCampaign().id;
      campaignParticipationId = domainBuilder.buildCampaignParticipation({ campaignId, userId }).id;
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(false);
    });

    it('should throw UserNotAuthorizedToAccessEntityError', async () => {
      // when
      const result = await catchErr(getCampaignProfile)({ userId, campaignId, campaignParticipationId, campaignRepository, campaignProfileRepository, locale });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });
});
