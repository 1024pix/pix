import { HttpErrors } from '../../shared/application/http-errors.js';
import {
  MissingOrInvalidCredentialsError,
  PasswordNotMatching,
  UserShouldChangePasswordError,
} from '../domain/errors.js';
import { DomainErrorMappingConfiguration } from '../../shared/application/models/domain-error-mapping-configuration.js';

const authenticationDomainErrorMappingConfiguration = [
  {
    name: MissingOrInvalidCredentialsError.name,
    httpErrorFn: () => {
      return new HttpErrors.UnauthorizedError("L'adresse e-mail et/ou le mot de passe saisis sont incorrects.");
    },
  },
  {
    name: PasswordNotMatching.name,
    httpErrorFn: (error) => new HttpErrors.UnauthorizedError(error.message),
  },
  {
    name: UserShouldChangePasswordError.name,
    httpErrorFn: (error) => new HttpErrors.PasswordShouldChangeError(error.message, error.meta),
  },
].map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));

export { authenticationDomainErrorMappingConfiguration };
