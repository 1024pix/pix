import Joi from 'joi';

import { EntityValidationError } from '../../../../../shared/domain/errors.js';
import { logger } from '../../../../../shared/infrastructure/utils/logger.js';
import { Criterion } from './Criterion.js';

export const COMPARISONS = {
  ALL: 'all',
  ONE_OF: 'one-of',
};

export const TYPES = {
  COMPOSE: 'compose',
  CAPPED_TUBES: 'cappedTubes',
  OBJECT: {
    ORGANIZATION_LEARNER: 'organizationLearner',
    ORGANIZATION: 'organization',
    CAMPAIGN_PARTICIPATIONS: 'campaignParticipations',
    PASSAGES: 'passages',
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

const composeRequirementSchema = Joi.object({
  requirement_type: TYPES.COMPOSE,
  data: Joi.array().items(Joi.object()).required(),
  comparison: Joi.string()
    .valid(...Object.values(COMPARISONS))
    .required(),
});

export class ComposedRequirement extends BaseRequirement {
  #subRequirements = null;

  constructor(args) {
    const { data, comparison } = args;
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

    this.#validate(args);
  }

  #validate(args) {
    const { error } = composeRequirementSchema.validate(args);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details, undefined, { data: this.toDTO() });
    }
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

    const isFulfilled = this.#subRequirements[comparisonFunction]((subRequirement) =>
      subRequirement.isFulfilled(dataInput),
    );

    logger.debug({
      name: this.requirement_type,
      comparisonFunction,
      isFulfilled,
    });

    return isFulfilled;
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

const objectRequirementSchema = Joi.object({
  requirement_type: Joi.string()
    .valid(...Object.values(TYPES.OBJECT))
    .required(),
  data: Joi.object().required(),
  comparison: Joi.string()
    .valid(...Object.values(COMPARISONS))
    .required(),
});

export class ObjectRequirement extends BaseRequirement {
  #criterion;

  constructor(args) {
    const { requirement_type, data, comparison } = args;

    super({ requirement_type, comparison });

    this.#criterion = data instanceof Criterion ? data : new Criterion({ data });

    this.#validate(args);
  }

  #validate(args) {
    const { error } = objectRequirementSchema.validate(args);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details, undefined, { data: this.toDTO() });
    }
  }

  get data() {
    return Object.freeze(this.#criterion).data;
  }

  /**
   * @param {Eligibility|Success} dataInput
   * @returns {Boolean}
   */
  isFulfilled(dataInput) {
    const comparisonFunction = getComparisonFunction(this.comparison);

    if (Array.isArray(dataInput[this.requirement_type])) {
      const isFulfilled = dataInput[this.requirement_type].some((item) => {
        return this.#criterion.check({ item, comparisonFunction });
      });

      logger.debug({
        name: this.requirement_type,
        dataInput: dataInput[this.requirement_type],
        comparisonFunction,
        isFulfilled,
      });

      return isFulfilled;
    }

    const isFulfilled = this.#criterion.check({ item: dataInput[this.requirement_type], comparisonFunction });

    logger.debug({
      name: this.requirement_type,
      dataInput: dataInput[this.requirement_type],
      comparisonFunction,
      isFulfilled,
    });

    return isFulfilled;
  }

  toDTO() {
    return {
      ...super.toDTO(),
      data: this.#criterion.toDTO(),
    };
  }
}

const cappedTubesRequirementSchema = Joi.object({
  requirement_type: TYPES.CAPPED_TUBES,
  data: Joi.object({
    cappedTubes: Joi.array()
      .items(Joi.object({ tubeId: Joi.string().required(), level: Joi.number().required() }))
      .required(),
    threshold: Joi.number().min(0).max(100).required(),
  }).required(),
});

export class CappedTubesRequirement extends BaseRequirement {
  #cappedTubes;
  #threshold;

  constructor(args) {
    const { data } = args;
    super({ requirement_type: TYPES.CAPPED_TUBES, comparison: null });

    this.#cappedTubes = data.cappedTubes;
    this.#threshold = data.threshold;

    this.#validate(args);
  }

  #validate(args) {
    const { error } = cappedTubesRequirementSchema.validate(args);

    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details, undefined, { data: this.toDTO() });
    }
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
    const isFulfilled = masteryPercentage >= this.#threshold;
    logger.debug({ name: CappedTubesRequirement.name, masteryPercentage, threshold: this.#threshold, isFulfilled });
    return isFulfilled;
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
  } else if (requirement_type === TYPES.CAPPED_TUBES) {
    return new CappedTubesRequirement({ data });
  }
  throw new Error(`Unknown requirement_type "${requirement_type}"`);
}
