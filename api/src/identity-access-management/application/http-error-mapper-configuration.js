import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  PasswordShouldChangeError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '../../shared/application/errors/http-errors.js';
import {
  AuthenticationKeyExpired,
  DifferentExternalIdentifierError,
  InvalidOrAlreadyUsedEmailError,
  MissingOrInvalidCredentialsError,
  MissingUserAccountError,
  PasswordResetDemandNotFoundError,
  PasswordResetTokenInvalidOrExpired,
  PixAdminLoginFromPasswordDisabledError,
  UserCantBeCreatedError,
  UserShouldChangePasswordError,
} from '../domain/errors.js';

const authenticationDomainErrorMappingConfiguration = [
  {
    name: AuthenticationKeyExpired.name,
    httpErrorFn: (error) => new UnauthorizedError(error.message, error.code),
  },
  {
    name: PasswordResetTokenInvalidOrExpired.name,
    httpErrorFn: (error) => new UnauthorizedError(error.message, error.code),
  },
  {
    name: DifferentExternalIdentifierError.name,
    httpErrorFn: (error) => new ConflictError(error.message),
  },
  {
    name: InvalidOrAlreadyUsedEmailError.name,
    httpErrorFn: (error) => new UnprocessableEntityError(error.message, error.code),
  },
  {
    name: MissingOrInvalidCredentialsError.name,
    httpErrorFn: (error) => new UnauthorizedError(error.message, error.code, error.meta),
  },
  {
    name: MissingUserAccountError.name,
    httpErrorFn: (error) => new BadRequestError(error.message),
  },
  {
    name: PasswordResetDemandNotFoundError.name,
    httpErrorFn: (error) => new NotFoundError(error.message),
  },
  {
    name: PixAdminLoginFromPasswordDisabledError.name,
    httpErrorFn: (error) => new UnauthorizedError(error.message, error.code),
  },
  {
    name: UserCantBeCreatedError.name,
    httpErrorFn: (error) => new UnauthorizedError(error.message),
  },
  {
    name: UserShouldChangePasswordError.name,
    httpErrorFn: (error) => new PasswordShouldChangeError(error.message, error.meta),
  },
];

export { authenticationDomainErrorMappingConfiguration };
