import { CriterionProperty } from './CriterionProperty.js';

export class Criterion {
  #properties;

  constructor({ data }) {
    this.#properties = Object.keys(data).map((key) => {
      const property = data[key];
      return new CriterionProperty({
        key,
        data: property.data,
        comparison: property.comparison,
      });
    });
  }

  get data() {
    return this.#properties.reduce((acc, next) => {
      acc[next.key] = {
        data: next.data,
        comparison: next.comparison,
      };
      return acc;
    }, {});
  }

  toDTO() {
    return this.data;
  }

  check({ item, comparisonFunction }) {
    return this.#properties[comparisonFunction]((property) => {
      return property.check(item);
    });
  }
}
