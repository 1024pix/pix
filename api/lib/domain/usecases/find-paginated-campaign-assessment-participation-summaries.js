const { UserNotAuthorizedToAccessEntityError } = require('../errors');

module.exports = async function findPaginatedCampaignAssessmentParticipationSummaries({
  userId,
  campaignId,
  page,
  filters,
  campaignRepository,
  campaignAssessmentParticipationSummaryRepository,
  badgeAcquisitionRepository,
  targetProfileWithLearningContentRepository,
}) {

  await _checkUserAccessToCampaign(campaignId, userId, campaignRepository);

  const targetProfile = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId });
  filters.validatedSkillBoundaries = targetProfile.getSkillsCountBoundariesFromStages(filters.stages);

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
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to an organization that owns the campaign');
  }
}
