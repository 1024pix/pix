import { DomainError, FeatureDisabledError } from '../../shared/domain/errors.js';

export class InvalidComparisonError extends DomainError {
  constructor({ comparisonOperator, typeofCriterion, typeofData }) {
    super(
      `Comparison "${comparisonOperator}" invalid when comparing a criterion of type "${typeofCriterion}" and a data of type "${typeofData}".`,
      'INVALID_COMPARISON',
    );
  }
}

export class CombinedCoursesDisabledError extends FeatureDisabledError {
  constructor() {
    super('Combined courses are temporarily disabled.');
  }
}

export class FrameworkNotFoundError extends DomainError {
  constructor() {
    super('Framework not found for specified capped tubes.');
  }
}

export class MultipleFrameworksError extends DomainError {
  constructor() {
    super('Multiple frameworks found for specified capped tubes.');
  }
}
