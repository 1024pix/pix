import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import getCampaignAssessmentParticipation from '../../../../lib/domain/usecases/get-campaign-assessment-participation';
import { UserNotAuthorizedToAccessEntityError } from '../../../../lib/domain/errors';
import CampaignAssessmentParticipation from '../../../../lib/domain/read-models/CampaignAssessmentParticipation';

describe('Unit | UseCase | get-campaign-assessment-participation', function () {
  let campaignRepository, campaignAssessmentParticipationRepository, badgeAcquisitionRepository;
  let userId, campaignId, campaignParticipationId;

  beforeEach(function () {
    campaignRepository = {
      checkIfUserOrganizationHasAccessToCampaign: sinon.stub(),
    };
    campaignAssessmentParticipationRepository = {
      getByCampaignIdAndCampaignParticipationId: sinon.stub(),
    };
    badgeAcquisitionRepository = {
      getAcquiredBadgesByCampaignParticipations: sinon.stub(),
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

    it('should get the campaignAssessmentParticipation', async function () {
      // given
      const participantId = domainBuilder.buildUser().id;
      const campaignAssessmentParticipation = new CampaignAssessmentParticipation({ userId: participantId });
      campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId
        .withArgs({ campaignId, campaignParticipationId })
        .resolves(campaignAssessmentParticipation);
      badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations
        .withArgs({ campaignParticipationsIds: [campaignParticipationId] })
        .resolves({});

      // when
      const result = await getCampaignAssessmentParticipation({
        userId,
        campaignId,
        campaignParticipationId,
        campaignRepository,
        campaignAssessmentParticipationRepository,
        badgeAcquisitionRepository,
      });

      // then
      expect(result).to.equal(campaignAssessmentParticipation);
    });

    it('should set badges', async function () {
      // given
      const badges = Symbol('badges');
      const campaignAssessmentParticipation = new CampaignAssessmentParticipation({ campaignParticipationId });
      campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId
        .withArgs({ campaignId, campaignParticipationId })
        .resolves(campaignAssessmentParticipation);
      badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations
        .withArgs({ campaignParticipationsIds: [campaignParticipationId] })
        .resolves({ [campaignParticipationId]: badges });

      // when
      const result = await getCampaignAssessmentParticipation({
        userId,
        campaignId,
        campaignParticipationId,
        campaignRepository,
        campaignAssessmentParticipationRepository,
        badgeAcquisitionRepository,
      });

      // then
      expect(result.badges).to.equal(badges);
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
      const result = await catchErr(getCampaignAssessmentParticipation)({
        userId,
        campaignId,
        campaignParticipationId,
        campaignRepository,
        campaignAssessmentParticipationRepository,
        badgeAcquisitionRepository,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });
});
