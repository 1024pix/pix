const _ = require('lodash');
const AssessmentCompleted = require('../events/AssessmentCompleted');
const { checkEventTypes } = require('./check-event-types');

const eventTypes = [ AssessmentCompleted ];

const handleBadgeAcquisition = async function({
  event,
  badgeCriteriaService,
  badgeAcquisitionRepository,
  badgeRepository,
  campaignParticipationResultRepository,
}) {
  checkEventTypes(event, eventTypes);

  if (event.isCampaignType) {
    const badges = await _fetchPossibleCampaignAssociatedBadges(event, badgeRepository);
    const campaignParticipationResult = await _fetchCampaignParticipationResults(event, badges, campaignParticipationResultRepository);

    const badgesBeingAcquired = badges.filter((badge) => _isBadgeAcquired(campaignParticipationResult, badge, badgeCriteriaService));
    const badgesAcquisitionToCreate = badgesBeingAcquired.map((badge) => {
      return {
        badgeId: badge.id,
        userId: event.userId,
        campaignParticipationId: event.campaignParticipationId,
      };
    });

    if (!_.isEmpty(badgesAcquisitionToCreate)) {
      await badgeAcquisitionRepository.create(badgesAcquisitionToCreate);
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

handleBadgeAcquisition.eventTypes = eventTypes;
module.exports = handleBadgeAcquisition;
