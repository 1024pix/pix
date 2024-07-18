import { CampaignAssessmentParticipation } from '../../../../../../src/prescription/campaign-participation/domain/models/CampaignAssessmentParticipation.js';
import { getCampaignAssessmentParticipation } from '../../../../../../src/prescription/campaign-participation/domain/usecases/get-campaign-assessment-participation.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | get-campaign-assessment-participation', function () {
  let campaignRepository;
  let campaignAssessmentParticipationRepository;
  let badgeAcquisitionRepository;
  let stageCollectionRepository;
  let userId, campaignId, campaignParticipationId;

  beforeEach(function () {
    stageCollectionRepository = { findStageCollection: sinon.stub() };
    stageCollectionRepository.findStageCollection.resolves(
      domainBuilder.buildStageCollectionForUserCampaignResults({
        campaignId: 1,
        stages: [],
      }),
    );
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
        stageCollectionRepository,
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
        stageCollectionRepository,
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
        stageCollectionRepository,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });
});
