const _ = require('lodash');
const AssessmentCompleted = require('../events/AssessmentCompleted');
const { checkEventType } = require('./check-event-type');

const eventType = AssessmentCompleted;

const handleBadgeAcquisition = async function({
  event,
  domainTransaction,
  badgeCriteriaService,
  badgeAcquisitionRepository,
  badgeRepository,
  campaignParticipationResultRepository,
}) {
  checkEventType(event, eventType);

  if (event.isCampaignType) {
    const badges = await _fetchPossibleCampaignAssociatedBadges(event, badgeRepository, domainTransaction);
    const campaignParticipationResult = await _fetchCampaignParticipationResults(event, badges, campaignParticipationResultRepository, domainTransaction);

    const badgesBeingAcquired = badges.filter((badge) => _isBadgeAcquired(campaignParticipationResult, badge, badgeCriteriaService));
    const badgesAcquisitionToCreate = badgesBeingAcquired.map((badge) => {
      return {
        badgeId: badge.id,
        userId: event.userId,
        campaignParticipationId: event.campaignParticipationId,
      };
    });
    if (!_.isEmpty(badgesAcquisitionToCreate)) {
      await badgeAcquisitionRepository.create(badgesAcquisitionToCreate, domainTransaction);
    }
  }
};

function _fetchPossibleCampaignAssociatedBadges(event, badgeRepository, domainTransaction) {
  return badgeRepository.findByCampaignParticipationId(event.campaignParticipationId, domainTransaction);
}

function _fetchCampaignParticipationResults(event, campaignBadges, campaignParticipationResultRepository, domainTransaction) {
  const acquiredBadges = [];
  return campaignParticipationResultRepository.getByParticipationId({
    campaignParticipationId: event.campaignParticipationId,
    campaignBadges,
    acquiredBadgeIds: acquiredBadges,
    domainTransaction,
  });
}

function _isBadgeAcquired(campaignParticipationResult, badge, badgeCriteriaService) {
  return badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badge });
}

handleBadgeAcquisition.eventType = eventType;
module.exports = handleBadgeAcquisition;
