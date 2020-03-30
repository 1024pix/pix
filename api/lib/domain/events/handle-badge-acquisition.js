const handleBadgeAcquisition = async function({
  domainTransaction,
  assessmentCompletedEvent,
  badgeCriteriaService,
  badgeAcquisitionRepository,
  badgeRepository,
  campaignParticipationResultRepository,
}) {
  if (completedAssessmentBelongsToACampaign(assessmentCompletedEvent)) {
    const badge = await fetchPossibleCampaignAssociatedBadge(assessmentCompletedEvent, badgeRepository);
    if (isABadgeAssociatedToCampaign(badge)) {
      const campaignParticipationResult = await fetchCampaignParticipationResults(assessmentCompletedEvent, campaignParticipationResultRepository);
      if (isBadgeAcquired(campaignParticipationResult, badgeCriteriaService)) {
        await badgeAcquisitionRepository.create(domainTransaction, { badgeId: badge.id, userId: assessmentCompletedEvent.userId });
      }
    }
  }
};

function completedAssessmentBelongsToACampaign(assessmentCompletedEvent) {
  return !!assessmentCompletedEvent.targetProfileId;
}

async function fetchPossibleCampaignAssociatedBadge(assessmentCompletedEvent, badgeRepository) {
  return await badgeRepository.findOneByTargetProfileId(assessmentCompletedEvent.targetProfileId);
}

function isABadgeAssociatedToCampaign(badge) {
  return !!badge;
}

async function fetchCampaignParticipationResults(assessmentCompletedEvent, campaignParticipationResultRepository) {
  return await campaignParticipationResultRepository.getByParticipationId(assessmentCompletedEvent.campaignParticipationId);
}

function isBadgeAcquired(campaignParticipationResult, badgeCriteriaService) {
  return badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult });
}

module.exports = handleBadgeAcquisition;
