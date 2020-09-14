const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const getCampaignAssessmentParticipation = require('../../../../lib/domain/usecases/get-campaign-assessment-participation');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-campaign-assessment-participation', () => {

  let campaignRepository, campaignAssessmentParticipationRepository;
  let userId, campaignId, campaignParticipationId;

  beforeEach(() => {
    campaignRepository = {
      checkIfUserOrganizationHasAccessToCampaign: sinon.stub(),
    };
    campaignAssessmentParticipationRepository = {
      getByCampaignIdAndCampaignParticipationId: sinon.stub(),
    };
  });

  context('when user has access to organization that owns campaign', () => {

    beforeEach(() => {
      userId = domainBuilder.buildUser().id;
      campaignId = domainBuilder.buildCampaign().id;
      campaignParticipationId = domainBuilder.buildCampaignParticipation({ campaignId, userId }).id;
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
    });

    it('should get the campaignAssessmentParticipation', async () => {
      // given
      const expectedResult = Symbol('Result');
      campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId.withArgs({ campaignId, campaignParticipationId }).resolves(expectedResult);

      // when
      const result = await getCampaignAssessmentParticipation({ userId, campaignId, campaignParticipationId, campaignRepository, campaignAssessmentParticipationRepository });

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

    it('should throw UserNotAuthorizedToAccessEntity', async () => {
      // when
      const result = await catchErr(getCampaignAssessmentParticipation)({ userId, campaignId, campaignParticipationId, campaignRepository, campaignAssessmentParticipationRepository });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });
});
