class BadgeForCalculation {
  constructor({ id, badgeCriteria }) {
    this.id = id;
    this.badgeCriteria = badgeCriteria;
  }
}

class BadgeCriterion {
  constructor({ threshold, skillIds }) {
    this.threshold = threshold;
    this.skillIds = skillIds;
  }
}

module.exports = {
  BadgeForCalculation,
  BadgeCriterion,
};
