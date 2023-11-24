import { HttpErrors } from '../../shared/application/http-errors.js';
import {
  MissingOrInvalidCredentialsError,
  PasswordNotMatching,
  UserShouldChangePasswordError,
} from '../domain/errors.js';
import { HttpErrorMapper } from '../../shared/application/models/http-error-mapper.js';

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
].map((domainErrorMapping) => new HttpErrorMapper(domainErrorMapping));

export { authenticationDomainErrorMappingConfiguration };
