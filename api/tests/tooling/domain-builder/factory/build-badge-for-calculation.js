const { BadgeForCalculation } = require('../../../../lib/domain/models/BadgeForCalculation');
const buildBadgeCriterionForCalculation = require('./build-badge-criterion-for-calculation');

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

module.exports = buildBadgeForCalculation;
