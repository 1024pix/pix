import { HttpErrors } from '../../../shared/application/http-errors.js';
import { DomainErrorMappingConfiguration } from '../../../shared/application/models/domain-error-mapping-configuration.js';
import {
  CertificationCandidateEligibilityError,
  CertificationCandidateForbiddenDeletionError,
  CertificationCandidateNotFoundError,
  InvalidCertificationCandidate,
  SessionStartedDeletionError,
  UnknownCountryForStudentEnrolmentError,
} from '../domain/errors.js';

const enrolmentDomainErrorMappingConfiguration = [
  {
    name: CertificationCandidateForbiddenDeletionError.name,
    httpErrorFn: (error) => new HttpErrors.ForbiddenError(error.message, error.code),
  },
  {
    name: CertificationCandidateNotFoundError.name,
    httpErrorFn: (error) => new HttpErrors.NotFoundError(error.message, error.code),
  },
  { name: SessionStartedDeletionError.name, httpErrorFn: (error) => new HttpErrors.ConflictError(error.message) },
  {
    name: UnknownCountryForStudentEnrolmentError.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: InvalidCertificationCandidate.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message),
  },
  {
    name: CertificationCandidateEligibilityError.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code),
  },
].map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));

export { enrolmentDomainErrorMappingConfiguration };
