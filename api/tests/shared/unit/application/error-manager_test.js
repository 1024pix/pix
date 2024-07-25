import { AdminMemberError } from '../../../../src/authorization/domain/errors.js';
import { CsvWithNoSessionDataError } from '../../../../src/certification/session-management/domain/errors.js';
import { authenticationDomainErrorMappingConfiguration } from '../../../../src/identity-access-management/application/http-error-mapper-configuration.js';
import { UnableToAttachChildOrganizationToParentOrganizationError } from '../../../../src/organizational-entities/domain/errors.js';
import { domainErrorMapper } from '../../../../src/shared/application/domain-error-mapper.js';
import { handle } from '../../../../src/shared/application/error-manager.js';
import { HttpErrors, UnauthorizedError } from '../../../../src/shared/application/http-errors.js';
import {
  AccountRecoveryDemandExpired,
  AlreadyRegisteredEmailAndUsernameError,
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
  CampaignTypeError,
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
  CertificationAttestationGenerationError,
  CertificationCandidateNotFoundError,
  CertificationCandidateOnFinalizedSessionError,
  CertificationCenterPilotFeaturesConflictError,
  CertificationEndedByFinalizationError,
  EmailModificationDemandNotFoundOrExpiredError,
  EntityValidationError,
  InvalidExternalAPIResponseError,
  InvalidIdentityProviderError,
  InvalidInputDataError,
  InvalidJuryLevelError,
  InvalidVerificationCodeError,
  LocaleFormatError,
  LocaleNotSupportedError,
  MultipleOrganizationLearnersWithDifferentNationalStudentIdError,
  NoCertificationAttestationForDivisionError,
  NotEnoughDaysPassedBeforeResetCampaignParticipationError,
  NotFoundError,
  OidcError,
  OidcMissingFieldsError,
  OrganizationLearnerAlreadyLinkedToInvalidUserError,
  OrganizationLearnerCannotBeDissociatedError,
  SendingEmailToInvalidDomainError,
  SendingEmailToInvalidEmailAddressError,
  UnexpectedUserAccountError,
  UserHasAlreadyLeftSCO,
  UserNotAuthorizedToAccessEntityError,
  UserShouldNotBeReconciledOnAnotherAccountError,
} from '../../../../src/shared/domain/errors.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Shared | Unit | Application | ErrorManager', function () {
  describe('#handle', function () {
    it('should translate EntityValidationError', async function () {
      // given
      const request = {
        headers: {
          'accept-language': 'en',
        },
      };
      const error = new EntityValidationError({
        invalidAttributes: [{ attribute: 'name', message: 'STAGE_TITLE_IS_REQUIRED' }],
      });

      // when
      const response = await handle(request, hFake, error);

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.source).to.deep.equal({
        errors: [
          {
            detail: 'The title is required',
            source: {
              pointer: '/data/attributes/name',
            },
            status: '422',
            title: 'Invalid data attribute "name"',
          },
        ],
      });
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

    it('should translate EntityValidationError to french', async function () {
      // given
      const request = {
        headers: {
          'accept-language': 'fr-fr',
        },
      };
      const error = new EntityValidationError({
        invalidAttributes: [{ attribute: 'name', message: 'STAGE_TITLE_IS_REQUIRED' }],
      });

      // when
      const response = await handle(request, hFake, error);

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.source).to.deep.equal({
        errors: [
          {
            detail: 'Le titre du palier est obligatoire',
            source: {
              pointer: '/data/attributes/name',
            },
            status: '422',
            title: 'Invalid data attribute "name"',
          },
        ],
      });
    });

    it('should fallback to the message if the translation is not found', async function () {
      // given
      const request = {
        headers: {
          'accept-language': 'en',
        },
      };
      const error = new EntityValidationError({
        invalidAttributes: [{ attribute: 'name', message: 'message' }],
      });

      // when
      const response = await handle(request, hFake, error);

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.source).to.deep.equal({
        errors: [
          {
            detail: 'message',
            source: {
              pointer: '/data/attributes/name',
            },
            status: '422',
            title: 'Invalid data attribute "name"',
          },
        ],
      });
    });

    it('should translate EntityValidationError even if invalidAttributes is undefined', async function () {
      // given
      const request = {
        headers: {
          'accept-language': 'en',
        },
      };
      const error = new EntityValidationError({
        invalidAttributes: undefined,
      });

      // when
      const response = await handle(request, hFake, error);

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.source).to.deep.equal({
        errors: [],
      });
    });
  });

  describe('#_mapToHttpError', function () {
    before(function () {
      domainErrorMapper.configure(authenticationDomainErrorMappingConfiguration);
    });

    it('should instantiate NotFoundError when NotFoundError', async function () {
      // given
      const error = new NotFoundError();
      sinon.stub(HttpErrors, 'NotFoundError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.NotFoundError).to.have.been.calledWithExactly(error.message);
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

    it('should instantiate ForbiddenError when UserNotAuthorizedToAccessEntityError', async function () {
      // given
      const error = new UserNotAuthorizedToAccessEntityError();
      sinon.stub(HttpErrors, 'ForbiddenError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.ForbiddenError).to.have.been.calledWithExactly(
        'Utilisateur non autorisé à accéder à la ressource',
      );
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

    it('should instantiate UnprocessableEntityError when AdminMemberError', async function () {
      // given
      const error = new AdminMemberError('fake message', 'FAKE_ERROR_CODE');
      sinon.stub(HttpErrors, 'UnprocessableEntityError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.UnprocessableEntityError).to.have.been.calledWithExactly(error.message, error.code);
    });

    context('Locale errors', function () {
      context('When receiving LocaleFormatError', function () {
        it('instantiates a BadRequest error', function () {
          // given
          const error = new LocaleFormatError('zzzz');
          sinon.stub(HttpErrors, 'BadRequestError');
          const params = { request: {}, h: hFake, error };

          // when
          handle(params.request, params.h, params.error);

          // then
          expect(HttpErrors.BadRequestError).to.have.been.calledWithExactly(
            'Given locale is in invalid format: "zzzz"',
            'INVALID_LOCALE_FORMAT',
            { locale: 'zzzz' },
          );
        });
      });

      context('When receiving LocaleNotSupportedError', function () {
        it('instantiates a BadRequest error', function () {
          // given
          const error = new LocaleNotSupportedError('nl-BE');
          sinon.stub(HttpErrors, 'BadRequestError');
          const params = { request: {}, h: hFake, error };

          // when
          handle(params.request, params.h, params.error);

          // then
          expect(HttpErrors.BadRequestError).to.have.been.calledWithExactly(
            'Given locale is not supported : "nl-BE"',
            'LOCALE_NOT_SUPPORTED',
            { locale: 'nl-BE' },
          );
        });
      });
    });

    context('when handling an OidcError', function () {
      it('maps to UnprocessableEntityError', async function () {
        // given
        const error = new OidcError({ code: 'OIDC_ERROR_CODE', message: 'an oidc error occurred' });
        sinon.stub(HttpErrors, 'UnprocessableEntityError');
        const params = { request: {}, h: hFake, error };

        // when
        await handle(params.request, params.h, params.error);

        // then
        expect(HttpErrors.UnprocessableEntityError).to.have.been.calledWithExactly(
          'an oidc error occurred',
          'OIDC_ERROR_CODE',
          undefined,
        );
      });
    });

    it('should instantiate UnprocessableEntityError when CertificationAttestationGenerationError', async function () {
      // given
      const error = new CertificationAttestationGenerationError();
      sinon.stub(HttpErrors, 'UnprocessableEntityError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.UnprocessableEntityError).to.have.been.calledWithExactly(error.message);
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

    it('should instantiate BadRequestError when NoCertificationAttestationForDivisionError', async function () {
      // given
      const error = new NoCertificationAttestationForDivisionError(1);
      sinon.stub(HttpErrors, 'BadRequestError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.BadRequestError).to.have.been.calledWithExactly(
        'Aucune attestation de certification pour la classe 1.',
      );
    });

    it('should instantiate BaseHttpError when UnauthorizedError', async function () {
      // given
      const error = new UnauthorizedError();
      sinon.stub(HttpErrors, 'BaseHttpError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.BaseHttpError).to.have.been.calledOnce;
    });

    it('should instantiate UnprocessableEntityError when CsvWithNoSessionDataError', async function () {
      // given
      const error = new CsvWithNoSessionDataError();
      sinon.stub(HttpErrors, 'UnprocessableEntityError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.UnprocessableEntityError).to.have.been.calledWithExactly(error.message, error.code);
    });

    context('when handling InvalidInputDataError', function () {
      it('maps to PreconditionFailedError', async function () {
        // given
        const error = new InvalidInputDataError();
        sinon.stub(HttpErrors, 'PreconditionFailedError');
        const params = { request: {}, h: hFake, error };

        // when
        await handle(params.request, params.h, params.error);

        // then
        expect(HttpErrors.PreconditionFailedError).to.have.been.calledWithExactly(
          error.message,
          error.code,
          error.meta,
        );
      });
    });

    context('when handling an CertificationCenterPilotFeaturesConflictError', function () {
      it('maps to ForbiddenError', async function () {
        // given
        const error = new CertificationCenterPilotFeaturesConflictError();
        sinon.stub(HttpErrors, 'ForbiddenError');
        const params = { request: {}, h: hFake, error };

        // when
        await handle(params.request, params.h, params.error);

        // then
        expect(HttpErrors.ForbiddenError).to.have.been.calledWithExactly(
          'Certification center pilot features incompatibility',
          'PILOT_FEATURES_CONFLICT',
        );
      });
    });

    context('when handling UnableToAttachChildOrganizationToParentOrganizationError', function () {
      it('maps to ConflictError', async function () {
        // given
        const error = new UnableToAttachChildOrganizationToParentOrganizationError();
        sinon.stub(HttpErrors, 'ConflictError');
        const params = { request: {}, h: hFake, error };

        // when
        await handle(params.request, params.h, params.error);

        // then
        expect(HttpErrors.ConflictError).to.have.been.calledWithExactly(error.message, error.code, error.meta);
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

    describe('SSO specific errors', function () {
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
    });

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
  });
});
