import * as injectedBadgeAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/badge-acquisition-repository.js';
import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';
import * as injectedCampaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as injectedStageCollectionRepository from '../../../campaign/infrastructure/repositories/stage-collection-repository.js';
import * as injectedCampaignAssessmentParticipationRepository from '../../infrastructure/repositories/campaign-assessment-participation-repository.js';

const getCampaignAssessmentParticipation = withTransaction(async function ({
  userId,
  campaignId,
  campaignParticipationId,
  campaignRepository = injectedCampaignRepository,
  campaignAssessmentParticipationRepository = injectedCampaignAssessmentParticipationRepository,
  badgeAcquisitionRepository = injectedBadgeAcquisitionRepository,
  stageCollectionRepository = injectedStageCollectionRepository,
} = {}) {
  // TODO : throw when campaignId not matching campaignParticipationId ? may be move this to pre handler
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to the organization that owns the campaign');
  }

  const campaign = await campaignRepository.get(campaignId);
  const campaignAssessmentParticipation =
    await campaignAssessmentParticipationRepository.getByCampaignIdAndCampaignParticipationId({
      campaignId,
      campaignParticipationId,
      shouldBuildProgression: campaign.isTypeAssessment,
    });

  // TODO : avoid get data if participation is not shared badges/stages ?
  const acquiredBadgesByCampaignParticipations =
    await badgeAcquisitionRepository.getAcquiredBadgesByCampaignParticipations({
      campaignParticipationsIds: [campaignParticipationId],
    });
  const badges = acquiredBadgesByCampaignParticipations[campaignAssessmentParticipation.campaignParticipationId];
  campaignAssessmentParticipation.setBadges(badges);

  const stageCollection = await stageCollectionRepository.findStageCollection({ campaignId });
  const reachedStage = stageCollection.getReachedStage(
    campaignAssessmentParticipation.validatedSkillsCount,
    campaignAssessmentParticipation.masteryRate * 100,
  );
  campaignAssessmentParticipation.setStageInfo(reachedStage);

  return campaignAssessmentParticipation;
});

export { getCampaignAssessmentParticipation };
