import { HttpErrors } from '../../shared/application/http-errors.js';
import { DomainErrorMappingConfiguration } from '../../shared/application/models/domain-error-mapping-configuration.js';
import {
  AuthenticationKeyExpired,
  DifferentExternalIdentifierError,
  MissingOrInvalidCredentialsError,
  MissingUserAccountError,
  PasswordNotMatching,
  UserCantBeCreatedError,
  UserShouldChangePasswordError,
} from '../domain/errors.js';

const authenticationDomainErrorMappingConfiguration = [
  {
    name: AuthenticationKeyExpired.name,
    httpErrorFn: (error) => new HttpErrors.UnauthorizedError(error.message),
  },
  {
    name: DifferentExternalIdentifierError.name,
    httpErrorFn: (error) => new HttpErrors.ConflictError(error.message),
  },
  {
    name: MissingOrInvalidCredentialsError.name,
    httpErrorFn: () =>
      new HttpErrors.UnauthorizedError("L'adresse e-mail et/ou le mot de passe saisis sont incorrects."),
  },
  {
    name: MissingUserAccountError.name,
    httpErrorFn: (error) => new HttpErrors.BadRequestError(error.message),
  },
  {
    name: PasswordNotMatching.name,
    httpErrorFn: (error) => new HttpErrors.UnauthorizedError(error.message),
  },
  {
    name: UserCantBeCreatedError.name,
    httpErrorFn: (error) => new HttpErrors.UnauthorizedError(error.message),
  },
  {
    name: UserShouldChangePasswordError.name,
    httpErrorFn: (error) => new HttpErrors.PasswordShouldChangeError(error.message, error.meta),
  },
].map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));

export { authenticationDomainErrorMappingConfiguration };
