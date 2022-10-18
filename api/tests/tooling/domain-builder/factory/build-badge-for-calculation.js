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

module.exports = buildBadgeForCalculation;
