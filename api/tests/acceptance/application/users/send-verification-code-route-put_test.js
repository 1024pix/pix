const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const { featureToggles } = require('../../../../lib/config');

describe('Acceptance | Route | Users', function() {

  describe('PUT /api/users/{id}/email/verification-code', function() {

    it('should return 204 HTTP status code', async function() {
      // given
      const server = await createServer();
      featureToggles.isEmailValidationEnabled = true;

      const newEmail = 'new_email@example.net';
      const locale = 'fr-fr';
      const rawPassword = 'Password123';
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        email: 'judy.howl@example.net',
        rawPassword,
      });

      await databaseBuilder.commit();

      const payload = {
        data: {
          type: 'email-verification-code',
          attributes: {
            newEmail,
            password: rawPassword,
          },
        },
      };

      const options = {
        method: 'PUT',
        url: `/api/users/${user.id}/email/verification-code`,
        payload,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(user.id),
          'accept-language': locale,
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return 404 if FT_VALIDATE_EMAIL is not enabled', async function() {
      // given
      const server = await createServer();
      featureToggles.isEmailValidationEnabled = false;

      const newEmail = 'new_email@example.net';
      const locale = 'fr-fr';
      const rawPassword = 'Password123';
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        email: 'judy.howl@example.net',
        rawPassword,
      });

      await databaseBuilder.commit();

      const payload = {
        data: {
          type: 'email-verification-code',
          attributes: {
            newEmail,
            password: rawPassword,
          },
        },
      };

      const options = {
        method: 'PUT',
        url: `/api/users/${user.id}/email/verification-code`,
        payload,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(user.id),
          'accept-language': locale,
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
      expect(response.result.errors[0].detail).to.equal('Cette route est désactivée');
    });

    it('should return 400 if email already exists', async function() {
      // given
      featureToggles.isEmailValidationEnabled = true;
      const server = await createServer();

      const locale = 'fr-fr';
      const rawPassword = 'Password123';
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        email: 'judy.howl@example.net',
        rawPassword,
      });

      await databaseBuilder.commit();

      const payload = {
        data: {
          type: 'email-verification-code',
          attributes: {
            newEmail: user.email,
            password: rawPassword,
          },
        },
      };

      const options = {
        method: 'PUT',
        url: `/api/users/${user.id}/email/verification-code`,
        payload,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(user.id),
          'accept-language': locale,
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
      expect(response.result.errors[0].detail).to.equal('Cette adresse e-mail est déjà utilisée.');
    });

    it('should return 403 if requested user is not the same as authenticated user', async function() {
      // given
      featureToggles.isEmailValidationEnabled = true;
      const server = await createServer();

      const locale = 'fr-fr';
      const rawPassword = 'Password123';
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        id: 2000,
        email: 'judy.howl@example.net',
        rawPassword,
      });

      await databaseBuilder.commit();

      const payload = {
        data: {
          type: 'email-verification-code',
          attributes: {
            newEmail: user.email,
            password: rawPassword,
          },
        },
      };

      const options = {
        method: 'PUT',
        url: '/api/users/999/email/verification-code',
        payload,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(user.id),
          'accept-language': locale,
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result.errors[0].detail).to.equal('Missing or insufficient permissions.');
    });

    it('should return 400 if password is not valid', async function() {
      // given
      const server = await createServer();

      const locale = 'fr-fr';
      const newEmail = 'new_email@example.net';
      const rawPassword = 'Password123';
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        email: 'judy.howl@example.net',
        rawPassword,
      });

      await databaseBuilder.commit();

      const payload = {
        data: {
          type: 'email-verification-code',
          attributes: {
            newEmail,
            password: 'WRONG-PASSWORD',
          },
        },
      };

      const options = {
        method: 'PUT',
        url: `/api/users/${user.id}/email/verification-code`,
        payload,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(user.id),
          'accept-language': locale,
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
      expect(response.result.errors[0].detail).to.equal('Le mot de passe que vous avez saisi est invalide.');
    });
  });
});
