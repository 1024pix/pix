const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function getCampaignParticipationResult(
  {
    userId,
    campaignParticipationId,
    endOfParticipationBadgeQuery,
    badgeAcquisitionRepository,
    campaignParticipationRepository,
    campaignParticipationResultRepository,
    campaignRepository,
    targetProfileRepository,
  }
) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
  await _checkIfUserHasAccessToThisCampaignParticipation(userId, campaignParticipation, campaignRepository);

  const targetProfile = await targetProfileRepository.getByCampaignId(campaignParticipation.campaignId);
  const badgeViewModel = await endOfParticipationBadgeQuery.findOneByTargetProfileId(targetProfile.id);

  const campaignParticipationResult = await campaignParticipationResultRepository.getByParticipationId(campaignParticipationId, badgeViewModel);

  if (badgeViewModel != null) {
    const hasAcquiredBadge = await badgeAcquisitionRepository.hasAcquiredBadgeWithId({ userId, badgeId: badgeViewModel.id });
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
