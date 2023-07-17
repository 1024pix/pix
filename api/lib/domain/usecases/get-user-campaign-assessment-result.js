import { NotFoundError, NoCampaignParticipationForUserAndCampaign } from '../errors.js';

const getUserCampaignAssessmentResult = async function ({
  userId,
  campaignId,
  locale,
  participantResultRepository,
  badgeRepository,
  knowledgeElementRepository,
  badgeForCalculationRepository,
}) {
  try {
    const [badges, knowledgeElements] = await Promise.all([
      badgeRepository.findByCampaignId(campaignId),
      knowledgeElementRepository.findUniqByUserId({ userId }),
    ]);
    const stillValidBadgeIds = await _checkStillValidBadges(
      campaignId,
      knowledgeElements,
      badgeForCalculationRepository,
    );
    const badgeWithAcquisitionPercentage = await _getBadgeAcquisitionPercentage(
      campaignId,
      knowledgeElements,
      badgeForCalculationRepository,
    );

    const badgesWithValidity = badges.map((badge) => ({
      ...badge,
      isValid: stillValidBadgeIds.includes(badge.id),
      acquisitionPercentage: badgeWithAcquisitionPercentage.find(
        (badgeForCalculation) => badgeForCalculation.id === badge.id,
      ).acquisitionPercentage,
    }));

    const assessmentResult = await participantResultRepository.getByUserIdAndCampaignId({
      userId,
      campaignId,
      locale,
      badges: badgesWithValidity,
    });

    return assessmentResult;
  } catch (error) {
    if (error instanceof NotFoundError) throw new NoCampaignParticipationForUserAndCampaign();
    throw error;
  }
};

export { getUserCampaignAssessmentResult };

async function _checkStillValidBadges(campaignId, knowledgeElements, badgeForCalculationRepository) {
  const badgesForCalculation = await badgeForCalculationRepository.findByCampaignId({ campaignId });
  return badgesForCalculation.filter((badge) => badge.shouldBeObtained(knowledgeElements)).map(({ id }) => id);
}

async function _getBadgeAcquisitionPercentage(campaignId, knowledgeElements, badgeForCalculationRepository) {
  const badgesForCalculation = await badgeForCalculationRepository.findByCampaignId({ campaignId });
  return badgesForCalculation.map((badge) => ({
    id: badge.id,
    acquisitionPercentage: badge.getAcquisitionPercentage(knowledgeElements),
  }));
}
