const findAnswerByChallengeAndAssessment = async function ({
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

  const ownedByUser = await assessmentRepository.ownedByUser({ id: assessmentId, userId });
  if (!ownedByUser) {
    return null;
  }

  return answerRepository.findByChallengeAndAssessment({ challengeId, assessmentId: integerAssessmentId });
};

export { findAnswerByChallengeAndAssessment };
