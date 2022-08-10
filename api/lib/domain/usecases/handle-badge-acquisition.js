const _ = require('lodash');

const handleBadgeAcquisition = async function ({
  assessment,
  // domainTransaction,
  badgeCriteriaService,
  badgeAcquisitionRepository,
  badgeRepository,
  knowledgeElementRepository,
  targetProfileRepository,
}) {
  if (assessment.campaignParticipationId !== null) {
    const associatedBadges = await _fetchPossibleCampaignAssociatedBadges(assessment, badgeRepository);
    if (_.isEmpty(associatedBadges)) {
      return;
    }
    const targetProfile = await targetProfileRepository.getByCampaignParticipationId(
      assessment.campaignParticipationId
    );
    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId });

    const validatedBadgesByUser = associatedBadges.filter((badge) =>
      badgeCriteriaService.areBadgeCriteriaFulfilled({ knowledgeElements, targetProfile, badge })
    );

    const badgesAcquisitionToCreate = validatedBadgesByUser.map((badge) => {
      return {
        badgeId: badge.id,
        userId: assessment.userId,
        campaignParticipationId: assessment.campaignParticipationId,
      };
    });

    if (!_.isEmpty(badgesAcquisitionToCreate)) {
      await badgeAcquisitionRepository.createOrUpdate(badgesAcquisitionToCreate);
    }
  }
};

function _fetchPossibleCampaignAssociatedBadges(assessment, badgeRepository) {
  return badgeRepository.findByCampaignParticipationId(assessment.campaignParticipationId);
}

module.exports = handleBadgeAcquisition;
