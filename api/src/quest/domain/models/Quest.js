import { KnowledgeElement } from '../../../shared/domain/models/index.js';
import { TYPES as SUCCESS_TYPES } from './Success.js';

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
      // TODO: make quest algorithm handle Array or Object as data
      const eligibilityData = eligibility[eligibilityRequirement.type][key];
      const criterion = eligibilityRequirement.data[key];

      if (Array.isArray(criterion)) {
        return criterion.every((valueToTest) => eligibilityData.includes(valueToTest));
      }
      if (typeof criterion === 'object') {
        const comparaisonFunction = criterion.comparison === COMPARISON.ONE_OF ? 'some' : 'every';
        return criterion.value[comparaisonFunction]((valueToTest) => eligibilityData.includes(valueToTest));
      }
      return eligibilityData === criterion;
    });
  }

  /**
   * @param {Success} success
   */
  isSuccessful(success) {
    return this.successRequirements.every((successRequirement) => {
      if (successRequirement.type === SUCCESS_TYPES.SKILL) {
        return this.#validateSuccessRequirementsOfTypeSkill({ successRequirement, success });
      }
    });
  }

  #validateSuccessRequirementsOfTypeSkill({ successRequirement, success }) {
    const knowledgeElementValidatedForSuccess = success.knowledgeElements.filter(
      (knowledgeElement) =>
        successRequirement.data.ids.includes(knowledgeElement.skillId) &&
        knowledgeElement.status === KnowledgeElement.StatusType.VALIDATED,
    );
    const skillsCount = successRequirement.data.ids.length;
    const threshold = successRequirement.data.threshold / 100;

    const skillsValidatedCount = knowledgeElementValidatedForSuccess.length;

    return skillsValidatedCount / skillsCount >= threshold;
  }
}

export { Quest };
