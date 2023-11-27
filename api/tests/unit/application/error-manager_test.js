import { expect, hFake, sinon } from '../../test-helper.js';

import {
  AccountRecoveryDemandExpired,
  AlreadyRegisteredEmailAndUsernameError,
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
  AuthenticationKeyExpired,
  DifferentExternalIdentifierError,
  InvalidExternalAPIResponseError,
  MissingUserAccountError,
  UnexpectedUserAccountError,
  MultipleOrganizationLearnersWithDifferentNationalStudentIdError,
  UserHasAlreadyLeftSCO,
  InvalidVerificationCodeError,
  InvalidSessionSupervisingLoginError,
  EmailModificationDemandNotFoundOrExpiredError,
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
  UncancellableOrganizationInvitationError,
  OidcInvokingTokenEndpointError,
  OidcMissingFieldsError,
  OidcUserInfoFormatError,
  OrganizationLearnerAlreadyLinkedToInvalidUserError,
  OrganizationLearnerCannotBeDissociatedError,
  UserShouldNotBeReconciledOnAnotherAccountError,
  CertificationCandidateOnFinalizedSessionError,
  CertificationEndedByFinalizationError,
  CampaignTypeError,
  InvalidJuryLevelError,
  UnexpectedOidcStateError,
  InvalidIdentityProviderError,
  SendingEmailToInvalidDomainError,
  SendingEmailToInvalidEmailAddressError,
  CertificationCandidateNotFoundError,
  NotEnoughDaysPassedBeforeResetCampaignParticipationError,
} from '../../../lib/domain/errors.js';

import { HttpErrors } from '../../../lib/application/http-errors.js';
import { handle } from '../../../lib/application/error-manager.js';
import { SESSION_SUPERVISING } from '../../../lib/domain/constants/session-supervising.js';

