import { HttpErrors } from '../../../shared/application/http-errors.js';
import { DomainErrorMappingConfiguration } from '../../../shared/application/models/domain-error-mapping-configuration.js';
import {
  ChallengeToBeDeneutralizedNotFoundError,
  ChallengeToBeNeutralizedNotFoundError,
  InvalidSessionSupervisingLoginError,
  SessionAlreadyFinalizedError,
  SessionAlreadyPublishedError,
  SessionNotAccessible,
  SessionWithAbortReasonOnCompletedCertificationCourseError,
  SessionWithMissingAbortReasonError,
  SessionWithoutStartedCertificationError,
} from '../domain/errors.js';

const sessionDomainErrorMappingConfiguration = [
  {
    name: SessionWithoutStartedCertificationError.name,
    httpErrorFn: (error) => new HttpErrors.BadRequestError(error.message, error.code, error.meta),
  },
  {
    name: SessionWithAbortReasonOnCompletedCertificationCourseError.name,
    httpErrorFn: (error) => new HttpErrors.ConflictError(error.message, error.code, error.meta),
  },
  {
    name: SessionWithMissingAbortReasonError.name,
    httpErrorFn: (error) => new HttpErrors.ConflictError(error.message, error.code),
  },
  {
    name: SessionAlreadyFinalizedError.name,
    httpErrorFn: (error) => new HttpErrors.ConflictError(error.message, error.code),
  },
  {
    name: SessionAlreadyPublishedError.name,
    httpErrorFn: (error) => new HttpErrors.BadRequestError(error.message, error.code),
  },
  {
    name: ChallengeToBeDeneutralizedNotFoundError.name,
    httpErrorFn: (error) => new HttpErrors.NotFoundError(error.message, error.code),
  },
  {
    name: ChallengeToBeNeutralizedNotFoundError.name,
    httpErrorFn: (error) => new HttpErrors.NotFoundError(error.message, error.code),
  },
  {
    name: SessionNotAccessible.name,
    httpErrorFn: (error) => new HttpErrors.PreconditionFailedError(error.message, error.code),
  },
  {
    name: InvalidSessionSupervisingLoginError.name,
    httpErrorFn: (error) => new HttpErrors.ForbiddenError(error.message, error.code),
  },
].map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));

export { sessionDomainErrorMappingConfiguration };
