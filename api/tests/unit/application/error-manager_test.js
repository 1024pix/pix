const {
  expect,
  hFake,
  sinon,
} = require('../../test-helper');

const {
  AlreadyRegisteredEmailAndUsernameError,
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
  EntityValidationError,
  InvalidExternalAPIResponseError,
  MissingOrInvalidCredentialsError,
  UnexpectedUserAccountError,
  UserShouldChangePasswordError,
} = require('../../../lib/domain/errors');
const HttpErrors = require('../../../lib/application/http-errors.js');

const { handle } = require('../../../lib/application/error-manager');

describe('Unit | Application | ErrorManager', () => {

  describe('#handle', () => {
    it('should translate EntityValidationError', async () => {
      // given
      const request = {
        headers: {
          'accept-language': 'en',
        },
      };
      const error = new EntityValidationError({
        invalidAttributes: [
          { attribute: 'name', message: 'STAGE_TITLE_IS_REQUIRED' },
        ],
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

    it('should translate EntityValidationError to french', async () => {
      // given
      const request = {
        headers: {
          'accept-language': 'fr-fr',
        },
      };
      const error = new EntityValidationError({
        invalidAttributes: [
          { attribute: 'name', message: 'STAGE_TITLE_IS_REQUIRED' },
        ],
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

    it('should fallback to the message if the translation is not found', async () => {
      // given
      const request = {
        headers: {
          'accept-language': 'en',
        },
      };
      const error = new EntityValidationError({
        invalidAttributes: [
          { attribute: 'name', message: 'message' },
        ],
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
  });

  describe('#_mapToHttpError', () => {

    it('should instantiate UnauthorizedError when MissingOrInvalidCredentialsError', async () => {

      // given
      const error = new MissingOrInvalidCredentialsError();
      sinon.stub(HttpErrors, 'UnauthorizedError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      const message = 'L\'adresse e-mail et/ou le mot de passe saisis sont incorrects.';
      expect(HttpErrors.UnauthorizedError).to.have.been.calledWithExactly(message);
    });

    it('should instantiate PasswordShouldChangeError when UserShouldChangePasswordError', async () => {
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

    it('should instantiate ConflictError when UnexpectedUserAccountError', async () => {
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

    it('should instantiate BadRequestError when AlreadyRegisteredEmailError', async () => {
      // given
      const error = new AlreadyRegisteredEmailError();
      sinon.stub(HttpErrors, 'BadRequestError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.BadRequestError).to.have.been.calledWithExactly(error.message);
    });

    it('should instantiate BadRequestError when AlreadyRegisteredUsernameError', async () => {
      // given
      const error = new AlreadyRegisteredUsernameError();
      sinon.stub(HttpErrors, 'BadRequestError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.BadRequestError).to.have.been.calledWithExactly(error.message);
    });

    it('should instantiate BadRequestError when AlreadyRegisteredEmailAndUsernameError', async () => {
      // given
      const error = new AlreadyRegisteredEmailAndUsernameError();
      sinon.stub(HttpErrors, 'BadRequestError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.BadRequestError).to.have.been.calledWithExactly(error.message);
    });

    it('should instantiate ServiceUnavailableError when InvalidExternalAPIResponseError', async () => {
      // given
      const error = new InvalidExternalAPIResponseError();
      sinon.stub(HttpErrors, 'ServiceUnavailableError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.ServiceUnavailableError).to.have.been.calledWithExactly(error.message);
    });
  });

});
