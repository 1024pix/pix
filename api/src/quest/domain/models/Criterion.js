import Joi from 'joi';

import { EntityValidationError } from '../../../shared/domain/errors.js';
import { CriterionProperty, CriterionPropertyError } from './CriterionProperty.js';

const schema = Joi.object({ data: Joi.object().pattern(Joi.string(), Joi.object()).required() });

export class Criterion {
  #properties;

  constructor(args) {
    const { data } = args;

    try {
      this.#properties = Object.keys(data).map((key) => {
        const property = data[key];
        return new CriterionProperty({
          key,
          data: property.data,
          comparison: property.comparison,
        });
      });
    } catch (error) {
      if (error instanceof CriterionPropertyError)
        throw EntityValidationError.fromJoiErrors(error.details, undefined, { data });
      else throw error;
    }

    this.#validate(args);
  }

  #validate(args) {
    const { error } = schema.validate(args);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details, undefined, { data: this.toDTO() });
    }
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
