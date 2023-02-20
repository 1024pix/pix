import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import getCampaignAssessmentParticipationResult from '../../../../lib/domain/usecases/get-campaign-assessment-participation-result';
import { UserNotAuthorizedToAccessEntityError } from '../../../../lib/domain/errors';

describe('Unit | UseCase | get-campaign-assessment-participation-result', function () {
  let campaignRepository, campaignAssessmentParticipationResultRepository;
  let userId, campaignId, campaign, campaignParticipationId;
  const locale = 'fr';

  beforeEach(function () {
    campaignRepository = {
      checkIfUserOrganizationHasAccessToCampaign: sinon.stub(),
    };
    campaignAssessmentParticipationResultRepository = {
      getByCampaignIdAndCampaignParticipationId: sinon.stub(),
    };
  });

  context('when user has access to organization that owns campaign', function () {
    beforeEach(function () {
      userId = domainBuilder.buildUser().id;
      campaign = domainBuilder.buildCampaign();
      campaignId = campaign.id;
      campaignParticipationId = domainBuilder.buildCampaignParticipation({ campaign, userId }).id;
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
    });

    it('should get the campaignAssessmentParticipationResult', async function () {
      // given
      const expectedResult = Symbol('Result');
      campaignAssessmentParticipationResultRepository.getByCampaignIdAndCampaignParticipationId
        .withArgs({ campaignId, campaignParticipationId, locale })
        .resolves(expectedResult);

      // when
      const result = await getCampaignAssessmentParticipationResult({
        userId,
        campaignId,
        campaignParticipationId,
        campaignRepository,
        campaignAssessmentParticipationResultRepository,
        locale,
      });

      // then
      expect(result).to.equal(expectedResult);
    });
  });

  context('when user does not have access to organization that owns campaign', function () {
    beforeEach(function () {
      userId = domainBuilder.buildUser().id;
      campaign = domainBuilder.buildCampaign();
      campaignId = campaign.id;
      campaignParticipationId = domainBuilder.buildCampaignParticipation({ campaign, userId }).id;
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(false);
    });

    it('should throw UserNotAuthorizedToAccessEntityError', async function () {
      // when
      const result = await catchErr(getCampaignAssessmentParticipationResult)({
        userId,
        campaignId,
        campaignParticipationId,
        campaignRepository,
        campaignAssessmentParticipationResultRepository,
        locale,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });
});
