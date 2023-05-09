import { BadgeForCalculation } from '../../../../lib/domain/models/BadgeForCalculation.js';
import { buildBadgeCriterionForCalculation } from './build-badge-criterion-for-calculation.js';

const buildBadgeForCalculation = function buildBadgeForCalculation({
  id = 1,
  badgeCriteria = [buildBadgeCriterionForCalculation()],
} = {}) {
  return new BadgeForCalculation({
    id,
    badgeCriteria,
  });
};

buildBadgeForCalculation.mockObtainable = function buildObtainable({ id, badgeCriteriaForCalculation }) {
  const badgeForCalculation = buildBadgeForCalculation({ id, badgeCriteria: badgeCriteriaForCalculation });
  badgeForCalculation.shouldBeObtained = () => true;
  return badgeForCalculation;
};

buildBadgeForCalculation.mockNotObtainable = function buildObtainable({ id, badgeCriteriaForCalculation }) {
  const badgeForCalculation = buildBadgeForCalculation({ id, badgeCriteria: badgeCriteriaForCalculation });
  badgeForCalculation.shouldBeObtained = () => false;
  return badgeForCalculation;
};

export { buildBadgeForCalculation };
