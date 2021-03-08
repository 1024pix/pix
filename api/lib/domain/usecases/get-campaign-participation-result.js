const { UserNotAuthorizedToAccessEntityError } = require('../errors');

module.exports = async function getCampaignParticipationResult({
  userId,
  locale,
  campaignParticipationId,
  badgeRepository,
  badgeAcquisitionRepository,
  campaignParticipationRepository,
  campaignParticipationResultRepository,
  targetProfileRepository,
}) {

  const campaignParticipation = await _getCampaignParticipation(campaignParticipationRepository, campaignParticipationId, userId);

  const targetProfile = await targetProfileRepository.getByCampaignId(campaignParticipation.campaignId);
  const campaignBadges = await badgeRepository.findByTargetProfileId(targetProfile.id);
  const campaignBadgeIds = campaignBadges.map((badge) => badge.id);

  const acquiredBadgeIds = await badgeAcquisitionRepository.getAcquiredBadgeIds({ userId, badgeIds: campaignBadgeIds });

  return campaignParticipationResultRepository.getByParticipationId(campaignParticipationId, campaignBadges, acquiredBadgeIds, locale);
};

async function _getCampaignParticipation(campaignParticipationRepository, campaignParticipationId, userId) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
  if (campaignParticipation.userId == userId) {
    return campaignParticipation;
  }
  throw new UserNotAuthorizedToAccessEntityError();
}
