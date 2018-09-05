module.exports = function allowUserToShareHisCampaignResult({
  assessmentId,
  campaignParticipationRepository
}) {
  return campaignParticipationRepository.findByAssessmentId(assessmentId)
    .then(campaignParticipationRepository.updateCampaignParticipation);
};
