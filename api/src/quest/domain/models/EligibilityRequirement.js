import { COMPARISON } from './Quest.js';

export const COMPOSE_TYPE = 'compose';

export class EligibilityRequirement {
  #requirement_type;
  #data;
  #comparison;

  constructor({ requirement_type, data, comparison }) {
    this.#requirement_type = requirement_type;
    if (this.#requirement_type === COMPOSE_TYPE) {
      this.#data = data.map((eligibilityRequirementRaw) => new EligibilityRequirement(eligibilityRequirementRaw));
    } else {
      this.#data = data;
    }
    this.#comparison = comparison;
  }

  get requirement_type() {
    return this.#requirement_type;
  }

  get data() {
    return Object.freeze(this.#data);
  }

  get comparison() {
    return this.#comparison;
  }

  isEligible(eligibility) {
    const comparisonFunction = this.#getComparisonFunction(this.#comparison);
    if (this.#requirement_type === COMPOSE_TYPE) {
      return this.#data[comparisonFunction]((eligibilityRequirement) => eligibilityRequirement.isEligible(eligibility));
    }
    return this.#checkRequirement(eligibility);
  }

  toDTO() {
    let data;
    if (this.#requirement_type === COMPOSE_TYPE) {
      data = this.#data.map((item) => item.toDTO());
    } else {
      data = this.#data;
    }
    return {
      requirement_type: this.#requirement_type,
      data,
      comparison: this.#comparison,
    };
  }

  #getComparisonFunction(comparison) {
    return comparison === COMPARISON.ONE_OF ? 'some' : 'every';
  }

  #checkRequirement(eligibility) {
    const comparisonFunction = this.#getComparisonFunction(this.#comparison);

    if (Array.isArray(eligibility[this.#requirement_type])) {
      return eligibility[this.#requirement_type].some((item) => {
        return Object.keys(this.#data)[comparisonFunction]((key) => {
          // TODO: Dés que les quêtes ont été mises à jour il faudra retirer cette ligne
          const alterKey = key === 'targetProfileIds' ? 'targetProfileId' : key;
          return this.#checkCriterion({
            criterion: this.#data[key],
            eligibilityData: item[alterKey],
          });
        });
      });
    }

    return Object.keys(this.#data)[comparisonFunction]((key) => {
      return this.#checkCriterion({
        criterion: this.#data[key],
        eligibilityData: eligibility[this.#requirement_type][key],
      });
    });
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
}
