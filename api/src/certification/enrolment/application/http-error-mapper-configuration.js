import {
  ConflictError,
  ForbiddenError,
  PreconditionFailedError,
  UnprocessableEntityError,
} from '../../../shared/application/errors/http-errors.js';
import {
  CannotEnrollCandidateIndividuallyError,
  CannotEnrollScoCandidateError,
  CertificationCandidateForbiddenDeletionError,
  InvalidCertificationCandidate,
  SessionExpiredError,
  SessionStartedDeletionError,
  UnknownCountryForStudentEnrolmentError,
  WrongDomainExtensionForPixPlusError,
} from '../domain/errors.js';

const enrolmentDomainErrorMappingConfiguration = [
  {
    name: CertificationCandidateForbiddenDeletionError.name,
    httpErrorFn: (error) => new ForbiddenError(error.message, error.code),
  },
  { name: SessionStartedDeletionError.name, httpErrorFn: (error) => new ConflictError(error.message) },
  {
    name: UnknownCountryForStudentEnrolmentError.name,
    httpErrorFn: (error) => new UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: SessionExpiredError.name,
    httpErrorFn: (error) => new ConflictError(error.message, error.code),
  },
  {
    name: InvalidCertificationCandidate.name,
    httpErrorFn: (error) => new UnprocessableEntityError(error.message),
  },
  {
    name: WrongDomainExtensionForPixPlusError.name,
    httpErrorFn: (error) => new ForbiddenError(error.message, error.code),
  },
  {
    name: CannotEnrollCandidateIndividuallyError.name,
    httpErrorFn: (error) => new PreconditionFailedError(error.message, error.code),
  },
  {
    name: CannotEnrollScoCandidateError.name,
    httpErrorFn: (error) => new PreconditionFailedError(error.message, error.code),
  },
];
export { enrolmentDomainErrorMappingConfiguration };
