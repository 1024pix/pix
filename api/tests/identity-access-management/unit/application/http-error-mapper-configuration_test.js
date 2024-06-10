import { authenticationDomainErrorMappingConfiguration } from '../../../../src/identity-access-management/application/http-error-mapper-configuration.js';
import {
  AuthenticationKeyExpired,
  DifferentExternalIdentifierError,
  MissingOrInvalidCredentialsError,
  MissingUserAccountError,
  PasswordNotMatching,
  UserCantBeCreatedError,
  UserShouldChangePasswordError,
} from '../../../../src/identity-access-management/domain/errors.js';
import { HttpErrors } from '../../../../src/shared/application/http-errors.js';
import { DomainErrorMappingConfiguration } from '../../../../src/shared/application/models/domain-error-mapping-configuration.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Identity Access Management | Application | HttpErrorMapperConfiguration', function () {
  it('contains a list of HttpErrorMapper instances', function () {
    // given
    // when
    // then
    authenticationDomainErrorMappingConfiguration.forEach((domainErrorMappingConfiguration) =>
      expect(domainErrorMappingConfiguration).to.be.instanceOf(DomainErrorMappingConfiguration),
    );
  });

  context('when mapping "AuthenticationKeyExpired"', function () {
    it('returns an UnauthorizedError Http Error', function () {
      //given
      const httpErrorMapper = authenticationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === AuthenticationKeyExpired.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new AuthenticationKeyExpired());

      //then
      expect(error).to.be.instanceOf(HttpErrors.UnauthorizedError);
    });
  });

  context('when mapping "DifferentExternalIdentifierError"', function () {
    it('returns an ConflictError Http Error', function () {
      //given
      const httpErrorMapper = authenticationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === DifferentExternalIdentifierError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new DifferentExternalIdentifierError());

      //then
      expect(error).to.be.instanceOf(HttpErrors.ConflictError);
    });
  });

  context('when mapping "MissingOrInvalidCredentialsError"', function () {
    it('returns an UnauthorizedError Http Error', function () {
      //given
      const httpErrorMapper = authenticationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === MissingOrInvalidCredentialsError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn();

      //then
      expect(error).to.be.instanceOf(HttpErrors.UnauthorizedError);
    });
  });

  context('when mapping "MissingUserAccountError"', function () {
    it('returns an BadRequestError Http Error', function () {
      //given
      const httpErrorMapper = authenticationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === MissingUserAccountError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new MissingUserAccountError());

      //then
      expect(error).to.be.instanceOf(HttpErrors.BadRequestError);
    });
  });

  context('when mapping "PasswordNotMatching"', function () {
    it('returns an UnauthorizedError Http Error', function () {
      //given
      const httpErrorMapper = authenticationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === PasswordNotMatching.name,
      );
      const message = 'Test message error';

      //when
      const error = httpErrorMapper.httpErrorFn(new PasswordNotMatching(message));

      //then
      expect(error).to.be.instanceOf(HttpErrors.UnauthorizedError);
      expect(error.message).to.equal(message);
    });
  });

  context('when mapping "UserCantBeCreatedError"', function () {
    it('returns an UnauthorizedError Http Error', function () {
      //given
      const httpErrorMapper = authenticationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === UserCantBeCreatedError.name,
      );
      const message = 'Test message error';

      //when
      const error = httpErrorMapper.httpErrorFn(new UserCantBeCreatedError(message));

      //then
      expect(error).to.be.instanceOf(HttpErrors.UnauthorizedError);
      expect(error.message).to.equal(message);
    });
  });

  context('when mapping "UserShouldChangePasswordError"', function () {
    it('returns an PasswordShouldChangeError Http Error', function () {
      //given
      const httpErrorMapper = authenticationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === UserShouldChangePasswordError.name,
      );
      const message = 'Test message error';
      const meta = 'Test meta';

      //when
      const error = httpErrorMapper.httpErrorFn(new UserShouldChangePasswordError(message, meta));

      //then
      expect(error).to.be.instanceOf(HttpErrors.PasswordShouldChangeError);
      expect(error.message).to.equal(message);
      expect(error.meta).to.equal(meta);
    });
  });
});
