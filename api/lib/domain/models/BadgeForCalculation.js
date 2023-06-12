export class BadgeForCalculation {
  constructor({ id, badgeCriteria }) {
    this.id = id;
    this.badgeCriteria = badgeCriteria;
  }

  shouldBeObtained(knowledgeElements) {
    return this.badgeCriteria.every((badgeCriterion) => badgeCriterion.isFulfilled(knowledgeElements));
  }
}
