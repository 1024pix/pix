module.exports = function findCampaignParticipationsByAssessmentId({
  campaignParticipationRepository,
  assessmentId,
}) {
  return campaignParticipationRepository.findByAssessmentId(assessmentId);
};
