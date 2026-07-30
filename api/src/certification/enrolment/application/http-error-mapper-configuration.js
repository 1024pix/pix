import {
  ConflictError,
  ForbiddenError,
  PreconditionFailedError,
  UnprocessableEntityError,
} from '../../../shared/application/errors/http-errors.js';
import {
  CannotEnrollCandidateIndividuallyError,
  CannotEnrollMassImportError,
  CannotEnrollODSImportError,
  CannotEnrollScoCandidateError,
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
  {
    name: CannotEnrollCandidateIndividuallyError.name,
    httpErrorFn: (error) => new PreconditionFailedError(error.message, error.code),
  },
  {
    name: CannotEnrollMassImportError.name,
    httpErrorFn: (error) => new PreconditionFailedError(error.message, error.code),
  },
  {
    name: CannotEnrollODSImportError.name,
    httpErrorFn: (error) => new PreconditionFailedError(error.message, error.code),
  },
  {
    name: CannotEnrollScoCandidateError.name,
    httpErrorFn: (error) => new PreconditionFailedError(error.message, error.code),
  },
];
export { enrolmentDomainErrorMappingConfiguration };
