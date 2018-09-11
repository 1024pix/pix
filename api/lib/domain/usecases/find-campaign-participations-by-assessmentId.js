module.exports = function findCampaignParticipationsByAssessmentId({
  assessmentId,
  campaignParticipationRepository,
}) {
  return campaignParticipationRepository.findByAssessmentId(assessmentId);
};
