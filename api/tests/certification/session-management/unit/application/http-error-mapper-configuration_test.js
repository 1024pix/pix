import { sessionDomainErrorMappingConfiguration } from '../../../../../src/certification/session-management/application/http-error-mapper-configuration.js';
import { SESSION_SUPERVISING } from '../../../../../src/certification/session-management/domain/constants.js';
import {
  CertificationCenterIsArchivedError,
  InvalidSessionSupervisingLoginError,
  SessionAlreadyFinalizedError,
  SessionAlreadyPublishedError,
  SessionWithoutStartedCertificationError,
} from '../../../../../src/certification/session-management/domain/errors.js';
import { HttpErrors } from '../../../../../src/shared/application/http-errors.js';
import { DomainErrorMappingConfiguration } from '../../../../../src/shared/application/models/domain-error-mapping-configuration.js';

describe('Unit | Certification | Session | Application | HttpErrorMapperConfiguration', function () {
  it('contains a list of HttpErrorMapper instances', function () {
    // given
    // when
    // then
    sessionDomainErrorMappingConfiguration.forEach((domainErrorMappingConfiguration) =>
      expect(domainErrorMappingConfiguration).to.be.instanceOf(DomainErrorMappingConfiguration),
    );
  });

  context('when mapping "SessionWithoutStartedCertificationError"', function () {
    it('returns an UnauthorizedError Http Error', function () {
      //given
      const httpErrorMapper = sessionDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === SessionWithoutStartedCertificationError.name,
      );
      const message = 'Test message error';
      const code = 'SESSION_WITHOUT_STARTED_CERTIFICATION';

      //when
      const error = httpErrorMapper.httpErrorFn(new SessionWithoutStartedCertificationError(message, code));

      //then
      expect(error).to.be.instanceOf(HttpErrors.BadRequestError);
      expect(error.message).to.equal(message);
      expect(error.code).to.equal(code);
    });
  });

  context('when mapping "SessionAlreadyFinalizedError"', function () {
    it('returns an PasswordShouldChangeError Http Error', function () {
      //given
      const httpErrorMapper = sessionDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === SessionAlreadyFinalizedError.name,
      );
      const message = 'Test message error';
      const code = 'SESSION_ALREADY_FINALIZED';

      //when
      const error = httpErrorMapper.httpErrorFn(new SessionAlreadyFinalizedError(message, code));

      //then
      expect(error).to.be.instanceOf(HttpErrors.ConflictError);
      expect(error.message).to.equal(message);
      expect(error.code).to.equal(code);
    });
  });

  context('when mapping "SessionAlreadyPublishedError"', function () {
    it('returns an BadRequest Http Error', function () {
      //given
      const httpErrorMapper = sessionDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === SessionAlreadyPublishedError.name,
      );
      const message = 'Test message error';

      //when
      const error = httpErrorMapper.httpErrorFn(new SessionAlreadyPublishedError(message));

      //then
      expect(error).to.be.instanceOf(HttpErrors.BadRequestError);
      expect(error.message).to.equal(message);
    });
  });

  context('when mapping "CertificationCenterIsArchivedError"', function () {
    it('returns an UnauthorizedError Http Error', function () {
      // given
      const httpErrorMapper = sessionDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === CertificationCenterIsArchivedError.name,
      );
      const message = 'Test message error';
      const code = 'CERTIFICATION_CENTER_IS_ARCHIVED';

      // when
      const error = httpErrorMapper.httpErrorFn(new CertificationCenterIsArchivedError(message, code));

      // then
      expect(error).to.be.instanceOf(HttpErrors.UnauthorizedError);
      expect(error.message).to.equal(message);
      expect(error.code).to.equal(code);
    });
  });

  it('should instantiate ForbiddenError when InvalidSessionSupervisingLoginError', async function () {
    // given
    const httpErrorMapper = sessionDomainErrorMappingConfiguration.find(
      (httpErrorMapper) => httpErrorMapper.name === InvalidSessionSupervisingLoginError.name,
    );

    // when
    const error = httpErrorMapper.httpErrorFn(new InvalidSessionSupervisingLoginError());

    // then
    expect(error).to.be.instanceOf(HttpErrors.UnauthorizedError);
    expect(error.message).to.equal(SESSION_SUPERVISING.INCORRECT_DATA.getMessage());
    expect(error.code).to.equal(SESSION_SUPERVISING.INCORRECT_DATA.code);
  });
});
