import { BadgeCriterion, SCOPES } from '../../../../src/shared/domain/models/BadgeDetails.js';

const buildBadgeCriterion = function ({
  id = 1,
  scope = SCOPES.CAPPED_TUBES,
  threshold = 50,
  badgeId = 1,
  cappedTubes = null,
  name = null,
} = {}) {
  return new BadgeCriterion({
    id,
    scope,
    threshold,
    badgeId,
    cappedTubes,
    name,
  });
};

export { buildBadgeCriterion };
