import { MAX_REACHABLE_LEVEL, MAX_REACHABLE_PIX_SCORE } from '../../../../shared/constants.js';
import { NoCampaignParticipationForUserAndCampaign } from '../../../../shared/domain/errors.js';
import { SharedProfileForCampaign } from '../read-models/SharedProfileForCampaign.js';

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

  const { multipleSendings: campaignAllowsRetry } = await campaignRepository.get(campaignId);
  const isOrganizationLearnerActive = await organizationLearnerRepository.isActive({ campaignId, userId });
  const knowledgeElementsGroupedByCompetenceId = await knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId(
    {
      userId,
      limitDate: campaignParticipation.sharedAt,
    },
  );

  const competences = await competenceRepository.listPixCompetencesOnly({ locale });
  const allAreas = await areaRepository.list({ locale });
  const maxReachableLevel = MAX_REACHABLE_LEVEL;
  const maxReachablePixScore = MAX_REACHABLE_PIX_SCORE;

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
