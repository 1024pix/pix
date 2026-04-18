import { SmartRandomChallenge, STATUSES } from '../../../../../src/evaluation/domain/models/SmartRandomChallenge.js';
import { buildChallenge } from '../learning-content/build-challenge.js';

export const buildSmartRandomChallenge = function ({
  id = 'challengeABC123',
  locales = ['en'],
  status = STATUSES.VALIDATED,
  skillId = 'skillDEF456',
  timer = null,
} = {}) {
  const coreChallenge = buildChallenge({
    id,
    locales,
    status,
    skillId,
    timer,
  });
  return new SmartRandomChallenge(coreChallenge);
};

buildSmartRandomChallenge.STATUSES = STATUSES;
