const _ = require('lodash');

const handleBadgeAcquisition = async function ({
  assessment,
  domainTransaction,
  badgeCriteriaService,
  badgeAcquisitionRepository,
  badgeRepository,
  knowledgeElementRepository,
  campaignRepository,
}) {
  if (assessment.isForCampaign()) {
    const associatedBadges = await _fetchPossibleCampaignAssociatedBadges(
      assessment.campaignParticipationId,
      badgeRepository,
      domainTransaction
    );
    if (_.isEmpty(associatedBadges)) {
      return;
    }
    const skillIds = await campaignRepository.findSkillIdsByCampaignParticipationId({
      campaignParticipationId: assessment.campaignParticipationId,
      domainTransaction,
    });
    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({
      userId: assessment.userId,
      domainTransaction,
    });

    const validatedBadgesByUser = associatedBadges.filter((badge) =>
      badgeCriteriaService.areBadgeCriteriaFulfilled({ knowledgeElements, skillIds, badge })
    );

    const badgeAcquisitionsToCreate = validatedBadgesByUser.map((badge) => {
      return {
        badgeId: badge.id,
        userId: assessment.userId,
        campaignParticipationId: assessment.campaignParticipationId,
      };
    });

    if (!_.isEmpty(badgeAcquisitionsToCreate)) {
      await badgeAcquisitionRepository.createOrUpdate({ badgeAcquisitionsToCreate, domainTransaction });
    }
  }
};

function _fetchPossibleCampaignAssociatedBadges(campaignParticipationId, badgeRepository, domainTransaction) {
  return badgeRepository.findByCampaignParticipationId({ campaignParticipationId, domainTransaction });
}

module.exports = handleBadgeAcquisition;
