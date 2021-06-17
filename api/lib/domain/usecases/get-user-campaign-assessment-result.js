const { NotFoundError, NoCampaignParticipationForUserAndCampaign } = require('../errors');

module.exports = async function getUserCampaignAssessmentResult({
  userId,
  campaignId,
  locale,
  participantResultRepository,
}) {
  try {
    return await participantResultRepository.getByUserIdAndCampaignId({ userId, campaignId, locale });
  } catch (error) {
    if (error instanceof NotFoundError) throw new NoCampaignParticipationForUserAndCampaign();
    throw error;
  }
};
