import { KnowledgeElement } from '../../../shared/domain/models/index.js';
import { TYPES as ELIGIBILITY_TYPES } from './Eligibility.js';

export const COMPARISON = {
  ALL: 'all',
  ONE_OF: 'one-of',
};

export const COMPOSE_TYPE = 'compose';

class Quest {
  constructor({ id, createdAt, updatedAt, rewardType, eligibilityRequirements, successRequirements, rewardId }) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.rewardType = rewardType;
    this.rewardId = rewardId;
    this.eligibilityRequirements = eligibilityRequirements;
    this.successRequirements = successRequirements;
  }

  /**
   * @param {Eligibility} eligibility
   * @param {number} campaignParticipationId
   */
  isCampaignParticipationContributingToQuest({ eligibility, campaignParticipationId }) {
    const scopedEligibility = eligibility.buildEligibilityScopedByCampaignParticipationId({ campaignParticipationId });

    const campaignParticipationRequirements = this.#flattenRequirementsByType(
      this.eligibilityRequirements,
      ELIGIBILITY_TYPES.CAMPAIGN_PARTICIPATIONS,
    );
    const otherRequirements = this.#omitRequirementsByType(
      this.eligibilityRequirements,
      ELIGIBILITY_TYPES.CAMPAIGN_PARTICIPATIONS,
    );

    const eligibilityRequirements = otherRequirements;
    if (campaignParticipationRequirements.length > 0) {
      eligibilityRequirements.push({
        type: COMPOSE_TYPE,
        data: campaignParticipationRequirements,
        comparison: COMPARISON.ONE_OF,
      });
    }
    return this.#isEligible(scopedEligibility, eligibilityRequirements);
  }

  #omitRequirementsByType(requirements, type) {
    let result = [];
    for (const requirement of requirements) {
      if (requirement.type === COMPOSE_TYPE) {
        result = result.push(this.#omitRequirementsByType(requirement.data, type));
      } else if (requirement.type !== type) {
        result.push(requirement);
      }
    }
    return result;
  }

  #flattenRequirementsByType(requirements, type) {
    let result = [];
    const filteredRequierements = requirements.filter((requirement) => [type, COMPOSE_TYPE].includes(requirement.type));
    for (const requirement of filteredRequierements) {
      if (requirement.type === COMPOSE_TYPE) {
        result = result.concat(this.#flattenRequirementsByType(requirement.data, type));
      } else {
        result.push(requirement);
      }
    }
    return result;
  }

  #getComparisonFunction(comparison) {
    return comparison === COMPARISON.ONE_OF ? 'some' : 'every';
  }

  #isEligible(eligibility, eligibilityRequirements, comparison = COMPARISON.ALL) {
    const comparisonFunction = this.#getComparisonFunction(comparison);
    return eligibilityRequirements[comparisonFunction]((eligibilityRequirement) => {
      if (eligibilityRequirement.type === COMPOSE_TYPE) {
        return this.#isEligible(eligibility, eligibilityRequirement.data, eligibilityRequirement.comparison);
      } else {
        return this.#checkRequirement(eligibilityRequirement, eligibility);
      }
    });
  }

  /**
   * @param {Eligibility} eligibility
   */
  isEligible(eligibility) {
    return this.#isEligible(eligibility, this.eligibilityRequirements);
  }

  #checkCriterion({ criterion, eligibilityData }) {
    if (Array.isArray(criterion)) {
      if (Array.isArray(eligibilityData)) {
        return criterion.every((valueToTest) => eligibilityData.includes(valueToTest));
      }
      return criterion.some((valueToTest) => valueToTest === eligibilityData);
    }
    return eligibilityData === criterion;
  }

  #checkRequirement(eligibilityRequirement, eligibility) {
    const comparisonFunction = this.#getComparisonFunction(eligibilityRequirement.comparison);

    if (Array.isArray(eligibility[eligibilityRequirement.type])) {
      return eligibility[eligibilityRequirement.type].some((item) => {
        return Object.keys(eligibilityRequirement.data)[comparisonFunction]((key) => {
          // TODO: Dés que les quêtes ont été mises à jour il faudra retirer cette ligne
          const alterKey = key === 'targetProfileIds' ? 'targetProfileId' : key;
          return this.#checkCriterion({
            criterion: eligibilityRequirement.data[key],
            eligibilityData: item[alterKey],
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
    const skillsCount = this.successRequirements[0].data.ids.length;
    const threshold = this.successRequirements[0].data.threshold / 100;
    const skillsValidatedCount = success.knowledgeElements.filter(
      (knowledgeElement) => knowledgeElement.status === KnowledgeElement.StatusType.VALIDATED,
    ).length;

    return skillsValidatedCount / skillsCount >= threshold;
  }
}

export { Quest };
