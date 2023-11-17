import { expect, hFake, sinon } from '../../../test-helper.js';

import {
  EntityValidationError,
  LocaleFormatError,
  LocaleNotSupportedError,
  NotFoundError,
  UserNotAuthorizedToAccessEntityError,
  CertificationAttestationGenerationError,
  NoCertificationAttestationForDivisionError,
} from '../../../../src/shared/domain/errors.js';

import { HttpErrors, UnauthorizedError } from '../../../../src/shared/application/http-errors.js';
import { handle } from '../../../../src/shared/application/error-manager.js';
import { AdminMemberError } from '../../../../src/authorization/domain/errors.js';
import {
  MissingOrInvalidCredentialsError,
  UserShouldChangePasswordError,
} from '../../../../src/authentication/domain/errors.js';

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
      const meta = 'RESET_PASSWORD_TOKEN';
      const error = new UserShouldChangePasswordError(message, meta);
      sinon.stub(HttpErrors, 'PasswordShouldChangeError');
      const params = { request: {}, h: hFake, error };

      // when
      await handle(params.request, params.h, params.error);

      // then
      expect(HttpErrors.PasswordShouldChangeError).to.have.been.calledWithExactly(message, meta);
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
  });
});
