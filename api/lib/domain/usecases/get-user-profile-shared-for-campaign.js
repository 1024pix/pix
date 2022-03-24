const SharedProfileForCampaign = require('../models/SharedProfileForCampaign');
const { NoCampaignParticipationForUserAndCampaign } = require('../errors');

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

  if (!campaignParticipation) {
    throw new NoCampaignParticipationForUserAndCampaign();
  }

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

  return new SharedProfileForCampaign({
    campaignParticipation,
    campaignAllowsRetry,
    isRegistrationActive,
    competencesWithArea,
    knowledgeElementsGroupedByCompetenceId,
    userId,
  });
};
