export class BadgeForCalculation {
  constructor({ id, badgeCriteria }) {
    this.id = id;
    this.badgeCriteria = badgeCriteria;
  }

  shouldBeObtained(knowledgeElements) {
    return this.badgeCriteria.every((badgeCriterion) => badgeCriterion.isFulfilled(knowledgeElements));
  }

  getAcquisitionPercentage(knowledgeElements) {
    const summary = this.badgeCriteria.reduce((accumulator, badgeCriterion) => {
      return accumulator + badgeCriterion.getAcquisitionPercentage(knowledgeElements);
    }, 0);

    return Math.round(summary / this.badgeCriteria.length);
  }
}
