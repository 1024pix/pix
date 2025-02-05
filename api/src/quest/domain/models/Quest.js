import { KnowledgeElement } from '../../../shared/domain/models/index.js';
import { TYPES as ELIGIBILITY_TYPES } from './Eligibility.js';

export const COMPARISON = {
  ALL: 'all',
  ONE_OF: 'one-of',
};

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
    const isCampaignParticipationType = (requirement) => requirement.type === ELIGIBILITY_TYPES.CAMPAIGN_PARTICIPATIONS;
    const isNotCampaignParticipationType = (requirement) =>
      requirement.type !== ELIGIBILITY_TYPES.CAMPAIGN_PARTICIPATIONS;
    const partitionRequirements = (requirements) => {
      return [requirements.filter(isCampaignParticipationType), requirements.filter(isNotCampaignParticipationType)];
    };
    const [requirementsOfCampaignParticipationType, othersRequirements] = partitionRequirements(
      this.eligibilityRequirements,
    );
    let requirementSpecifiqueALaParticipationEstOk = true;
    if (requirementsOfCampaignParticipationType.length > 0) {
      requirementSpecifiqueALaParticipationEstOk = requirementsOfCampaignParticipationType.some(
        (eligibilityRequirement) => this.#checkRequirement(eligibilityRequirement, scopedEligibility),
      );
    }

    return (
      requirementSpecifiqueALaParticipationEstOk &&
      othersRequirements.every((eligibilityRequirement) =>
        this.#checkRequirement(eligibilityRequirement, scopedEligibility),
      )
    );
  }

  /**
   * @param {Eligibility} eligibility
   */
  isEligible(eligibility) {
    return this.eligibilityRequirements.every((eligibilityRequirement) =>
      this.#checkRequirement(eligibilityRequirement, eligibility),
    );
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
    const comparisonFunction = eligibilityRequirement.comparison === COMPARISON.ONE_OF ? 'some' : 'every';

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
