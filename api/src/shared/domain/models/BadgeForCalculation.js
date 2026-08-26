export class BadgeForCalculation {
  constructor({ id, badgeCriteria }) {
    this.id = id;
    this.badgeCriteria = badgeCriteria;
  }

  shouldBeObtained(knowledgeState) {
    return this.badgeCriteria.every((badgeCriterion) => badgeCriterion.isFulfilled(knowledgeState));
  }

  getAcquisitionPercentage(knowledgeState) {
    const summary = this.badgeCriteria.reduce((accumulator, badgeCriterion) => {
      return accumulator + badgeCriterion.getAcquisitionPercentage(knowledgeState);
    }, 0);

    return Math.round(summary / this.badgeCriteria.length);
  }
}
