import { Candidate } from '../../../../../../src/certification/evaluation/domain/models/Candidate.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';

export const buildEvaluationCandidate = function ({
  accessibilityAdjustmentNeeded,
  reconciledAt = new Date('2024-10-18'),
  subscriptionScope = SCOPES.CORE,
  hasCleaSubscription = false,
} = {}) {
  return new Candidate({
    accessibilityAdjustmentNeeded,
    reconciledAt,
    subscriptionScope,
    hasCleaSubscription,
  });
};
