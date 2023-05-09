import { BadgeCriterion } from '../../../../lib/domain/models/BadgeForCalculation.js';

const buildBadgeCriterionForCalculation = function buildBadgeCriterionForCalculation({
  threshold = 80,
  skillIds = ['recCoucou'],
} = {}) {
  return new BadgeCriterion({
    threshold,
    skillIds,
  });
};

export { buildBadgeCriterionForCalculation };
