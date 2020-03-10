module.exports = async function findAnswerByChallengeAndAssessment(
  {
    challengeId,
    assessmentId,
    userId,
    answerRepository,
    assessmentRepository,
  } = {}) {
  const integerAssessmentId = parseInt(assessmentId);
  if (!Number.isFinite(integerAssessmentId)) {
    return null;
  }

  const assessment = await assessmentRepository.get(assessmentId);
  if (assessment.userId !== userId) {
    return null;
  }
  return answerRepository.findByChallengeAndAssessment({ challengeId, assessmentId: integerAssessmentId });
};
