import { HttpErrors } from '../../../shared/application/http-errors.js';
import {
  CertificationCandidateForbiddenDeletionError,
  SessionAlreadyFinalizedError,
  SessionAlreadyPublishedError,
  SessionWithAbortReasonOnCompletedCertificationCourseError,
  SessionWithoutStartedCertificationError,
} from '../domain/errors.js';
import { DomainErrorMappingConfiguration } from '../../../shared/application/models/domain-error-mapping-configuration.js';

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
    name: SessionAlreadyFinalizedError.name,
    httpErrorFn: (error) => new HttpErrors.ConflictError(error.message, error.code),
  },
  {
    name: SessionAlreadyPublishedError.name,
    httpErrorFn: (error) => new HttpErrors.BadRequestError(error.message, error.code),
  },
  {
    name: CertificationCandidateForbiddenDeletionError.name,
    httpErrorFn: (error) => new HttpErrors.ForbiddenError(error.message, error.code),
  },
].map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));

export { sessionDomainErrorMappingConfiguration };
