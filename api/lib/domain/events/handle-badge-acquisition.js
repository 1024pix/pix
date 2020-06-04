const _ = require('lodash');
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
    const badges = await fetchPossibleCampaignAssociatedBadges(event, badgeRepository);
    const campaignParticipationResult = await fetchCampaignParticipationResults(event, badges, campaignParticipationResultRepository);

    const badgesBeingAcquired = badges.filter((badge) => isBadgeAcquired(campaignParticipationResult, badge, badgeCriteriaService));
    const badgesAcquisitionToCreate = badgesBeingAcquired.map((badge) => {
      return {
        badgeId: badge.id, userId: event.userId
      };
    });

    if (!_.isEmpty(badgesAcquisitionToCreate)) {
      await badgeAcquisitionRepository.create(badgesAcquisitionToCreate, domainTransaction);
    }
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
