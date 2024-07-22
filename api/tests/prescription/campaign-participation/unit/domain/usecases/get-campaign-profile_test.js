import { getCampaignProfile } from '../../../../../../src/prescription/campaign-participation/domain/usecases/get-campaign-profile.js';
import { LOCALE } from '../../../../../../src/shared/domain/constants.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

const { FRENCH_SPOKEN } = LOCALE;

describe('Unit | UseCase | get-campaign-profile', function () {
  let campaignRepository, campaignProfileRepository;
  let userId, campaignId, campaignParticipationId;
  const locale = FRENCH_SPOKEN;

  beforeEach(function () {
    campaignRepository = {
      checkIfUserOrganizationHasAccessToCampaign: sinon.stub(),
    };
    campaignProfileRepository = {
      findProfile: sinon.stub(),
    };
  });

  context('when user has access to organization that owns campaign', function () {
    beforeEach(function () {
      userId = domainBuilder.buildUser().id;
      const campaign = domainBuilder.buildCampaign();
      campaignId = campaign.id;
      campaignParticipationId = domainBuilder.buildCampaignParticipation({ campaign, userId }).id;
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
    });

    it('should get the campaignProfile', async function () {
      // given
      const expectedResult = Symbol('Result');
      campaignProfileRepository.findProfile
        .withArgs({ campaignId, campaignParticipationId, locale })
        .resolves(expectedResult);

      // when
      const result = await getCampaignProfile({
        userId,
        campaignId,
        campaignParticipationId,
        campaignRepository,
        campaignProfileRepository,
        locale,
      });

      // then
      expect(result).to.equal(expectedResult);
    });
  });

  context('when user does not have access to organization that owns campaign', function () {
    beforeEach(function () {
      userId = domainBuilder.buildUser().id;
      const campaign = domainBuilder.buildCampaign();
      campaignId = campaign.id;
      campaignParticipationId = domainBuilder.buildCampaignParticipation({ campaign, userId }).id;
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(false);
    });

    it('should throw UserNotAuthorizedToAccessEntityError', async function () {
      // when
      const result = await catchErr(getCampaignProfile)({
        userId,
        campaignId,
        campaignParticipationId,
        campaignRepository,
        campaignProfileRepository,
        locale,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });
});
