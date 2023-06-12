import { BadgeCriterionForCalculation } from '../../../../lib/domain/models/BadgeCriterionForCalculation.js';

const buildBadgeCriterionForCalculation = function buildBadgeCriterionForCalculation({
  threshold = 80,
  skillIds = ['recCoucou'],
} = {}) {
  return new BadgeCriterionForCalculation({
    threshold,
    skillIds,
  });
};

export { buildBadgeCriterionForCalculation };
