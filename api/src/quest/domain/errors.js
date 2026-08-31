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

export class CappedTubeRequirementWithoutTargetProfilesError extends DomainError {
  constructor() {
    super(
      'Capped tube requirements cannot be defined without target profiles.',
      'CAPPED_TUBE_REQUIREMENTS_WITHOUT_TARGET_PROFILE',
    );
  }
}

export class CappedTubeRequirementsMissingError extends DomainError {
  constructor() {
    super(
      'Capped tube requirements are missing while a schema threshold is defined.',
      'CAPPED_TUBE_REQUIREMENTS_MISSING',
    );
  }
}

export class CappedTubeNotProvidedError extends DomainError {
  constructor() {
    super('Provided cappedTubes are empty', 'CAPPED_TUBES_NOT_PROVIDED');
  }
}
