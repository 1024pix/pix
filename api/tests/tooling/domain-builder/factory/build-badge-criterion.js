import { BadgeCriterion } from '../../../../lib/shared/domain/models/BadgeCriterion.js';

const buildBadgeCriterion = function ({
  id = 1,
  scope = BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
  threshold = 40,
  skillSetIds = [],
} = {}) {
  return new BadgeCriterion({
    id,
    scope,
    threshold,
    skillSetIds,
  });
};

export { buildBadgeCriterion };
