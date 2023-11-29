import { HttpErrors } from '../../../shared/application/http-errors.js';
import {
  SessionWithoutStartedCertificationError,
  SessionWithAbortReasonOnCompletedCertificationCourseError,
  SessionAlreadyFinalizedError,
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
].map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));

export { sessionDomainErrorMappingConfiguration };
