export const isLackOfAnswersForTechnicalReason = ({ certificationCourse, certificationAssessmentScore }) => {
  return certificationCourse.isAbortReasonTechnical() && certificationAssessmentScore.hasInsufficientCorrectAnswers();
};
