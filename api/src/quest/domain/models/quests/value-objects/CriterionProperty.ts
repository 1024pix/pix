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

type CriterionPropertyErrorArgs = {
  message: string;
  details: Joi.ValidationErrorItem[];
};

export class CriterionPropertyError extends Error {
  details: Joi.ValidationErrorItem[];

  constructor({ message, details }: CriterionPropertyErrorArgs) {
    super(message);
    this.details = details;
  }
}

type ComparisonValue = (typeof COMPARISONS)[keyof typeof COMPARISONS];

type OneOfComparisonDataValue = readonly (string | number | boolean)[];

type AllComparisonDataValue = readonly (string | number | boolean)[];

type EqualComparisonDataValue = string | number | boolean;

type LikeComparisonDataValue = string;

type DataValue = OneOfComparisonDataValue | AllComparisonDataValue | LikeComparisonDataValue | EqualComparisonDataValue;

type CriterionPropertyArgs = {
  key: string;
  data: DataValue;
  comparison: ComparisonValue;
};

export class CriterionProperty {
  #key: string;
  #data: DataValue;
  #comparison: string;

  constructor(args: CriterionPropertyArgs) {
    const { key, data, comparison } = args;

    this.#key = key;
    this.#data = data;
    this.#comparison = comparison;

    this.#validate(args);
  }

  #validate(args: CriterionPropertyArgs) {
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

  check(item: Record<string, DataValue | null | undefined>) {
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

    if (error && 'error' in logger && typeof logger.error === 'function') {
      Reflect.apply(logger.error, logger, [
        { event: 'quest-reward', err: error },
        'Error on quests criterion property',
      ]);
    }
    return false;
  }
}
