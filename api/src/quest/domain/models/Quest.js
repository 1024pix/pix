import { KnowledgeElement } from '../../../shared/domain/models/index.js';
import { TYPES as ELIGIBILITY_TYPES } from './Eligibility.js';
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

  isGrantedWithParticipationId({ eligibility, campaignParticipationId }) {
    const criterion = this.eligibilityRequirements.filter(
      (eligibilityRequirement) => eligibilityRequirement.type === ELIGIBILITY_TYPES.CAMPAIGN_PARTICIPATIONS,
    );
    const eligibilityData = eligibility.campaignParticipations.filter(
      (campaignParticipation) => campaignParticipation.id === campaignParticipationId,
    );

    // run to the loop ?
    return false;
  }

  #checkCriterion({ criterion, eligibilityData }) {
    if (Array.isArray(criterion)) {
      if (Array.isArray(eligibilityData)) {
        return criterion.every((valueToTest) => eligibilityData.includes(valueToTest));
      }
      return criterion.some((valueToTest) => valueToTest === eligibilityData);
    }
    if (typeof criterion === 'object') {
      const comparisonFunction = criterion.comparison === COMPARISON.ONE_OF ? 'some' : 'every';
      return criterion.value[comparisonFunction]((valueToTest) => eligibilityData.includes(valueToTest));
    }
    return eligibilityData === criterion;
  }

  #checkRequirement(eligibilityRequirement, eligibility) {
    const comparisonFunction = eligibilityRequirement.comparison === COMPARISON.ONE_OF ? 'some' : 'every';

    if (Array.isArray(eligibility[eligibilityRequirement.type])) {
      return eligibility[eligibilityRequirement.type].some((item) => {
        return Object.keys(eligibilityRequirement.data)[comparisonFunction]((key) => {
          // TODO: Dés que les quêtes ont été mises à jour il faudra retirer cette ligne
          const alterKey = key === 'targetProfileIds' ? 'targetProfileId' : key;
          return this.#checkCriterion({
            criterion: eligibilityRequirement.data[alterKey],
            eligibilityData: item[key],
          });
        });
      });
    }

    return Object.keys(eligibilityRequirement.data)[comparisonFunction]((key) => {
      return this.#checkCriterion({
        criterion: eligibilityRequirement.data[key],
        eligibilityData: eligibility[eligibilityRequirement.type][key],
      });
    });
  }

  /**
   * @param {Success} success
   */
  isSuccessful(success) {
    if (this.successRequirements === undefined || this.successRequirements.length === 0) return true;

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
