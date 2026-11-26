import { logger } from '../../../../../shared/infrastructure/utils/logger.js';
import { InvalidComparisonError } from '../../../errors.js';

export const COMPARISONS = {
  EQUAL: 'equal',
  ONE_OF: 'one-of',
  ALL: 'all',
  LIKE: 'like',
} as const;

type CriterionPropertyComparison = (typeof COMPARISONS)[keyof typeof COMPARISONS];

type CriterionPropertyValue = string | number | boolean;

type CriterionPropertyData = CriterionPropertyValue | CriterionPropertyValue[];

type CriterionPropertyItem = Record<string, CriterionPropertyData>;

type CriterionPropertyArgs = {
  key: string;
  data: CriterionPropertyData;
  comparison: CriterionPropertyComparison;
};

type CriterionPropertyErrorArgs = {
  message: string;
};

export class CriterionPropertyError extends Error {
  constructor({ message }: CriterionPropertyErrorArgs) {
    super(message);
  }
}

export class CriterionProperty {
  #key: string;
  #data: CriterionPropertyData;
  #comparison: CriterionPropertyComparison;

  constructor(args: CriterionPropertyArgs) {
    const { key, data, comparison } = args;

    this.#key = key;
    this.#data = data;
    this.#comparison = comparison;

    this.#validate(args);
  }

  #validate(args: CriterionPropertyArgs): void {
    if (args.comparison === COMPARISONS.ONE_OF || args.comparison === COMPARISONS.ALL) {
      if (!Array.isArray(args.data) || args.data.length === 0) {
        throw new CriterionPropertyError({ message: 'missing comparison element in data' });
      }
    }

    if (args.comparison === COMPARISONS.LIKE && typeof args.data !== 'string') {
      throw new CriterionPropertyError({ message: 'comparison element must be a string' });
    }
  }

  get key(): string {
    return this.#key;
  }

  get data(): Readonly<CriterionPropertyData> {
    return Object.freeze(this.#data);
  }

  get comparison(): CriterionPropertyComparison {
    return this.#comparison;
  }

  check(item: CriterionPropertyItem): boolean {
    let error: InvalidComparisonError | undefined;
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
