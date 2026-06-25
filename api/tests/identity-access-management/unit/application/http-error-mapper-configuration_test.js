import { authenticationDomainErrorMappingConfiguration } from '../../../../src/identity-access-management/application/http-error-mapper-configuration.js';
import {
  AuthenticationKeyExpired,
  DifferentExternalIdentifierError,
  MissingOrInvalidCredentialsError,
  MissingUserAccountError,
  PasswordResetDemandNotFoundError,
  UserCantBeCreatedError,
  UserShouldChangePasswordError,
} from '../../../../src/identity-access-management/domain/errors.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  PasswordShouldChangeError,
  UnauthorizedError,
} from '../../../../src/shared/application/errors/http-errors.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Identity Access Management | Application | HttpErrorMapperConfiguration', function () {
  context('when mapping "AuthenticationKeyExpired"', function () {
    it('returns an UnauthorizedError Http Error', function () {
      // given
      const httpErrorMapper = authenticationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === AuthenticationKeyExpired.name,
      );

      // when
      const error = httpErrorMapper.httpErrorFn(new AuthenticationKeyExpired());

      // then
      expect(error).to.be.instanceOf(UnauthorizedError);
      expect(error.code).to.equal('EXPIRED_AUTHENTICATION_KEY');
    });
  });

  context('when mapping "DifferentExternalIdentifierError"', function () {
    it('returns an ConflictError Http Error', function () {
      // given
      const httpErrorMapper = authenticationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === DifferentExternalIdentifierError.name,
      );

      // when
      const error = httpErrorMapper.httpErrorFn(new DifferentExternalIdentifierError());

      // then
      expect(error).to.be.instanceOf(ConflictError);
    });
  });

  context('when mapping "MissingOrInvalidCredentialsError"', function () {
    context('when isLoginFailureWithUsername is true', function () {
      it('returns a UnauthorizedError with isLoginFailureWithUsername set to true', function () {
        // given
        const httpErrorMapper = authenticationDomainErrorMappingConfiguration.find(
          (httpErrorMapper) => httpErrorMapper.name === MissingOrInvalidCredentialsError.name,
        );

        // when
        const error = httpErrorMapper.httpErrorFn(
          new MissingOrInvalidCredentialsError({ isLoginFailureWithUsername: true }),
        );

        // then
        expect(error).to.be.instanceOf(UnauthorizedError);
        expect(error.meta.isLoginFailureWithUsername).to.be.true;
      });
    });

    context('when isLoginFailureWithUsername is false', function () {
      it('returns a UnauthorizedError with isLoginFailureWithUsername set to false', function () {
        // given
        const httpErrorMapper = authenticationDomainErrorMappingConfiguration.find(
          (httpErrorMapper) => httpErrorMapper.name === MissingOrInvalidCredentialsError.name,
        );

        // when
        const error = httpErrorMapper.httpErrorFn(
          new MissingOrInvalidCredentialsError({ isLoginFailureWithUsername: false }),
        );

        // then
        expect(error).to.be.instanceOf(UnauthorizedError);
        expect(error.meta.isLoginFailureWithUsername).to.be.false;
      });
    });

    context('when remainingAttempts is provided', function () {
      it('returns a UnauthorizedError with remainingAttempts set', function () {
        // given
        const httpErrorMapper = authenticationDomainErrorMappingConfiguration.find(
          (httpErrorMapper) => httpErrorMapper.name === MissingOrInvalidCredentialsError.name,
        );
        const remainingAttempts = 3;

        // when
        const error = httpErrorMapper.httpErrorFn(new MissingOrInvalidCredentialsError({ remainingAttempts }));

        // then
        expect(error).to.be.instanceOf(UnauthorizedError);
        expect(error.meta.remainingAttempts).to.equal(remainingAttempts);
      });
    });
  });

  context('when mapping "MissingUserAccountError"', function () {
    it('returns an BadRequestError Http Error', function () {
      // given
      const httpErrorMapper = authenticationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === MissingUserAccountError.name,
      );

      // when
      const error = httpErrorMapper.httpErrorFn(new MissingUserAccountError());

      // then
      expect(error).to.be.instanceOf(BadRequestError);
    });
  });

  context('when mapping "PasswordResetDemandNotFoundError"', function () {
    it('returns a NotFoundError Http Error', function () {
      // given
      const httpErrorMapper = authenticationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === PasswordResetDemandNotFoundError.name,
      );
      const message = 'Test message error';

      // when
      const error = httpErrorMapper.httpErrorFn(new PasswordResetDemandNotFoundError(message));

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(message);
    });
  });

  context('when mapping "UserCantBeCreatedError"', function () {
    it('returns an UnauthorizedError Http Error', function () {
      // given
      const httpErrorMapper = authenticationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === UserCantBeCreatedError.name,
      );
      const message = 'Test message error';

      // when
      const error = httpErrorMapper.httpErrorFn(new UserCantBeCreatedError(message));

      // then
      expect(error).to.be.instanceOf(UnauthorizedError);
      expect(error.message).to.equal(message);
    });
  });

  context('when mapping "UserShouldChangePasswordError"', function () {
    it('returns an PasswordShouldChangeError Http Error', function () {
      // given
      const httpErrorMapper = authenticationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === UserShouldChangePasswordError.name,
      );
      const message = 'Test message error';
      const meta = 'Test meta';

      // when
      const error = httpErrorMapper.httpErrorFn(new UserShouldChangePasswordError(message, meta));

      // then
      expect(error).to.be.instanceOf(PasswordShouldChangeError);
      expect(error.message).to.equal(message);
      expect(error.meta).to.equal(meta);
    });
  });
});
