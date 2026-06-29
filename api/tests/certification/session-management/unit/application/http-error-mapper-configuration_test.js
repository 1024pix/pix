import { sessionDomainErrorMappingConfiguration } from '../../../../../src/certification/session-management/application/http-error-mapper-configuration.js';
import { SESSION_SUPERVISING } from '../../../../../src/certification/session-management/domain/constants.js';
import {
  CertificationCenterIsArchivedError,
  InvalidSessionSupervisingLoginError,
  SendingEmailToRefererError,
  SendingEmailToResultRecipientError,
  SessionAlreadyFinalizedError,
  SessionAlreadyPublishedError,
  SessionWithoutStartedCertificationError,
} from '../../../../../src/certification/session-management/domain/errors.js';
import {
  BadRequestError,
  ConflictError,
  ServiceUnavailableError,
  UnauthorizedError,
} from '../../../../../src/shared/application/errors/http-errors.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Certification | Session | Application | HttpErrorMapperConfiguration', function () {
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
      expect(error).to.be.instanceOf(BadRequestError);
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
      expect(error).to.be.instanceOf(ConflictError);
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
      expect(error).to.be.instanceOf(BadRequestError);
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
      expect(error).to.be.instanceOf(UnauthorizedError);
      expect(error.message).to.equal(message);
      expect(error.code).to.equal(code);
    });
  });

  context('when mapping "InvalidSessionSupervisingLoginError"', function () {
    it('returns an UnauthorizedError Http Error', async function () {
      // given
      const httpErrorMapper = sessionDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === InvalidSessionSupervisingLoginError.name,
      );

      // when
      const error = httpErrorMapper.httpErrorFn(new InvalidSessionSupervisingLoginError());

      // then
      expect(error).to.be.instanceOf(UnauthorizedError);
      expect(error.message).to.equal(SESSION_SUPERVISING.INCORRECT_DATA.getMessage());
      expect(error.code).to.equal(SESSION_SUPERVISING.INCORRECT_DATA.code);
    });
  });

  context('when mapping "SendingEmailToRefererError"', function () {
    it('returns an ServiceUnavailableError Http Error', async function () {
      // given
      const httpErrorMapper = sessionDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === SendingEmailToRefererError.name,
      );

      // when
      const error = httpErrorMapper.httpErrorFn(new SendingEmailToRefererError(['test1@email.com', 'test2@email.com']));

      // then
      expect(error).to.be.instanceOf(ServiceUnavailableError);
      expect(error.message).to.equal(
        "Échec lors de l'envoi du mail au(x) référent(s) du centre de certification : test1@email.com, test2@email.com",
      );
    });
  });

  context('when mapping "SendingEmailToResultRecipientError"', function () {
    it('returns an ServiceUnavailableError Http Error', async function () {
      // given
      const httpErrorMapper = sessionDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === SendingEmailToResultRecipientError.name,
      );

      // when
      const error = httpErrorMapper.httpErrorFn(
        new SendingEmailToResultRecipientError(['test1@email.com', 'test2@email.com']),
      );

      // then
      expect(error).to.be.instanceOf(ServiceUnavailableError);
      expect(error.message).to.equal(
        "Échec lors de l'envoi des résultats au(x) destinataire(s) : test1@email.com, test2@email.com",
      );
    });
  });
});
