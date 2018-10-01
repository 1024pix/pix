const Assessment = require('../models/Assessment');

module.exports = function startCampaignParticipation({ campaignParticipation, userId, campaignParticipationRepository, assessmentRepository }) {
  return _createSmartPlacementAssessment(userId, assessmentRepository)
    .then((assessment) => _saveCampaignParticipation(campaignParticipation, assessment, userId, campaignParticipationRepository));
};

function _createSmartPlacementAssessment(userId, assessmentRepository) {
  const assessment = new Assessment();
  assessment.state = Assessment.states.STARTED;
  assessment.type = Assessment.types.SMARTPLACEMENT;
  assessment.courseId = 'Smart Placement Tests CourseId Not Used';
  assessment.userId = userId;
  return assessmentRepository.save(assessment);
}

function _saveCampaignParticipation(campaignParticipation, assessment, userId, campaignParticipationRepository) {
  campaignParticipation.userId = userId;
  campaignParticipation.assessmentId = assessment.id;
  return campaignParticipationRepository.save(campaignParticipation);
}
