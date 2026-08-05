import {
  ConflictError,
  ForbiddenError,
  LockedError,
  PreconditionFailedError,
} from '../../../shared/application/errors/http-errors.js';
import {
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
  CenterNotHabilitatedError,
  CertificationDurationExceededError,
  NextChallengeAlreadyComputingError,
  SessionNotJoinableError,
} from '../domain/errors.js';

const evaluationDomainErrorMappingConfiguration = [
  {
    name: NextChallengeAlreadyComputingError.name,
    httpErrorFn: (error) => new LockedError(error.message),
  },
  {
    name: CertificationDurationExceededError.name,
    httpErrorFn: (error) => new ConflictError(error.message, error.code, error.meta),
  },
  {
    name: CandidateNotAuthorizedToJoinSessionError.name,
    httpErrorFn: (error) => new ForbiddenError(error.message, error.code, error.meta),
  },
  {
    name: CandidateNotAuthorizedToResumeCertificationTestError.name,
    httpErrorFn: (error) => new ForbiddenError(error.message, error.code, error.meta),
  },
  {
    name: SessionNotJoinableError.name,
    httpErrorFn: (error) => new PreconditionFailedError(error.message, error.code, error.meta),
  },
  {
    name: CenterNotHabilitatedError.name,
    httpErrorFn: (error) => new ForbiddenError(error.message, error.code, error.meta),
  },
];
export { evaluationDomainErrorMappingConfiguration };
