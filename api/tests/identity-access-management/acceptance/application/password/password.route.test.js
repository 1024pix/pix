import { resetPasswordService } from '../../../../../src/identity-access-management/domain/services/reset-password.service.js';
import { config } from '../../../../../src/shared/config.js';
import { createServer, databaseBuilder, expect } from '../../../../test-helper.js';

describe('Acceptance | Identity Access Management | Application | Route | password', function () {
  const email = 'user@example.net';
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/password-reset-demands', function () {
    let options;

    beforeEach(async function () {
      options = {
        method: 'POST',
        url: '/api/password-reset-demands',
        payload: {
          data: {
            attributes: { email },
          },
        },
      };

      config.mailing.enabled = false;

      const userId = databaseBuilder.factory.buildUser({ email }).id;
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId });
      await databaseBuilder.commit();
    });

    context('when email provided is unknown', function () {
      it('replies with 404', async function () {
        // given
        options.payload.data.attributes.email = 'unknown@example.net';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    context('when existing email is provided', function () {
      it('replies with 201', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
      });
    });
  });

  describe('GET /api/password-reset-demands/{temporaryKey}', function () {
    it('returns 200 http status code', async function () {
      // given
      const temporaryKey = await resetPasswordService.generateTemporaryKey();
      const options = {
        method: 'GET',
        url: `/api/password-reset-demands/${temporaryKey}`,
      };
      const userId = databaseBuilder.factory.buildUser({ email }).id;
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId });
      databaseBuilder.factory.buildResetPasswordDemand({ temporaryKey, email });
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
