const handleBadgeAcquisition = async function({
  domainTransaction,
  assessmentCompletedEvent,
  campaignParticipationResultRepository,
  badgeRepository
}) {
  if (completedAssessmentBelongsToACampaign(assessmentCompletedEvent)) {

    const badge = await fetchPossibleCampaignAssociatedBadge(assessmentCompletedEvent, badgeRepository);

    if (isABadgeAssociatedToCampaign(badge)) {
      const campaignParticipationResult = await fetchCampaignParticipationResults(
        assessmentCompletedEvent,
        badge,
        campaignParticipationResultRepository
      );

      badge.acquire(assessmentCompletedEvent.userId, campaignParticipationResult);

      await badgeRepository.persist(domainTransaction, badge);
    }
  }
};

function completedAssessmentBelongsToACampaign(assessmentCompletedEvent) {
  return assessmentCompletedEvent.targetProfileId != null;
}

async function fetchPossibleCampaignAssociatedBadge(assessmentCompletedEvent, badgeAggregateRepository) {
  return await badgeAggregateRepository.findOneByTargetProfileId(assessmentCompletedEvent.targetProfileId);
}

function isABadgeAssociatedToCampaign(badge) {
  return badge != null;
}

async function fetchCampaignParticipationResults(assessmentCompletedEvent, badge, campaignParticipationResultRepository) {
  return await campaignParticipationResultRepository.getByParticipationId(assessmentCompletedEvent.campaignParticipationId, badge);
}

module.exports = handleBadgeAcquisition;
