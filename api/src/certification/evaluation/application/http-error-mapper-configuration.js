import { LockedError } from '../../../shared/application/errors/http-errors.js';
import { NextChallengeAlreadyComputingError } from '../domain/errors.js';

const evaluationDomainErrorMappingConfiguration = [
  {
    name: NextChallengeAlreadyComputingError.name,
    httpErrorFn: (error) => new LockedError(error.message),
  },
];
export { evaluationDomainErrorMappingConfiguration };
