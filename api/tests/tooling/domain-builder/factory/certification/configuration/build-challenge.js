import { Challenge } from '../../../../../../src/certification/configuration/domain/models/Challenge.js';
import { buildBaseChallenge } from '../../shared/build-base-challenge.js';

export const buildChallenge = function ({ id = 'challengeABC123', skillId = 'skillDEF456' } = {}) {
  const baseChallenge = buildBaseChallenge({
    id,
    skillId,
  });
  return new Challenge(baseChallenge);
};

buildChallenge.STATUSES = buildBaseChallenge.STATUSES;
