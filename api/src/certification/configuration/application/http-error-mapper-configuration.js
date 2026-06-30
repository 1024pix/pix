import {
  BadRequestError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../../shared/application/errors/http-errors.js';
import {
  ActiveCertificationInfoNotFound,
  CertificationVersionDraftAlreadyExistError,
  InvalidScoWhitelistError,
} from '../domain/errors.js';

export const configurationDomainErrorMappingConfiguration = [
  {
    name: InvalidScoWhitelistError.name,
    httpErrorFn: (error) => new UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: CertificationVersionDraftAlreadyExistError.name,
    httpErrorFn: (error) => new BadRequestError(error.message, error.code, error.meta),
  },
  {
    name: ActiveCertificationInfoNotFound.name,
    httpErrorFn: (error) => new NotFoundError(error.message, error.code, error.meta),
  },
];
