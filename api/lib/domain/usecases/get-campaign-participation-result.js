const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../errors');
const CampaignParticipationResultFactory = require('../models/CampaignParticipationResultFactory');

module.exports = async function getCampaignParticipationResult(
  {
    userId,
    campaignParticipationId,
    assessmentRepository,
    badgeRepository,
    campaignParticipationRepository,
    campaignRepository,
    competenceRepository,
    knowledgeElementRepository,
    targetProfileRepository,
  }
) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
  await _checkIfUserHasAccessToThisCampaignParticipation(userId, campaignParticipation, campaignRepository);

  const campaignParticipationResult = await new CampaignParticipationResultFactory(
    campaignParticipationRepository,
    targetProfileRepository,
    competenceRepository,
    assessmentRepository,
    knowledgeElementRepository,
  ).create(campaignParticipationId);

  const targetProfile = await targetProfileRepository.getByCampaignId(campaignParticipation.campaignId);
  const badge = await badgeRepository.findOneByTargetProfileId(targetProfile.id);
  campaignParticipationResult.badge = badge;

  return campaignParticipationResult;
};

async function _checkIfUserHasAccessToThisCampaignParticipation(userId, campaignParticipation, campaignRepository) {
  const campaignParticipationBelongsToUser = (userId === campaignParticipation.userId);
  const userIsMemberOfCampaignOrganization = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(
    campaignParticipation.campaignId,
    userId
  );

  if (!campaignParticipationBelongsToUser && !userIsMemberOfCampaignOrganization) {
    throw new UserNotAuthorizedToAccessEntity('User does not have access to this campaign participation');
  }
}
