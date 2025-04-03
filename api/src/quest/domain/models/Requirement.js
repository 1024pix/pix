import { Criterion } from './Criterion.js';

export const COMPARISONS = {
  ALL: 'all',
  ONE_OF: 'one-of',
};

export const TYPES = {
  COMPOSE: 'compose',
  SKILL_PROFILE: 'skillProfile',
  CAPPED_TUBES: 'cappedTubes',
  OBJECT: {
    ORGANIZATION_LEARNER: 'organizationLearner',
    ORGANIZATION: 'organization',
    CAMPAIGN_PARTICIPATIONS: 'campaignParticipations',
  },
};

function getComparisonFunction(comparison) {
  return comparison === COMPARISONS.ONE_OF ? 'some' : 'every';
}

class BaseRequirement {
  requirement_type;
  comparison;

  constructor({ requirement_type, comparison }) {
    this.requirement_type = requirement_type;
    this.comparison = comparison;
  }

  /**
   * @param {Eligibility|Success} _
   * @returns {Boolean}
   */
  isFulfilled(_) {
    throw new Error('implement me !');
  }

  /**
   * @returns {Object}
   */
  toDTO() {
    return {
      requirement_type: this.requirement_type,
      comparison: this.comparison,
    };
  }
}

export class ComposedRequirement extends BaseRequirement {
  #subRequirements = null;

  constructor({ data, comparison }) {
    super({ requirement_type: TYPES.COMPOSE, comparison });
    this.#subRequirements = data.map((subRequirement) => {
      if (subRequirement instanceof BaseRequirement) {
        return subRequirement;
      }
      return buildRequirement({
        requirement_type: subRequirement.requirement_type,
        data: subRequirement.data,
        comparison: subRequirement.comparison,
      });
    });
  }

  get data() {
    return Object.freeze(this.#subRequirements);
  }

  /**
   * @param {Eligibility|Success} dataInput
   * @returns {Boolean}
   */
  isFulfilled(dataInput) {
    const comparisonFunction = getComparisonFunction(this.comparison);
    return this.#subRequirements[comparisonFunction]((subRequirement) => subRequirement.isFulfilled(dataInput));
  }

  /**
   * @returns {Object}
   */
  toDTO() {
    return {
      ...super.toDTO(),
      data: this.#subRequirements.map((subRequirement) => subRequirement.toDTO()),
    };
  }
}

export class ObjectRequirement extends BaseRequirement {
  #criterion;

  constructor({ requirement_type, data, comparison }) {
    super({ requirement_type, comparison });
    this.#criterion = data instanceof Criterion ? data : new Criterion({ data });
  }

  get data() {
    return Object.freeze(this.#criterion);
  }

  /**
   * @param {Eligibility|Success} dataInput
   * @returns {Boolean}
   */
  isFulfilled(dataInput) {
    const comparisonFunction = getComparisonFunction(this.comparison);

    if (Array.isArray(dataInput[this.requirement_type])) {
      return dataInput[this.requirement_type].some((item) => {
        return this.#criterion.check({ item, comparisonFunction });
      });
    }

    return this.#criterion.check({ item: dataInput[this.requirement_type], comparisonFunction });
  }

  toDTO() {
    return {
      ...super.toDTO(),
      data: this.#criterion.toDTO(),
    };
  }
}

export class SkillProfileRequirement extends BaseRequirement {
  #skillIds;
  #threshold;

  constructor({ data }) {
    super({ requirement_type: TYPES.SKILL_PROFILE, comparison: null });
    this.#skillIds = data.skillIds;
    this.#threshold = data.threshold;
  }

  /**
   * @returns {Object}
   */
  get data() {
    return {
      skillIds: Object.freeze(this.#skillIds),
      threshold: this.#threshold,
    };
  }

  /**
   * @param {Eligibility|Success} dataInput
   * @returns {Boolean}
   */
  isFulfilled(dataInput) {
    const masteryPercentage = dataInput.getMasteryPercentageForSkills(this.#skillIds);
    return masteryPercentage >= this.#threshold;
    // la comparaison ici pourrait être celle du requirement ? pour pouvoir avoir de la flexi sur =<>=
  }

  /**
   * @returns {Object}
   */
  toDTO() {
    const superDto = super.toDTO();
    delete superDto.comparison;
    return {
      ...superDto,
      data: this.data,
    };
  }
}

export class CappedTubesRequirement extends BaseRequirement {
  #cappedTubes;
  #threshold;

  constructor({ data }) {
    super({ requirement_type: TYPES.CAPPED_TUBES, comparison: null });
    this.#cappedTubes = data.cappedTubes;
    this.#threshold = data.threshold;
  }

  /**
   * @returns {Object}
   */
  get data() {
    return {
      cappedTubes: Object.freeze(this.#cappedTubes),
      threshold: this.#threshold,
    };
  }

  /**
   * @param {Eligibility|Success} dataInput
   * @returns {Boolean}
   */
  isFulfilled(dataInput) {
    const masteryPercentage = dataInput.getMasteryPercentageForCappedTubes(this.#cappedTubes);
    return masteryPercentage >= this.#threshold;
  }

  /**
   * @returns {Object}
   */
  toDTO() {
    const superDto = super.toDTO();
    delete superDto.comparison;
    return {
      ...superDto,
      data: this.data,
    };
  }
}

/**
 * @param {Object} params
 * @param {string} params.requirement_type
 * @param {Object} params.data
 * @param {string} params.comparison
 * @returns {BaseRequirement}
 */
export function buildRequirement({ requirement_type, data, comparison }) {
  const objectTypes = Object.values(TYPES.OBJECT);
  if (requirement_type === TYPES.COMPOSE) {
    return new ComposedRequirement({ data, comparison });
  } else if (objectTypes.includes(requirement_type)) {
    return new ObjectRequirement({ requirement_type, data, comparison });
  } else if (requirement_type === TYPES.SKILL_PROFILE) {
    return new SkillProfileRequirement({ data });
  } else if (requirement_type === TYPES.CAPPED_TUBES) {
    return new CappedTubesRequirement({ data });
  }
  throw new Error(`Unknown requirement_type "${requirement_type}"`);
}
