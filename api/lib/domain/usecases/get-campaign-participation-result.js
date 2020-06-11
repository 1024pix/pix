const _ = require('lodash');
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

  const targetProfile = await targetProfileRepository.getByCampaignId(campaignParticipation.campaignId);
  const badges = await badgeRepository.findByTargetProfileId(targetProfile.id);

  const campaignParticipationResult = await campaignParticipationResultRepository.getByParticipationId(campaignParticipationId, badges);

  if (!_.isEmpty(badges)) {
    const hasAcquiredBadgesList = await Promise.all(badges.map((badge) => badgeAcquisitionRepository.hasAcquiredBadgeWithId({ userId, badgeId: badge.id })));
    const hasAcquiredAtLeastOneBadge = _.some(hasAcquiredBadgesList, Boolean);
    campaignParticipationResult.areBadgeCriteriaFulfilled = hasAcquiredAtLeastOneBadge;
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
