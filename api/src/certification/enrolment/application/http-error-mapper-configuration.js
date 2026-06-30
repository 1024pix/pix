import {
  ConflictError,
  ForbiddenError,
  UnprocessableEntityError,
} from '../../../shared/application/errors/http-errors.js';
import {
  CertificationCandidateForbiddenDeletionError,
  InvalidCertificationCandidate,
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
    name: InvalidCertificationCandidate.name,
    httpErrorFn: (error) => new UnprocessableEntityError(error.message),
  },
  {
    name: WrongDomainExtensionForPixPlusError.name,
    httpErrorFn: (error) => new ForbiddenError(error.message, error.code),
  },
];
export { enrolmentDomainErrorMappingConfiguration };
