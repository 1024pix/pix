import { SmartRandomChallenge, STATUSES } from '../../../../../src/evaluation/domain/models/SmartRandomChallenge.js';
import { buildBaseChallenge } from '../shared/build-base-challenge.js';

export const buildSmartRandomChallenge = function ({
  id = 'challengeABC123',
  locales = ['en'],
  status = STATUSES.VALIDATED,
  skillId = 'skillDEF456',
  timer = null,
} = {}) {
  const baseChallenge = buildBaseChallenge({
    id,
    locales,
    status,
    skillId,
    timer,
  });
  return new SmartRandomChallenge(baseChallenge);
};

buildSmartRandomChallenge.STATUSES = STATUSES;
