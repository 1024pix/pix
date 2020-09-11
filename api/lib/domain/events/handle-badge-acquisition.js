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

  if (event.isCampaignType) {
    const badges = await _fetchPossibleCampaignAssociatedBadges(event, badgeRepository);
    const campaignParticipationResult = await _fetchCampaignParticipationResults(event, badges, campaignParticipationResultRepository);

    const badgesBeingAcquired = badges.filter((badge) => _isBadgeAcquired(campaignParticipationResult, badge, badgeCriteriaService));
    const badgesAcquisitionToCreate = badgesBeingAcquired.map((badge) => {
      return {
        badgeId: badge.id, userId: event.userId,
      };
    });

    if (!_.isEmpty(badgesAcquisitionToCreate)) {
      await badgeAcquisitionRepository.create(badgesAcquisitionToCreate, domainTransaction);
    }
  }
};

function _fetchPossibleCampaignAssociatedBadges(event, badgeRepository) {
  return badgeRepository.findByCampaignParticipationId(event.campaignParticipationId);
}

function _fetchCampaignParticipationResults(event, campaignBadges, campaignParticipationResultRepository) {
  const acquiredBadges = [];
  return campaignParticipationResultRepository.getByParticipationId(event.campaignParticipationId, campaignBadges, acquiredBadges);
}

function _isBadgeAcquired(campaignParticipationResult, badge, badgeCriteriaService) {
  return badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badge });
}

handleBadgeAcquisition.eventType = eventType;
module.exports = handleBadgeAcquisition;
