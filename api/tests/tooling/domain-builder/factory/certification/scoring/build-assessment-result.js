import { AssessmentResultFactory } from '../../../../../../src/certification/scoring/domain/models/factories/AssessmentResultFactory.js';

const buildAssessmentResult = {};

buildAssessmentResult.error = function ({ error, assessmentId, juryId, emitter } = {}) {
  return AssessmentResultFactory.buildAlgoErrorResult({ error, assessmentId, juryId, emitter });
};

buildAssessmentResult.standard = function ({
  pixScore,
  reproducibilityRate,
  status,
  assessmentId,
  juryId,
  emitter,
} = {}) {
  return AssessmentResultFactory.buildStandardAssessmentResult({
    pixScore,
    reproducibilityRate,
    status,
    assessmentId,
    juryId,
    emitter,
  });
};

buildAssessmentResult.notTrustable = function ({
  pixScore,
  reproducibilityRate,
  status,
  assessmentId,
  juryId,
  emitter,
} = {}) {
  return AssessmentResultFactory.buildNotTrustableAssessmentResult({
    pixScore,
    reproducibilityRate,
    status,
    assessmentId,
    juryId,
    emitter,
  });
};

buildAssessmentResult.fraud = function ({ pixScore, reproducibilityRate, assessmentId, juryId, competenceMarks } = {}) {
  return AssessmentResultFactory.buildFraud({ pixScore, reproducibilityRate, assessmentId, juryId, competenceMarks });
};

export { buildAssessmentResult };
