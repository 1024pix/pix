import { SmartRandomChallenge } from '../../../../../src/evaluation/domain/models/SmartRandomChallenge.js';
import { CHALLENGE_STATUSES as STATUSES } from '../../../../../src/shared/constants.js';
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
