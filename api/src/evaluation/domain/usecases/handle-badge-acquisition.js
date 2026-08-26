import _ from 'lodash';

const handleBadgeAcquisition = async function ({
  assessment,
  badgeForCalculationRepository,
  badgeAcquisitionRepository,
  knowledgeStateForParticipationService,
}) {
  if (assessment.isCampaignParticipationAvailable()) {
    const campaignParticipationId = assessment.campaignParticipationId;
    const associatedBadges = await _fetchPossibleCampaignAssociatedBadges(
      campaignParticipationId,
      badgeForCalculationRepository,
    );
    if (_.isEmpty(associatedBadges)) {
      return;
    }
    const knowledgeState = await knowledgeStateForParticipationService.findByUserOrCampaignParticipationId({
      userId: assessment.userId,
      campaignParticipationId,
    });

    const obtainedBadgesByUser = associatedBadges.filter((badge) => badge.shouldBeObtained(knowledgeState));

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
