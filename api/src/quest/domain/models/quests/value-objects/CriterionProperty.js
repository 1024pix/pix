import Joi from 'joi';

import { logger } from '../../../../../shared/infrastructure/utils/logger.js';
import { InvalidComparisonError } from '../../../errors.js';

export const COMPARISONS = {
  EQUAL: 'equal',
  ONE_OF: 'one-of',
  ALL: 'all',
  LIKE: 'like',
};

const allowedArrayComparaison = Joi.alternatives().try(Joi.number(), Joi.string(), Joi.boolean());

const schema = Joi.object({
  key: Joi.string().required(),
  comparison: Joi.string()
    .valid(...Object.values(COMPARISONS))
    .required(),
  data: Joi.alternatives()
    .conditional('comparison', [
      {
        is: COMPARISONS.EQUAL,
        then: allowedArrayComparaison,
      },
      {
        is: COMPARISONS.ONE_OF,
        then: Joi.array().min(1).items(allowedArrayComparaison),
      },
      {
        is: COMPARISONS.LIKE,
        then: Joi.string(),
      },
      {
        is: COMPARISONS.ALL,
        then: Joi.array().min(1).items(allowedArrayComparaison),
      },
    ])
    .required(),
});

export class CriterionPropertyError extends Error {
  constructor({ message, details }) {
    super(message);
    this.details = details;
  }
}

export class CriterionProperty {
  #key;
  #data;
  #comparison;

  constructor(args) {
    const { key, data, comparison } = args;

    this.#key = key;
    this.#data = data;
    this.#comparison = comparison;

    this.#validate(args);
  }

  #validate(args) {
    const { error } = schema.validate(args);
    if (error) {
      throw new CriterionPropertyError({ message: 'arguments are invalid', details: error.details });
    }
  }

  get key() {
    return this.#key;
  }

  get data() {
    return Object.freeze(this.#data);
  }

  get comparison() {
    return this.#comparison;
  }

  check(item) {
    let error;
    const criterionAttr = this.#data;
    const dataAttr = item[this.#key];
    if (Array.isArray(criterionAttr)) {
      if (Array.isArray(dataAttr)) {
        if (this.#comparison === COMPARISONS.ALL) {
          return criterionAttr.every((valueToTest) => dataAttr.includes(valueToTest));
        } else if (this.#comparison === COMPARISONS.ONE_OF) {
          return criterionAttr.some((valueToTest) => dataAttr.includes(valueToTest));
        }

        error = new InvalidComparisonError({
          comparisonOperator: this.#comparison,
          typeofCriterion: 'array',
          typeofData: 'array',
        });
      } else {
        if (this.#comparison === COMPARISONS.ONE_OF) {
          return criterionAttr.some((valueToTest) => valueToTest === dataAttr);
        }
        error = new InvalidComparisonError({
          comparisonOperator: this.#comparison,
          typeofCriterion: 'array',
          typeofData: typeof dataAttr,
        });
      }
    } else {
      if (this.#comparison === COMPARISONS.EQUAL) {
        return dataAttr === criterionAttr;
      }
      if (this.#comparison === COMPARISONS.LIKE) {
        const coercedDataAttr = dataAttr ?? (typeof dataAttr === 'boolean' ? dataAttr : '');
        if (typeof criterionAttr === 'string' && typeof coercedDataAttr === 'string') {
          return coercedDataAttr.toLowerCase().includes(criterionAttr.toLowerCase());
        }
      }
      error = new InvalidComparisonError({
        comparisonOperator: this.#comparison,
        typeofCriterion: typeof criterionAttr,
        typeofData: typeof dataAttr,
      });
    }

    if (error) {
      logger.error({ event: 'quest-reward', err: error }, 'Error on quests criterion property');
    }
    return false;
  }
}
