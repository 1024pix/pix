import _ from 'lodash';

const handleBadgeAcquisition = async function ({
  assessment,
  badgeForCalculationRepository,
  badgeAcquisitionRepository,
  knowledgeElementRepository,
}) {
  if (assessment.isForCampaign()) {
    const campaignParticipationId = assessment.campaignParticipationId;
    const associatedBadges = await _fetchPossibleCampaignAssociatedBadges(
      campaignParticipationId,
      badgeForCalculationRepository,
    );
    if (_.isEmpty(associatedBadges)) {
      return;
    }
    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({
      userId: assessment.userId,
    });

    const obtainedBadgesByUser = associatedBadges.filter((badge) => badge.shouldBeObtained(knowledgeElements));

    const badgeAcquisitionsToCreate = obtainedBadgesByUser.map((badge) => {
      return {
        badgeId: badge.id,
        userId: assessment.userId,
        campaignParticipationId: assessment.campaignParticipationId,
      };
    });

    if (!_.isEmpty(badgeAcquisitionsToCreate)) {
      await badgeAcquisitionRepository.createOrUpdate({ badgeAcquisitionsToCreate });
    }
  }
};

function _fetchPossibleCampaignAssociatedBadges(campaignParticipationId, badgeForCalculationRepository) {
  return badgeForCalculationRepository.findByCampaignParticipationId({ campaignParticipationId });
}

export { handleBadgeAcquisition };
