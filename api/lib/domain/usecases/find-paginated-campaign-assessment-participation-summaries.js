const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = async function findPaginatedCampaignAssessmentParticipationSummaries({
  userId,
  campaignId,
  page,
  campaignRepository,
  campaignAssessmentParticipationSummaryRepository,
  badgeAcquisitionRepository,
}) {

  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntity('User does not belong to an organization that owns the campaign');
  }

  // get campaign assessment participations
  const paginatedParticipations = await campaignAssessmentParticipationSummaryRepository.findPaginatedByCampaignId({ page, campaignId });

  // get users badges for campaign
  const userIds = paginatedParticipations.campaignAssessmentParticipationSummaries.map((participation) => participation.userId);
  const acquiredBadgesByUsers = await badgeAcquisitionRepository.getCampaignAcquiredBadgesByUsers({ campaignId, userIds });
  paginatedParticipations.campaignAssessmentParticipationSummaries.forEach((participation) => {
    const badges = acquiredBadgesByUsers[participation.userId];
    participation.setBadges(badges);
  });

  return paginatedParticipations;
};
