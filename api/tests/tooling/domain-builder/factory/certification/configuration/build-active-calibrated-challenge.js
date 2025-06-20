import { ActiveCalibratedChallenge } from '../../../../../../src/certification/configuration/domain/models/ActiveCalibratedChallenge.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';

export const buildActiveCalibratedChallenge = function ({
  scope = ComplementaryCertificationKeys.PIX_PLUS_DROIT,
  alpha = 1.4,
  delta = 2.2,
  challengeId = 'rec123',
} = {}) {
  return new ActiveCalibratedChallenge({ scope, alpha, delta, challengeId });
};