describe('Unit | Application | ErrorManager', function () {
  describe('#_mapToHttpError', function () {
    it('should instantiate ConflictError when UnexpectedUserAccountError', async function () {
      // given
      const message = undefined;
      const code = 'UNEXPECTED_USER_ACCOUNT';
      const meta = { value: 'j*****@e*****.n**' };
      const error = new UnexpectedUserAccountError({ message, code, meta });
      sinon.stub(HttpErrors, 'ConflictError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.ConflictError).to.have.been.calledWithExactly(error.message, error.code, error.meta);
    });

    it('should instantiate BadRequestError when MissingUserAccountError', async function () {
      // given
      const error = new MissingUserAccountError();
      sinon.stub(HttpErrors, 'BadRequestError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.BadRequestError).to.have.been.calledWithExactly(error.message);
    });

    it('should instantiate BadRequestError when AlreadyRegisteredEmailError', async function () {
      // given
      const error = new AlreadyRegisteredEmailError();
      sinon.stub(HttpErrors, 'BadRequestError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.BadRequestError).to.have.been.calledWithExactly(error.message, error.code);
    });

    it('should instantiate BadRequestError when AlreadyRegisteredUsernameError', async function () {
      // given
      const error = new AlreadyRegisteredUsernameError();
      sinon.stub(HttpErrors, 'BadRequestError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.BadRequestError).to.have.been.calledWithExactly(error.message);
    });

    it('should instantiate BadRequestError when AlreadyRegisteredEmailAndUsernameError', async function () {
      // given
      const error = new AlreadyRegisteredEmailAndUsernameError();
      sinon.stub(HttpErrors, 'BadRequestError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.BadRequestError).to.have.been.calledWithExactly(error.message);
    });

    it('should instantiate ServiceUnavailableError when InvalidExternalAPIResponseError', async function () {
      // given
      const error = new InvalidExternalAPIResponseError();
      sinon.stub(HttpErrors, 'ServiceUnavailableError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.ServiceUnavailableError).to.have.been.calledWithExactly(error.message);
    });

    it('should instantiate ConflictError when MultipleOrganizationLearnersWithDifferentNationalStudentIdError', async function () {
      // given
      const error = new MultipleOrganizationLearnersWithDifferentNationalStudentIdError();
      sinon.stub(HttpErrors, 'ConflictError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.ConflictError).to.have.been.calledWithExactly(error.message);
    });

    it('should instantiate UnauthorizedError when AccountRecoveryDemandExpired', async function () {
      // given
      const error = new AccountRecoveryDemandExpired();
      sinon.stub(HttpErrors, 'UnauthorizedError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.UnauthorizedError).to.have.been.calledWithExactly(error.message);
    });

    it('should instantiate UnauthorizedError when AuthenticationKeyExpired', async function () {
      // given
      const error = new AuthenticationKeyExpired();
      sinon.stub(HttpErrors, 'UnauthorizedError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.UnauthorizedError).to.have.been.calledWithExactly(error.message);
    });

    it('should instantiate UnauthorizedError when UserHasAlreadyLeftSCO', async function () {
      // given
      const error = new UserHasAlreadyLeftSCO();
      sinon.stub(HttpErrors, 'ForbiddenError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.ForbiddenError).to.have.been.calledWithExactly(error.message);
    });

    it('should instantiate ForbiddenError when InvalidVerificationCodeError', async function () {
      // given
      const error = new InvalidVerificationCodeError();
      sinon.stub(HttpErrors, 'ForbiddenError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.ForbiddenError).to.have.been.calledWithExactly(error.message, error.code);
    });

    it('should instantiate ForbiddenError when EmailModificationDemandNotFoundOrExpiredError', async function () {
      // given
      const error = new EmailModificationDemandNotFoundOrExpiredError();
      sinon.stub(HttpErrors, 'ForbiddenError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.ForbiddenError).to.have.been.calledWithExactly(error.message, error.code);
    });

    it('should instantiate ForbiddenError when InvalidSessionSupervisingLoginError', async function () {
      // given
      const error = new InvalidSessionSupervisingLoginError();
      sinon.stub(HttpErrors, 'ForbiddenError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.ForbiddenError).to.have.been.calledWithExactly(
        SESSION_SUPERVISING.INCORRECT_DATA.getMessage(),
        SESSION_SUPERVISING.INCORRECT_DATA.code,
      );
    });

    it('should instantiate PreconditionFailedError when NotEnoughDaysPassedBeforeResetCampaignParticipationError', async function () {
      // given
      const error = new NotEnoughDaysPassedBeforeResetCampaignParticipationError();
      sinon.stub(HttpErrors, 'PreconditionFailedError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.PreconditionFailedError).to.have.been.called;
    });

    it('should instantiate BadRequestError when OrganizationLearnerAlreadyLinkedToInvalidUserError', async function () {
      // given
      const error = new OrganizationLearnerAlreadyLinkedToInvalidUserError();
      sinon.stub(HttpErrors, 'BadRequestError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.BadRequestError).to.have.been.calledWithExactly(error.message);
    });

    it('should instantiate ForbiddenError when CandidateNotAuthorizedToJoinSessionError', async function () {
      // given
      const error = new CandidateNotAuthorizedToJoinSessionError();
      sinon.stub(HttpErrors, 'ForbiddenError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.ForbiddenError).to.have.been.calledWithExactly(error.message, error.code);
    });

    it('should instantiate ForbiddenError when CandidateNotAuthorizedToResumeCertificationTestError', async function () {
      // given
      const error = new CandidateNotAuthorizedToResumeCertificationTestError();
      sinon.stub(HttpErrors, 'ForbiddenError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.ForbiddenError).to.have.been.calledWithExactly(error.message, error.code);
    });

    it('should instantiate UnprocessableEntityError when UncancellableOrganizationInvitationError', async function () {
      // given
      const error = new UncancellableOrganizationInvitationError();
      sinon.stub(HttpErrors, 'UnprocessableEntityError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.UnprocessableEntityError).to.have.been.calledWithExactly(error.message);
    });

    it('should instantiate UnprocessableEntityError when UserShouldNotBeReconciledOnAnotherAccountError', async function () {
      // given
      const code = 'ACCOUNT_SEEMS_TO_BELONGS_TO_ANOTHER_USER';
      const meta = { shortCode: 'R90' };
      const error = new UserShouldNotBeReconciledOnAnotherAccountError({ code, meta });
      sinon.stub(HttpErrors, 'UnprocessableEntityError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.UnprocessableEntityError).to.have.been.calledWithExactly(error.message, error.code, error.meta);
    });

    it('should instantiate PreconditionFailedError when OrganizationLearnerCannotBeDissociatedError', async function () {
      // given
      const error = new OrganizationLearnerCannotBeDissociatedError();
      sinon.stub(HttpErrors, 'PreconditionFailedError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.PreconditionFailedError).to.have.been.calledWithExactly(error.message);
    });

    it('should instantiate PreconditionFailedError when CertificationCandidateOnFinalizedSessionError', async function () {
      // given
      const error = new CertificationCandidateOnFinalizedSessionError();
      sinon.stub(HttpErrors, 'ForbiddenError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.ForbiddenError).to.have.been.calledWithExactly(error.message);
    });

    it('should instantiate ConflictError when CertificationEndedByFinalizationError', async function () {
      // given
      const error = new CertificationEndedByFinalizationError();
      sinon.stub(HttpErrors, 'ConflictError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.ConflictError).to.have.been.calledWithExactly(error.message);
    });

    it('should instantiate PreconditionFailedError when CampaignTypeError', async function () {
      // given
      const error = new CampaignTypeError();
      sinon.stub(HttpErrors, 'PreconditionFailedError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.PreconditionFailedError).to.have.been.calledWithExactly(error.message);
    });

    it('should instantiate BadRequestError when InvalidJuryLevelError', async function () {
      // given
      const error = new InvalidJuryLevelError();
      sinon.stub(HttpErrors, 'BadRequestError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.BadRequestError).to.have.been.calledWithExactly(error.message);
    });

    it('should instantiate BadRequestError when SendingEmailToInvalidDomainError', async function () {
      // given
      const error = new SendingEmailToInvalidDomainError('Email domain was invalid.');
      sinon.stub(HttpErrors, 'BadRequestError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.BadRequestError).to.have.been.calledWithExactly(
        error.message,
        'SENDING_EMAIL_TO_INVALID_DOMAIN',
      );
    });

    it('should instantiate NotFoundError when CertificationCandidateNotFoundError', async function () {
      // given
      const error = new CertificationCandidateNotFoundError();
      sinon.stub(HttpErrors, 'NotFoundError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.NotFoundError).to.have.been.calledWithExactly(error.message, error.code);
    });

    describe('SSO specific errors', function () {
      it('should instantiate ConflictError when DifferentExternalIdentifierError', async function () {
        // given
        const error = new DifferentExternalIdentifierError();
        sinon.stub(HttpErrors, 'ConflictError');
        const params = { request: {}, h: hFake, error };

        // when
        await handle(params.request, params.h, params.error);

        // then
        expect(HttpErrors.ConflictError).to.have.been.calledWithExactly(error.message);
      });

      it('should instantiate BadRequestError when UnexpectedOidcStateError', async function () {
        // given
        const error = new UnexpectedOidcStateError();
        sinon.stub(HttpErrors, 'BadRequestError');
        const params = { request: {}, h: hFake, error };

        // when
        await handle(params.request, params.h, params.error);

        // then
        expect(HttpErrors.BadRequestError).to.have.been.calledWithExactly(error.message);
      });

      it('should instantiate BadRequestError when InvalidIdentityProviderError', async function () {
        // given
        const error = new InvalidIdentityProviderError();
        sinon.stub(HttpErrors, 'BadRequestError');
        const params = { request: {}, h: hFake, error };

        // when
        await handle(params.request, params.h, params.error);

        // then
        expect(HttpErrors.BadRequestError).to.have.been.calledWithExactly(error.message);
      });

      it('should instantiate ServiceUnavailableError when InvalidExternalAPIResponseError', async function () {
        // given
        const error = new InvalidExternalAPIResponseError();
        sinon.stub(HttpErrors, 'ServiceUnavailableError');
        const params = { request: {}, h: hFake, error };

        // when
        await handle(params.request, params.h, params.error);

        // then
        expect(HttpErrors.ServiceUnavailableError).to.have.been.calledWithExactly(error.message);
      });

      it('instantiates UnprocessableEntityError when OidcMissingFieldsError', async function () {
        // given
        const error = new OidcMissingFieldsError('Some message', 'someCode', 'someMetaData');
        sinon.stub(HttpErrors, 'UnprocessableEntityError');
        const params = { request: {}, h: hFake, error };

        // when
        await handle(params.request, params.h, params.error);

        // then
        expect(HttpErrors.UnprocessableEntityError).to.have.been.calledWithExactly(
          error.message,
          error.code,
          error.meta,
        );
      });

      it('instantiates ServiceUnavailableError when OidcUserInfoFormatError', async function () {
        // given
        const error = new OidcUserInfoFormatError('Some message', 'someCode', 'someMetaData');
        sinon.stub(HttpErrors, 'ServiceUnavailableError');
        const params = { request: {}, h: hFake, error };

        // when
        await handle(params.request, params.h, params.error);

        // then
        expect(HttpErrors.ServiceUnavailableError).to.have.been.calledWithExactly(
          error.message,
          error.code,
          error.meta,
        );
      });

      it('instantiates UnprocessableEntityError when OidcInvokingTokenEndpointError', async function () {
        // given
        const error = new OidcInvokingTokenEndpointError('Some message', 'someCode', 'someMetaData');
        sinon.stub(HttpErrors, 'UnprocessableEntityError');
        const params = { request: {}, h: hFake, error };

        // when
        await handle(params.request, params.h, params.error);

        // then
        expect(HttpErrors.UnprocessableEntityError).to.have.been.calledWithExactly(
          error.message,
          error.code,
          error.meta,
        );
      });
    });

    context('Mailing provider errors', function () {
      context('When receiving SendingEmailToInvalidEmailAddressError', function () {
        it('instantiates a BadRequest error', function () {
          // given
          const error = new SendingEmailToInvalidEmailAddressError(
            'invalid@email.net',
            'Mailing provider error message',
          );
          sinon.stub(HttpErrors, 'BadRequestError');
          const params = { request: {}, h: hFake, error };

          // when
          handle(params.request, params.h, params.error);

          // then
          expect(HttpErrors.BadRequestError).to.have.been.calledWithExactly(
            error.message,
            'SENDING_EMAIL_TO_INVALID_EMAIL_ADDRESS',
            error.meta,
          );
        });
      });
    });
  });
});
