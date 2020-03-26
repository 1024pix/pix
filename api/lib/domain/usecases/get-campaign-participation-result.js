const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function getCampaignParticipationResult(
  {
    userId,
    campaignParticipationId,
    badgeRepository,
    badgeAcquisitionRepository,
    campaignParticipationRepository,
    campaignParticipationResultRepository,
    campaignRepository,
    targetProfileRepository,
  }
) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
  await _checkIfUserHasAccessToThisCampaignParticipation(userId, campaignParticipation, campaignRepository);

  const campaignParticipationResult = await campaignParticipationResultRepository.getByParticipationId(campaignParticipationId);

  const targetProfile = await targetProfileRepository.getByCampaignId(campaignParticipation.campaignId);
  const badge = await badgeRepository.findOneByTargetProfileId(targetProfile.id);
  campaignParticipationResult.badge = badge;
  if (badge != null) {
    const hasAcquiredBadge = await badgeAcquisitionRepository.hasAcquiredBadgeWithId({ userId, badgeId: badge.id });
    campaignParticipationResult.areBadgeCriteriaFulfilled = hasAcquiredBadge;
  }

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
