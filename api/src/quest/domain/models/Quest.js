import { KnowledgeElement } from '../../../shared/domain/models/index.js';
import { TYPES as ELIGIBILITY_TYPES } from './Eligibility.js';
import { COMPOSE_TYPE, EligibilityRequirement } from './EligibilityRequirement.js';

export const COMPARISON = {
  ALL: 'all',
  ONE_OF: 'one-of',
};

class Quest {
  #eligibilityRequirements;

  constructor({ id, createdAt, updatedAt, rewardType, eligibilityRequirements, successRequirements, rewardId }) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.rewardType = rewardType;
    this.rewardId = rewardId;
    this.#eligibilityRequirements = new EligibilityRequirement({
      requirement_type: COMPOSE_TYPE,
      data: eligibilityRequirements,
      comparison: COMPARISON.ALL,
    });

    this.successRequirements = successRequirements;
  }

  get eligibilityRequirements() {
    return this.#eligibilityRequirements.data;
  }

  /**
   * @param {Eligibility} eligibility
   * @param {number} campaignParticipationId
   */
  isCampaignParticipationContributingToQuest({ eligibility, campaignParticipationId }) {
    const scopedEligibility = eligibility.buildEligibilityScopedByCampaignParticipationId({ campaignParticipationId });

    const campaignParticipationRequirements = this.#flattenRequirementsByType(
      this.#eligibilityRequirements.data,
      ELIGIBILITY_TYPES.CAMPAIGN_PARTICIPATIONS,
    );
    const otherRequirements = this.#omitRequirementsByType(
      this.#eligibilityRequirements.data,
      ELIGIBILITY_TYPES.CAMPAIGN_PARTICIPATIONS,
    );

    const eligibilityRequirements = otherRequirements;
    if (campaignParticipationRequirements.length > 0) {
      eligibilityRequirements.push(
        new EligibilityRequirement({
          requirement_type: COMPOSE_TYPE,
          data: campaignParticipationRequirements,
          comparison: COMPARISON.ONE_OF,
        }),
      );
    }
    const scopedEligibilityRequirements = new EligibilityRequirement({
      requirement_type: COMPOSE_TYPE,
      data: eligibilityRequirements,
      comparison: COMPARISON.ALL,
    });
    return scopedEligibilityRequirements.isEligible(scopedEligibility);
  }

  /**
   * @param {Eligibility} eligibility
   */
  isEligible(eligibility) {
    return this.#eligibilityRequirements.isEligible(eligibility);
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

  toDTO() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      rewardType: this.rewardType,
      rewardId: this.rewardId,
      eligibilityRequirements: this.#eligibilityRequirements.data.map((item) => item.toDTO()),
      successRequirements: this.successRequirements,
    };
  }

  #omitRequirementsByType(requirements, type) {
    const result = [];
    for (const requirement of requirements) {
      if (requirement.requirement_type === COMPOSE_TYPE) {
        const subRequirements = this.#omitRequirementsByType(requirement.data, type);
        if (subRequirements.length > 0) {
          result.push(
            new EligibilityRequirement({
              requirement_type: requirement.requirement_type,
              data: subRequirements,
              comparison: requirement.comparison,
            }),
          );
        }
      } else if (requirement.requirement_type !== type) {
        result.push(requirement);
      }
    }
    return result;
  }

  #flattenRequirementsByType(requirements, type) {
    let result = [];
    const filteredRequirements = requirements.filter((requirement) =>
      [type, COMPOSE_TYPE].includes(requirement.requirement_type),
    );
    for (const requirement of filteredRequirements) {
      if (requirement.requirement_type === COMPOSE_TYPE) {
        result = result.concat(this.#flattenRequirementsByType(requirement.data, type));
      } else {
        result.push(requirement);
      }
    }
    return result;
  }
}

export { Quest };
