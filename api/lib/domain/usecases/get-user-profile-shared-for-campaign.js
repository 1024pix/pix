const SharedProfileForCampaign = require('../models/SharedProfileForCampaign');

module.exports = async function getUserProfileSharedForCampaign({
  userId,
  campaignId,
  campaignParticipationRepository,
  campaignRepository,
  knowledgeElementRepository,
  competenceRepository,
  schoolingRegistrationRepository,
  locale,
}) {
  const campaignParticipation = await campaignParticipationRepository.findOneByCampaignIdAndUserId({
    campaignId,
    userId,
  });

  let knowledgeElementsGroupedByCompetenceId = {};
  if (campaignParticipation) {
    knowledgeElementsGroupedByCompetenceId = await knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({
      userId,
      limitDate: campaignParticipation.sharedAt,
    });
  }

  const [{ multipleSendings: campaignAllowsRetry }, isRegistrationActive, competencesWithArea] = await Promise.all([
    campaignRepository.get(campaignId),
    schoolingRegistrationRepository.isActive({ campaignId, userId }),
    competenceRepository.listPixCompetencesOnly({ locale }),
  ]);

  return new SharedProfileForCampaign({
    campaignParticipation,
    campaignAllowsRetry,
    isRegistrationActive,
    userId,
    competencesWithArea,
    knowledgeElementsGroupedByCompetenceId,
  });
};
