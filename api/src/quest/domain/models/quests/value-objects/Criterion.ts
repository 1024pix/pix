import Joi from 'joi';

import { EntityValidationError } from '../../../../../shared/domain/errors.js';
import {
  type CheckableItem,
  CriterionProperty,
  type CriterionPropertyData,
  CriterionPropertyError,
  type DataValue,
} from '../value-objects/CriterionProperty.ts';

const schema = Joi.object({ data: Joi.object().pattern(Joi.string(), Joi.object()).required() });

type CriterionData = Record<string, CriterionPropertyData>;

export type CriterionArgs = {
  data: CriterionData;
};

type CriterionDTO = Record<string, { data: Readonly<DataValue>; comparison: string }>;

type CheckArgs = {
  item: CheckableItem;
  comparisonFunction: 'some' | 'every';
};

export class Criterion {
  #properties: CriterionProperty[];

  constructor(args: CriterionArgs) {
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

  #validate(args: CriterionArgs) {
    const { error } = schema.validate(args);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details, undefined, { data: this.toDTO() });
    }
  }

  get data() {
    return this.#properties.reduce((acc: CriterionDTO, next) => {
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

  check({ item, comparisonFunction }: CheckArgs) {
    return this.#properties[comparisonFunction]((property) => {
      return property.check(item);
    });
  }
}
