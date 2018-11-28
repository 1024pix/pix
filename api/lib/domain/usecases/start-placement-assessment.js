module.exports = function startAssessmentForPlacement({ assessment, assessmentRepository }) {
  assessment.start();
  return assessmentRepository.save(assessment);
};
