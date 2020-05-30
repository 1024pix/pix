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
    const campaignBadges = await fetchPossibleCampaignAssociatedBadges(event, badgeRepository);
    const campaignParticipationResult = await fetchCampaignParticipationResults(event, campaignBadges, campaignParticipationResultRepository);

    const badgeAquisitionsToCreate = campaignBadges
      .filter((badge) => isBadgeAcquired(campaignParticipationResult, badge, badgeCriteriaService))
      .map((badge) => {
        return badgeAcquisitionRepository.create({
          badgeId: badge.id,
          userId: event.userId
        }, domainTransaction);
      });

    await Promise.all(badgeAquisitionsToCreate);
  }
};

function completedAssessmentBelongsToACampaign(event) {
  return !!event.targetProfileId;
}

async function fetchPossibleCampaignAssociatedBadges(event, badgeRepository) {
  return await badgeRepository.findByTargetProfileId(event.targetProfileId);
}

async function fetchCampaignParticipationResults(event, campaignBadges, campaignParticipationResultRepository) {
  const acquiredBadges = [];
  return await campaignParticipationResultRepository.getByParticipationId(event.campaignParticipationId, campaignBadges, acquiredBadges);
}

function isBadgeAcquired(campaignParticipationResult, badge, badgeCriteriaService) {
  return badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badge });
}

handleBadgeAcquisition.eventType = eventType;
module.exports = handleBadgeAcquisition;
