import { SharedProfileForCampaign } from '../read-models/SharedProfileForCampaign.js';
import { NoCampaignParticipationForUserAndCampaign } from '../errors.js';
import { constants } from '../constants.js';

const getUserProfileSharedForCampaign = async function ({
  userId,
  campaignId,
  campaignParticipationRepository,
  campaignRepository,
  knowledgeElementRepository,
  competenceRepository,
  areaRepository,
  organizationLearnerRepository,
  skillRepository,
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
    allSkills,
  ] = await Promise.all([
    campaignRepository.get(campaignId),
    organizationLearnerRepository.isActive({ campaignId, userId }),
    knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({
      userId,
      limitDate: campaignParticipation.sharedAt,
    }),
    skillRepository.list(),
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
    allSkills,
    maxReachableLevel,
    maxReachablePixScore,
  });
};

export { getUserProfileSharedForCampaign };
