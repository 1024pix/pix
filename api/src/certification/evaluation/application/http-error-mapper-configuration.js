import { ConflictError, LockedError } from '../../../shared/application/errors/http-errors.js';
import { CertificationDurationExceededError, NextChallengeAlreadyComputingError } from '../domain/errors.js';

const evaluationDomainErrorMappingConfiguration = [
  {
    name: NextChallengeAlreadyComputingError.name,
    httpErrorFn: (error) => new LockedError(error.message),
  },
  {
    name: CertificationDurationExceededError.name,
    httpErrorFn: (error) => new ConflictError(error.message, error.code, error.meta),
  },
];
export { evaluationDomainErrorMappingConfiguration };
