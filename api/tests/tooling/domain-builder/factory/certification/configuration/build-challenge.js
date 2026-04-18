import { Challenge } from '../../../../../../src/certification/configuration/domain/models/Challenge.js';
import { buildChallenge as buildCoreChallenge } from '../../learning-content/build-challenge.js';

export const buildChallenge = function ({ id = 'challengeABC123', skillId = 'skillDEF456' } = {}) {
  const baseChallenge = buildCoreChallenge({
    id,
    skillId,
  });
  return new Challenge(baseChallenge);
};

buildChallenge.STATUSES = buildCoreChallenge.STATUSES;
