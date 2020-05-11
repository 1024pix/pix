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
      const campaignParticipationResult = await fetchCampaignParticipationResults(assessmentCompletedEvent, badge, campaignParticipationResultRepository);
      if (isBadgeAcquired(campaignParticipationResult, badge.badgeCriteria, badgeCriteriaService)) {
        await badgeAcquisitionRepository.create({
          badgeId: badge.id,
          userId: assessmentCompletedEvent.userId
        }, domainTransaction);
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

async function fetchCampaignParticipationResults(assessmentCompletedEvent, badge, campaignParticipationResultRepository) {
  return await campaignParticipationResultRepository.getByParticipationId(assessmentCompletedEvent.campaignParticipationId, badge);
}

function isBadgeAcquired(campaignParticipationResult, badgeCriteria, badgeCriteriaService) {
  return badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badgeCriteria });
}

module.exports = handleBadgeAcquisition;
