module.exports = async function getUserCampaignAssessmentResult({
  userId,
  campaignId,
  locale,
  participantResultRepository,
}) {
  return participantResultRepository.getByUserIdAndCampaignId({ userId, campaignId, locale });
};

