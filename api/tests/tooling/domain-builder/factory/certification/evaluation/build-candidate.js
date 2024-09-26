import { Candidate } from '../../../../../../src/certification/evaluation/domain/models/Candidate.js';

const buildEvaluationCandidate = function ({ accessibilityAdjustmentNeeded } = {}) {
  return new Candidate({
    accessibilityAdjustmentNeeded,
  });
};

export { buildEvaluationCandidate };
