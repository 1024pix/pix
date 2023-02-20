import _ from 'lodash';

const handleBadgeAcquisition = async function ({
  assessment,
  domainTransaction,
  badgeForCalculationRepository,
  badgeAcquisitionRepository,
  knowledgeElementRepository,
}) {
  if (assessment.isForCampaign()) {
    const campaignParticipationId = assessment.campaignParticipationId;
    const associatedBadges = await _fetchPossibleCampaignAssociatedBadges(
      campaignParticipationId,
      badgeForCalculationRepository,
      domainTransaction
    );
    if (_.isEmpty(associatedBadges)) {
      return;
    }
    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({
      userId: assessment.userId,
      domainTransaction,
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
      await badgeAcquisitionRepository.createOrUpdate({ badgeAcquisitionsToCreate, domainTransaction });
    }
  }
};

function _fetchPossibleCampaignAssociatedBadges(
  campaignParticipationId,
  badgeForCalculationRepository,
  domainTransaction
) {
  return badgeForCalculationRepository.findByCampaignParticipationId({ campaignParticipationId, domainTransaction });
}

export default handleBadgeAcquisition;
