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

  const sharedProfileForCampaign = new SharedProfileForCampaign({
    campaignParticipation,
  });

  const [
    { multipleSendings: campaignAllowsRetry },
    isRegistrationActive,
    competencesWithArea,
    knowledgeElementsGroupedByCompetenceId,
  ] = await Promise.all([
    campaignRepository.get(campaignId),
    schoolingRegistrationRepository.isActive({ campaignId, userId }),
    competenceRepository.listPixCompetencesOnly({ locale }),
    await knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId({
      userId,
      limitDate: campaignParticipation.sharedAt,
    }),
  ]);

  sharedProfileForCampaign.build({
    campaignAllowsRetry,
    isRegistrationActive,
    competencesWithArea,
    knowledgeElementsGroupedByCompetenceId,
    userId,
    deletedAt: campaignParticipation.deletedAt,
  });

  return sharedProfileForCampaign;
};
