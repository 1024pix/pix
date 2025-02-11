import { Criterion } from './Criterion.js';
import { COMPARISON } from './Quest.js';

export const COMPOSE_TYPE = 'compose';

export class EligibilityRequirement {
  #requirement_type;
  #subRequirements = null;
  #criterion = null;
  #comparison;

  constructor({ requirement_type, data, comparison }) {
    this.#requirement_type = requirement_type;
    if (this.#requirement_type === COMPOSE_TYPE) {
      this.#subRequirements = data.map((eligibilityRequirement) => {
        if (eligibilityRequirement instanceof EligibilityRequirement) {
          return eligibilityRequirement;
        }
        return new EligibilityRequirement({
          requirement_type: eligibilityRequirement.requirement_type,
          data: eligibilityRequirement.data,
          comparison: eligibilityRequirement.comparison,
        });
      });
    } else {
      this.#criterion = data instanceof Criterion ? data : new Criterion({ data });
    }
    this.#comparison = comparison;
  }

  get requirement_type() {
    return this.#requirement_type;
  }

  get data() {
    if (this.#requirement_type === COMPOSE_TYPE) {
      return Object.freeze(this.#subRequirements);
    }
    return this.#criterion;
  }

  get comparison() {
    return this.#comparison;
  }

  #getComparisonFunction(comparison) {
    return comparison === COMPARISON.ONE_OF ? 'some' : 'every';
  }

  isEligible(eligibility) {
    const comparisonFunction = this.#getComparisonFunction(this.#comparison);
    if (this.#requirement_type === COMPOSE_TYPE) {
      return this.#subRequirements[comparisonFunction]((eligibilityRequirement) =>
        eligibilityRequirement.isEligible(eligibility),
      );
    }
    return this.#checkRequirement(eligibility);
  }

  #checkRequirement(eligibility) {
    const comparisonFunction = this.#getComparisonFunction(this.#comparison);

    if (Array.isArray(eligibility[this.#requirement_type])) {
      return eligibility[this.#requirement_type].some((item) => {
        return this.#criterion.check({ item, comparisonFunction });
      });
    }

    return this.#criterion.check({ item: eligibility[this.#requirement_type], comparisonFunction });
  }

  toDTO() {
    let data;
    if (this.#requirement_type === COMPOSE_TYPE) {
      data = this.#subRequirements.map((item) => item.toDTO());
    } else {
      data = this.#criterion.toDTO();
    }
    return {
      requirement_type: this.#requirement_type,
      data,
      comparison: this.#comparison,
    };
  }
}
