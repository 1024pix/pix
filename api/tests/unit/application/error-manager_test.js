const { expect, hFake, sinon } = require('../../test-helper');

const {
  AccountRecoveryDemandExpired,
  AlreadyRegisteredEmailAndUsernameError,
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
  AuthenticationKeyExpired,
  EntityValidationError,
  InvalidExternalAPIResponseError,
  MissingOrInvalidCredentialsError,
  UnexpectedUserAccountError,
  UserShouldChangePasswordError,
  MultipleOrganizationLearnersWithDifferentNationalStudentIdError,
  UserHasAlreadyLeftSCO,
  OrganizationLearnerAlreadyLinkedToInvalidUserError,
  InvalidVerificationCodeError,
  EmailModificationDemandNotFoundOrExpiredError,
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
  UncancellableOrganizationInvitationError,
  OrganizationLearnerCannotBeDissociatedError,
  UserShouldNotBeReconciledOnAnotherAccountError,
  CertificationCandidateOnFinalizedSessionError,
} = require('../../../lib/domain/errors');
const HttpErrors = require('../../../lib/application/http-errors.js');

const { handle } = require('../../../lib/application/error-manager');

describe('Unit | Application | ErrorManager', function () {
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
    it('should instantiate UnauthorizedError when MissingOrInvalidCredentialsError', async function () {
      // given
      const error = new MissingOrInvalidCredentialsError();
      sinon.stub(HttpErrors, 'UnauthorizedError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      const message = "L'adresse e-mail et/ou le mot de passe saisis sont incorrects.";
      expect(HttpErrors.UnauthorizedError).to.have.been.calledWithExactly(message);
    });

    it('should instantiate PasswordShouldChangeError when UserShouldChangePasswordError', async function () {
      // given
      const message = 'Erreur, vous devez changer votre mot de passe.';
      const error = new UserShouldChangePasswordError(message);
      sinon.stub(HttpErrors, 'PasswordShouldChangeError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.PasswordShouldChangeError).to.have.been.calledWithExactly(message);
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
  });
});
