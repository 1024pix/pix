import Joi from 'joi';

import { EntityValidationError } from '../../../../../shared/domain/errors.js';
import { logger } from '../../../../../shared/infrastructure/utils/logger.js';
import { COMPARISONS as _CRITERION_COMPARISONS } from '../value-objects/CriterionProperty.js';
import {
  COMPARISONS as _REQUIREMENT_COMPARISONS,
  ComposedRequirement,
  TYPES as _REQUIREMENT_TYPES,
} from '../value-objects/Requirement.js';
/**
 * @typedef {import ('../aggregates/DataForQuest.js').DataForQuest} DataForQuest
 */

export const REQUIREMENT_COMPARISONS = _REQUIREMENT_COMPARISONS;
export const CRITERION_COMPARISONS = _CRITERION_COMPARISONS;
export const REQUIREMENT_TYPES = _REQUIREMENT_TYPES;

const schema = Joi.object({
  eligibilityRequirements: Joi.array().items(Joi.object()).required(),
  successRequirements: Joi.array().items(Joi.object()).required(),
  rewardType: Joi.string().valid('attestations').allow(null),
  rewardId: Joi.number().allow(null),
});

class Quest {
  #eligibilityRequirements;
  #successRequirements;

  constructor({ id, createdAt, updatedAt, rewardType, eligibilityRequirements, successRequirements, rewardId }) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    this.#validate({ rewardType, rewardId, eligibilityRequirements, successRequirements });

    this.rewardType = rewardType;
    this.rewardId = rewardId;
    this.#eligibilityRequirements = new ComposedRequirement({
      data: eligibilityRequirements,
      comparison: REQUIREMENT_COMPARISONS.ALL,
    });

    this.#successRequirements = new ComposedRequirement({
      data: successRequirements,
      comparison: REQUIREMENT_COMPARISONS.ALL,
    });
  }

  #validate(quest) {
    const { error } = schema.validate(quest);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details, undefined, { data: quest });
    }
  }

  get eligibilityRequirements() {
    return this.#eligibilityRequirements.data;
  }

  get successRequirements() {
    return this.#successRequirements.data;
  }

  /**
   * @param {DataForQuest} data
   */
  findTargetProfileIdsWithoutCampaignParticipationContributingToQuest(data) {
    const campaignParticipationRequirements = this.#flattenRequirementsByType(
      [...this.#eligibilityRequirements.data, ...this.#successRequirements.data],
      REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
    );
    if (campaignParticipationRequirements.length === 0) return [];

    const targetProfileIds = campaignParticipationRequirements
      .map((requirement) => requirement.data?.targetProfileId?.data)
      .filter(Boolean)
      .flat();

    return targetProfileIds.filter(
      (targetProfileId) => data.campaignParticipations.findIndex((p) => p.targetProfileId === targetProfileId) === -1,
    );
  }

  /**
   * @param {DataForQuest} data
   */
  findCampaignParticipationIdsContributingToQuest(data) {
    const campaignParticipationRequirements = this.#flattenRequirementsByType(
      [...this.#eligibilityRequirements.data, ...this.#successRequirements.data],
      REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
    );
    const oneOfCampaignParticipationsRequirement = new ComposedRequirement({
      data: campaignParticipationRequirements,
      comparison: REQUIREMENT_COMPARISONS.ONE_OF,
    });
    if (campaignParticipationRequirements.length > 0) {
      return data.campaignParticipations
        .map((campaignParticipation) => {
          const scopedData = data.buildDataForQuestScopedByCampaignParticipationId({
            campaignParticipationId: campaignParticipation.id,
          });
          if (oneOfCampaignParticipationsRequirement.isFulfilled(scopedData)) {
            return campaignParticipation.id;
          }
          return null;
        })
        .filter(Boolean);
    }
    return [];
  }

  /**
   * @param {object} params
   * @param {DataForQuest} params.data
   * @param {number} params.campaignParticipationId
   */
  isCampaignParticipationContributingToQuest({ data, campaignParticipationId }) {
    const scopedData = data.buildDataForQuestScopedByCampaignParticipationId({ campaignParticipationId });

    const campaignParticipationRequirements = this.#flattenRequirementsByType(
      [...this.#eligibilityRequirements.data, ...this.#successRequirements.data],
      REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
    );

    if (campaignParticipationRequirements.length > 0) {
      const oneOfCampaignParticipationsRequirement = new ComposedRequirement({
        data: campaignParticipationRequirements,
        comparison: REQUIREMENT_COMPARISONS.ONE_OF,
      });
      return oneOfCampaignParticipationsRequirement.isFulfilled(scopedData);
    }

    return false;
  }

  /**
   * @param {DataForQuest} data
   */
  isEligible(data) {
    const isFulfilled = this.#eligibilityRequirements.isFulfilled(data);
    logger.debug({ name: `QuestId: ${this.id} isEligible`, isFulfilled });
    return isFulfilled;
  }

  /**
   * @param {DataForQuest} data
   */
  isSuccessful(data) {
    const isFulfilled = this.#successRequirements.isFulfilled(data);
    logger.debug({ name: `QuestId: ${this.id} isSuccessFul`, isFulfilled });
    return isFulfilled;
  }

  toDTO() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      rewardType: this.rewardType,
      rewardId: this.rewardId,
      eligibilityRequirements: this.#eligibilityRequirements.data.map((item) => item.toDTO()),
      successRequirements: this.#successRequirements.data.map((item) => item.toDTO()),
    };
  }

  #flattenRequirementsByType(requirements, type) {
    let result = [];
    const filteredRequirements = requirements.filter((requirement) =>
      [type, REQUIREMENT_TYPES.COMPOSE].includes(requirement.requirement_type),
    );
    for (const requirement of filteredRequirements) {
      if (requirement.requirement_type === REQUIREMENT_TYPES.COMPOSE) {
        result = result.concat(this.#flattenRequirementsByType(requirement.data, type));
      } else {
        result.push(requirement);
      }
    }
    return result;
  }
}

export { Quest };
