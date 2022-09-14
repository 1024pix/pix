const { NotFoundError, NoCampaignParticipationForUserAndCampaign } = require('../errors');

module.exports = async function getUserCampaignAssessmentResult({
  userId,
  campaignId,
  locale,
  participantResultRepository,
  targetProfileRepository,
  badgeRepository,
}) {
  try {
    const targetProfile = await targetProfileRepository.getByCampaignId(campaignId);
    const badges = await badgeRepository.findByTargetProfileId(targetProfile.id);
    const assessmentResult = await participantResultRepository.getByUserIdAndCampaignId({
      userId,
      campaignId,
      locale,
      targetProfile,
      badges,
    });

    return assessmentResult;
  } catch (error) {
    if (error instanceof NotFoundError) throw new NoCampaignParticipationForUserAndCampaign();
    throw error;
  }
};
