import { EntityValidationError } from '../../../../../shared/domain/errors.js';
import type {
  CriterionPropertyComparison,
  CriterionPropertyData,
  CriterionPropertyItem,
} from '../value-objects/CriterionProperty.ts';
import { CriterionProperty, CriterionPropertyError } from '../value-objects/CriterionProperty.ts';

type CriterionDataArgs = {
  data: CriterionPropertyData;
  comparison: CriterionPropertyComparison;
};

type CriterionArgs = {
  data: Record<string, CriterionDataArgs>;
};

type CriterionDataOutput = {
  data: Readonly<CriterionPropertyData>;
  comparison: CriterionPropertyComparison;
};

type CriterionCheckArgs = {
  item: CriterionPropertyItem;
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
      if (error instanceof CriterionPropertyError) {
        const details = 'details' in error ? error.details : undefined;
        throw EntityValidationError.fromJoiErrors(details, undefined, { data });
      }
      throw error;
    }
  }

  get data(): Record<string, CriterionDataOutput> {
    return this.#properties.reduce<Record<string, CriterionDataOutput>>((acc, next) => {
      acc[next.key] = {
        data: next.data,
        comparison: next.comparison,
      };
      return acc;
    }, {});
  }

  toDTO(): Record<string, CriterionDataOutput> {
    return this.data;
  }

  check({ item, comparisonFunction }: CriterionCheckArgs): boolean {
    if (comparisonFunction === 'every') {
      return this.#properties.every((property) => property.check(item));
    }
    return this.#properties.some((property) => property.check(item));
  }
}
