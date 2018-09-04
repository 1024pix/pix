module.exports = function allowUserToShareHisCampaignResult({
  assessmentId,
  campaignParticipationRepository
}) {
  return campaignParticipationRepository.updateCampaignParticipation(assessmentId);
};
