import { expect } from '../../../../test-helper.js';
import { HttpErrors } from '../../../../../src/shared/application/http-errors.js';
import {
  SessionWithoutStartedCertificationError,
  SessionWithAbortReasonOnCompletedCertificationCourseError,
  SessionAlreadyFinalizedError,
} from '../../../../../src/certification/session/domain/errors.js';
import { sessionDomainErrorMappingConfiguration } from '../../../../../src/certification/session/application/http-error-mapper-configuration.js';
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

  context('when mapping "SessionWithAbortReasonOnCompletedCertificationCourseError"', function () {
    it('returns an UnauthorizedError Http Error', function () {
      //given
      const httpErrorMapper = sessionDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === SessionWithAbortReasonOnCompletedCertificationCourseError.name,
      );
      const message = 'Test message error';
      const code = 'SESSION_WITH_ABORT_REASON_ON_COMPLETED_CERTIFICATION_COURSE';

      //when
      const error = httpErrorMapper.httpErrorFn(
        new SessionWithAbortReasonOnCompletedCertificationCourseError(message, code),
      );

      //then
      expect(error).to.be.instanceOf(HttpErrors.ConflictError);
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
});
