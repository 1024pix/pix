import { ComparisonNotImplementedError } from '../errors.js';

export const COMPARISON = {
  EQUAL: 'equal',
  ONE_OF: 'some',
  ALL: 'every',
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
        if (this.#comparison === COMPARISON.ALL) {
          return criterionAttr.every((valueToTest) => dataAttr.includes(valueToTest));
        } else if (this.#comparison === COMPARISON.ONE_OF) {
          return criterionAttr.some((valueToTest) => dataAttr.includes(valueToTest));
        }
        throw new ComparisonNotImplementedError(this.#comparison);
      } else {
        if (this.#comparison === COMPARISON.ONE_OF) {
          return criterionAttr.some((valueToTest) => valueToTest === dataAttr);
        }
        throw new ComparisonNotImplementedError(this.#comparison);
      }
    } else {
      if (this.#comparison === COMPARISON.EQUAL) {
        return dataAttr === criterionAttr;
      }
      throw new ComparisonNotImplementedError(this.#comparison);
    }
  }
}
