import { expect } from '../../../test-helper.js';
import { HttpErrors } from '../../../../src/shared/application/http-errors.js';
import {
  MissingOrInvalidCredentialsError,
  PasswordNotMatching,
  UserShouldChangePasswordError,
} from '../../../../src/authentication/domain/errors.js';
import { authenticationDomainErrorMappingConfiguration } from '../../../../src/authentication/application/http-error-mapper-configuration.js';
import { HttpErrorMapper } from '../../../../src/shared/application/models/http-error-mapper.js';

describe('Unit | Authentication | Application | HttpErrorMapperConfiguration', function () {
  it('contains a list of HttpErrorMapper instances', function () {
    // given
    // when
    // then
    authenticationDomainErrorMappingConfiguration.forEach((domainErrorMappingConfiguration) =>
      expect(domainErrorMappingConfiguration).to.be.instanceOf(HttpErrorMapper),
    );
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
