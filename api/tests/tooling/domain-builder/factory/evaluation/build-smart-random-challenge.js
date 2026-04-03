import { SmartRandomChallenge, STATUSES } from '../../../../../src/evaluation/domain/models/SmartRandomChallenge.js';

export const buildSmartRandomChallenge = function ({
  id = 'challengeABC123',
  locales = ['en'],
  status = STATUSES.VALIDATED,
  skillId = 'skillDEF456',
  timer = null,
} = {}) {
  return new SmartRandomChallenge({
    id,
    locales,
    status,
    skillId,
    timer,
  });
};

buildSmartRandomChallenge.STATUSES = STATUSES;
