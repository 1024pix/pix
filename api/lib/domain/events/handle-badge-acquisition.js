const _ = require('lodash');
const AssessmentCompleted = require('../events/AssessmentCompleted');
const BadgeResults = require('../models/BadgeResults');
const { checkEventType } = require('./check-event-type');

const eventType = AssessmentCompleted;

const handleBadgeAcquisition = async function({
  event,
  badgeCriteriaService,
  badgeAcquisitionRepository,
  badgeRepository,
  knowledgeElementRepository,
  skillRepository,
}) {
  checkEventType(event, eventType);

  if (event.isCampaignType) {
    const badges = await _fetchPossibleCampaignAssociatedBadges(event, badgeRepository);
    const badgeResults = await _fetchBadgeResults(event, badges, knowledgeElementRepository, skillRepository);

    const badgesBeingAcquired = badges.filter((badge) => _isBadgeAcquired(badgeResults, badge, badgeCriteriaService));
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

async function _fetchBadgeResults(event, badges, knowledgeElementRepository, skillRepository) {
  const skillIds = await skillRepository.assessedDuringCampaignParticipation(event.campaignParticipationId);
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId: event.userId });

  return BadgeResults.build(badges, skillIds, knowledgeElements);
}

function _isBadgeAcquired(campaignParticipationResult, badge, badgeCriteriaService) {
  return badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badge });
}

handleBadgeAcquisition.eventType = eventType;
module.exports = handleBadgeAcquisition;
