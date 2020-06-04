const AssessmentCompleted = require('../events/AssessmentCompleted');
const { checkEventType } = require('./check-event-type');

const eventType = AssessmentCompleted;
const handleBadgeAcquisition = async function({
  domainTransaction,
  event,
  badgeCriteriaService,
  badgeAcquisitionRepository,
  badgeRepository,
  campaignParticipationResultRepository,
}) {
  checkEventType(event, eventType);

  if (completedAssessmentBelongsToACampaign(event)) {
    const badge = await fetchPossibleCampaignAssociatedBadge(event, badgeRepository);
    if (isABadgeAssociatedToCampaign(badge)) {
      const campaignParticipationResult = await fetchCampaignParticipationResults(event, badge, campaignParticipationResultRepository);
      if (isBadgeAcquired(campaignParticipationResult, badge.badgeCriteria, badgeCriteriaService)) {
        await badgeAcquisitionRepository.create({
          badgeId: badge.id,
          userId: event.userId
        }, domainTransaction);
      }
    }
  }
};

function completedAssessmentBelongsToACampaign(event) {
  return !!event.targetProfileId;
}

async function fetchPossibleCampaignAssociatedBadge(event, badgeRepository) {
  return await badgeRepository.findOneByTargetProfileId(event.targetProfileId);
}

function isABadgeAssociatedToCampaign(badge) {
  return !!badge;
}

async function fetchCampaignParticipationResults(event, badge, campaignParticipationResultRepository) {
  return await campaignParticipationResultRepository.getByParticipationId(event.campaignParticipationId, badge);
}

function isBadgeAcquired(campaignParticipationResult, badgeCriteria, badgeCriteriaService) {
  return badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badgeCriteria });
}

handleBadgeAcquisition.eventType = eventType;
module.exports = handleBadgeAcquisition;
