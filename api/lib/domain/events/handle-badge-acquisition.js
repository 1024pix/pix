const _ = require('lodash');
const AssessmentCompleted = require('../events/AssessmentCompleted');
const { checkEventTypes } = require('./check-event-types');

const eventTypes = [ AssessmentCompleted ];

const handleBadgeAcquisition = async function({
  event,
  badgeCriteriaService,
  badgeAcquisitionRepository,
  badgeRepository,
  knowledgeElementRepository,
  targetProfileRepository,
}) {
  checkEventTypes(event, eventTypes);

  if (event.isCampaignType) {

    const associatedBadges = await _fetchPossibleCampaignAssociatedBadges(event, badgeRepository);
    if (_.isEmpty(associatedBadges)) {
      return;
    }
    const targetProfile = await targetProfileRepository.getByCampaignParticipationId(event.campaignParticipationId);
    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId: event.userId });

    const validatedBadgesByUser = associatedBadges.filter((badge) =>
      badgeCriteriaService.areBadgeCriteriaFulfilled({ knowledgeElements, targetProfile, badge }));

    const badgesAcquisitionToCreate = validatedBadgesByUser.map((badge) => {
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

handleBadgeAcquisition.eventTypes = eventTypes;
module.exports = handleBadgeAcquisition;
