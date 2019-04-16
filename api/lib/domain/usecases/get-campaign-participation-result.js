const CampaignParticipationResult = require('../../domain/models/CampaignParticipationResult');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function getCampaignParticipationResult(
  {
    userId,
    campaignParticipationId,
    campaignParticipationRepository,
    campaignRepository,
    competenceRepository,
    assessmentRepository,
    targetProfileRepository,
    smartPlacementKnowledgeElementRepository,
  }
) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

  const userIsNotRequestingHisCampaignParticipation = !(userId === campaignParticipation.userId);
  const userIsNotCampaignOrganizationMember = !(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(
    campaignParticipation.campaignId,
    userId
  ));

  if (userIsNotRequestingHisCampaignParticipation && userIsNotCampaignOrganizationMember) {
    throw new UserNotAuthorizedToAccessEntity('User does not have access to this campaign participation');
  }

  const [ targetProfile, competences, assessment, knowledgeElements ] = await Promise.all([
    targetProfileRepository.getByCampaignId(campaignParticipation.campaignId),
    competenceRepository.list(),
    assessmentRepository.get(campaignParticipation.assessmentId),
    smartPlacementKnowledgeElementRepository.findUniqByUserId({ userId: campaignParticipation.userId, limitDate: campaignParticipation.sharedAt }),
  ]);

  return CampaignParticipationResult.buildFrom({ campaignParticipationId, assessment, competences, targetProfile, knowledgeElements });
};
