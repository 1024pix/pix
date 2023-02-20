import { NotFoundError, NoCampaignParticipationForUserAndCampaign } from '../errors';

export default async function getUserCampaignAssessmentResult({
  userId,
  campaignId,
  locale,
  participantResultRepository,
  badgeRepository,
  knowledgeElementRepository,
  badgeForCalculationRepository,
}) {
  try {
    const badges = await badgeRepository.findByCampaignId(campaignId);
    const stillValidBadgeIds = await _checkStillValidBadges(
      campaignId,
      userId,
      knowledgeElementRepository,
      badgeForCalculationRepository
    );

    const badgesWithValidity = badges.map((badge) => ({ ...badge, isValid: stillValidBadgeIds.includes(badge.id) }));

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
}

async function _checkStillValidBadges(campaignId, userId, knowledgeElementRepository, badgeForCalculationRepository) {
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId });
  const badges = await badgeForCalculationRepository.findByCampaignId({ campaignId });
  return badges.filter((badge) => badge.shouldBeObtained(knowledgeElements)).map(({ id }) => id);
}
