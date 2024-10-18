import { Candidate } from '../../../../../../src/certification/evaluation/domain/models/Candidate.js';

const buildEvaluationCandidate = function ({
  accessibilityAdjustmentNeeded,
  reconciledAt = new Date('2024-10-18'),
} = {}) {
  return new Candidate({
    accessibilityAdjustmentNeeded,
    reconciledAt,
  });
};

export { buildEvaluationCandidate };
