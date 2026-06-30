import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../../shared/application/errors/http-errors.js';
import {
  CertificateGenerationError,
  MoreThanOneMatchingCertificationError,
  NoCertificationResultForDivision,
} from '../domain/errors.js';

const parcoursupDomainErrorMappingConfiguration = [
  {
    name: MoreThanOneMatchingCertificationError.name,
    httpErrorFn: (error) => new ConflictError(error.message),
  },
];

const resultsDomainErrorMappingConfiguration = [
  {
    name: NoCertificationResultForDivision.name,
    httpErrorFn: (error) => new NotFoundError(error.message, error.code, error.meta),
  },
  {
    name: CertificateGenerationError.name,
    httpErrorFn: (error) => new UnprocessableEntityError(error.message, error.code, error.meta),
  },
];

export { parcoursupDomainErrorMappingConfiguration, resultsDomainErrorMappingConfiguration };
