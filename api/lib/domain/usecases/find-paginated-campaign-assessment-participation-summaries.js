const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function findPaginatedCampaignAssessmentParticipationSummaries({
  userId,
  campaignId,
  page,
  filters,
  campaignRepository,
  campaignAssessmentParticipationSummaryRepository,
  badgeAcquisitionRepository,
}) {

  await _checkUserAccessToCampaign(campaignId, userId, campaignRepository);

  const paginatedParticipations = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ page, campaignId, filters });

  const userIds = paginatedParticipations.campaignAssessmentParticipationSummaries.map((participation) => participation.userId);
  const acquiredBadgesByUsers = await badgeAcquisitionRepository.getCampaignAcquiredBadgesByUsers({ campaignId, userIds });
  paginatedParticipations.campaignAssessmentParticipationSummaries.forEach((participation) => {
    const badges = acquiredBadgesByUsers[participation.userId];
    participation.setBadges(badges);
  });

  return paginatedParticipations;
};

async function _checkUserAccessToCampaign(campaignId, userId, campaignRepository) {
  const hasAccess = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);
  if (!hasAccess) {
    throw new UserNotAuthorizedToAccessEntity('User does not belong to an organization that owns the campaign');
  }
}
