const SharedProfileForCampaign = require('../read-models/SharedProfileForCampaign');
const { NoCampaignParticipationForUserAndCampaign } = require('../errors');

module.exports = async function getUserProfileSharedForCampaign({
  userId,
  campaignId,
  campaignParticipationRepository,
  campaignRepository,
  knowledgeElementRepository,
  competenceRepository,
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
  const competencesWithArea = await competenceRepository.listPixCompetencesOnly({ locale });

  return new SharedProfileForCampaign({
    campaignParticipation,
    campaignAllowsRetry,
    isOrganizationLearnerActive,
    competencesWithArea,
    knowledgeElementsGroupedByCompetenceId,
    userId,
  });
};
