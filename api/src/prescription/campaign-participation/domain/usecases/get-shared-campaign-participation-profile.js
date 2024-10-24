import { constants } from '../../../../shared/domain/constants.js';
import { NoCampaignParticipationForUserAndCampaign } from '../../../../shared/domain/errors.js';
import { SharedProfileForCampaign } from '../../../../shared/domain/read-models/SharedProfileForCampaign.js';

const getSharedCampaignParticipationProfile = async function ({
  userId,
  campaignId,
  campaignParticipationRepository,
  campaignRepository,
  knowledgeElementRepository,
  competenceRepository,
  areaRepository,
  organizationLearnerRepository,
  locale,
}) {
  const campaignParticipation = await campaignParticipationRepository.findOneByCampaignIdAndUserId({
    campaignId,
    userId,
  });

  if (!campaignParticipation) {
    throw new NoCampaignParticipationForUserAndCampaign();
  }

  const [
    { multipleSendings: campaignAllowsRetry },
    isOrganizationLearnerActive,
    knowledgeElementsGroupedByCompetenceId,
  ] = await Promise.all([
    campaignRepository.get(campaignId),
    organizationLearnerRepository.isActive({ campaignId, userId }),
    knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({
      userId,
      limitDate: campaignParticipation.sharedAt,
    }),
  ]);
  const competences = await competenceRepository.listPixCompetencesOnly({ locale });
  const allAreas = await areaRepository.list({ locale });
  const maxReachableLevel = constants.MAX_REACHABLE_LEVEL;
  const maxReachablePixScore = constants.MAX_REACHABLE_PIX_SCORE;

  return new SharedProfileForCampaign({
    campaignParticipation,
    campaignAllowsRetry,
    isOrganizationLearnerActive,
    competences,
    knowledgeElementsGroupedByCompetenceId,
    userId,
    allAreas,
    maxReachableLevel,
    maxReachablePixScore,
  });
};

export { getSharedCampaignParticipationProfile };
