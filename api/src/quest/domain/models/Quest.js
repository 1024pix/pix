import { KnowledgeElement } from '../../../shared/domain/models/index.js';

export const COMPARISON = {
  ALL: 'all',
  ONE_OF: 'one-of',
};

class Quest {
  constructor({ id, createdAt, rewardType, eligibilityRequirements, successRequirements, rewardId }) {
    this.id = id;
    this.createdAt = createdAt;
    this.rewardType = rewardType;
    this.rewardId = rewardId;
    this.eligibilityRequirements = eligibilityRequirements;
    this.successRequirements = successRequirements;
  }

  /**
   * @param {Eligibility} eligibility
   */
  isEligible(eligibility) {
    return this.eligibilityRequirements.every((eligibilityRequirement) =>
      this.#checkRequirement(eligibilityRequirement, eligibility),
    );
  }

  #checkRequirement(eligibilityRequirement, eligibility) {
    const comparaisonFunction = eligibilityRequirement.comparison === COMPARISON.ONE_OF ? 'some' : 'every';

    return Object.keys(eligibilityRequirement.data)[comparaisonFunction]((key) => {
      const eligibilityData = eligibility[eligibilityRequirement.type][key];
      const criterion = eligibilityRequirement.data[key];

      if (Array.isArray(criterion)) {
        return criterion.every((valueToTest) => eligibilityData.includes(valueToTest));
      }
      return eligibilityData === criterion;
    });
  }

  /**
   * @param {Success} success
   */
  isSuccessful(success) {
    const skillsCount = this.successRequirements[0].data.ids.length;
    const threshold = this.successRequirements[0].data.threshold / 100;
    const skillsValidatedCount = success.knowledgeElements.filter(
      (knowledgeElement) => knowledgeElement.status === KnowledgeElement.StatusType.VALIDATED,
    ).length;

    return skillsValidatedCount / skillsCount >= threshold;
  }
}

export { Quest };
