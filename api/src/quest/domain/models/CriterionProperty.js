import { InvalidComparisonError } from '../errors.js';

export const COMPARISONS = {
  EQUAL: 'equal',
  ONE_OF: 'one-of',
  ALL: 'all',
  LIKE: 'like',
};

export class CriterionProperty {
  #key;
  #data;
  #comparison;

  constructor({ key, data, comparison }) {
    this.#key = key;
    this.#data = data;
    this.#comparison = comparison;
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
    const criterionAttr = this.#data;
    const dataAttr = item[this.#key];
    if (Array.isArray(criterionAttr)) {
      if (Array.isArray(dataAttr)) {
        if (this.#comparison === COMPARISONS.ALL) {
          return criterionAttr.every((valueToTest) => dataAttr.includes(valueToTest));
        } else if (this.#comparison === COMPARISONS.ONE_OF) {
          return criterionAttr.some((valueToTest) => dataAttr.includes(valueToTest));
        }
        throw new InvalidComparisonError({
          comparisonOperator: this.#comparison,
          typeofCriterion: 'array',
          typeofData: 'array',
        });
      } else {
        if (this.#comparison === COMPARISONS.ONE_OF) {
          return criterionAttr.some((valueToTest) => valueToTest === dataAttr);
        }
        throw new InvalidComparisonError({
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
      throw new InvalidComparisonError({
        comparisonOperator: this.#comparison,
        typeofCriterion: typeof criterionAttr,
        typeofData: typeof dataAttr,
      });
    }
  }
}
