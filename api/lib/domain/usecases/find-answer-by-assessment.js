module.exports = async function findAnswerByAssessment(
  {
    assessmentId,
    userId,
    answerRepository,
    assessmentRepository,
  } = {}) {
  const integerAssessmentId = parseInt(assessmentId);
  if (!Number.isFinite(integerAssessmentId)) {
    return [];
  }

  const assessment = await assessmentRepository.get(assessmentId);
  if (assessment.userId !== userId) {
    return [];
  }
  return answerRepository.findByAssessment(integerAssessmentId);
};
