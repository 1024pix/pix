import { AssessmentResultFactory } from '../../../../../../src/certification/scoring/domain/models/factories/AssessmentResultFactory.js';

const buildAssessmentResult = {};

buildAssessmentResult.error = function ({ error, assessmentId, juryId } = {}) {
  return AssessmentResultFactory.buildAlgoErrorResult({ error, assessmentId, juryId });
};

buildAssessmentResult.standard = function ({ pixScore, reproducibilityRate, status, assessmentId, juryId } = {}) {
  return AssessmentResultFactory.buildStandardAssessmentResult({
    pixScore,
    reproducibilityRate,
    status,
    assessmentId,
    juryId,
  });
};

buildAssessmentResult.notTrustable = function ({ pixScore, reproducibilityRate, assessmentId, juryId } = {}) {
  return AssessmentResultFactory.buildNotTrustableAssessmentResult({
    pixScore,
    reproducibilityRate,
    assessmentId,
    juryId,
  });
};

buildAssessmentResult.fraud = function ({ pixScore, reproducibilityRate, assessmentId, juryId, competenceMarks } = {}) {
  return AssessmentResultFactory.buildFraud({ pixScore, reproducibilityRate, assessmentId, juryId, competenceMarks });
};

buildAssessmentResult.insufficientCorrectAnswers = function ({
  pixScore,
  reproducibilityRate,
  assessmentId,
  juryId,
  competenceMarks,
} = {}) {
  return AssessmentResultFactory.buildInsufficientCorrectAnswers({
    pixScore,
    reproducibilityRate,
    assessmentId,
    juryId,
    competenceMarks,
  });
};

buildAssessmentResult.lackOfAnswersForTechnicalReason = function ({
  pixScore,
  reproducibilityRate,
  assessmentId,
  juryId,
  competenceMarks,
} = {}) {
  return AssessmentResultFactory.buildLackOfAnswersForTechnicalReason({
    pixScore,
    reproducibilityRate,
    assessmentId,
    juryId,
    competenceMarks,
  });
};

export { buildAssessmentResult };
