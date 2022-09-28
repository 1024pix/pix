const { NotFoundError, NoCampaignParticipationForUserAndCampaign } = require('../errors');

module.exports = async function getUserCampaignAssessmentResult({
  userId,
  campaignId,
  locale,
  participantResultRepository,
  knowledgeElementRepository,
  badgeCriteriaService,
  targetProfileRepository,
  badgeRepository,
  campaignRepository,
}) {
  try {
    const targetProfile = await targetProfileRepository.getByCampaignId(campaignId);
    const skillIds = await campaignRepository.findSkillIds({ campaignId });
    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId });
    const badges = await badgeRepository.findByTargetProfileId(targetProfile.id);
    const stillValidBadges = badges.filter((badge) =>
      badgeCriteriaService.areBadgeCriteriaFulfilled({
        knowledgeElements,
        skillIds,
        badge,
      })
    );

    const assessmentResult = await participantResultRepository.getByUserIdAndCampaignId({
      userId,
      campaignId,
      locale,
      badges: stillValidBadges,
    });

    return assessmentResult;
  } catch (error) {
    if (error instanceof NotFoundError) throw new NoCampaignParticipationForUserAndCampaign();
    throw error;
  }
};
