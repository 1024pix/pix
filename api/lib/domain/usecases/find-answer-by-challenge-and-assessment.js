export default async function findAnswerByChallengeAndAssessment({
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
}
