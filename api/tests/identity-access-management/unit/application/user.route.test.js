import { userVerification } from '../../../../lib/application/preHandlers/user-existence-verification.js';
import { identityAccessManagementRoutes } from '../../../../src/identity-access-management/application/routes.js';
import { userController } from '../../../../src/identity-access-management/application/user/user.controller.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

const routesUnderTest = identityAccessManagementRoutes[0];

describe('Unit | Identity Access Management | Application | Route | User', function () {
  describe('POST /api/users', function () {
    const method = 'POST';
    const url = '/api/users';

    context('Payload schema validation', function () {
      it('should return HTTP 400 if payload does not exist', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(routesUnderTest);

        const payload = null;

        // when
        const result = await httpTestServer.request(method, url, payload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should return HTTP 200 if payload is not empty and valid', async function () {
        // given
        sinon.stub(userController, 'save').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(routesUnderTest);

        const payload = { data: { attributes: {} } };

        // when
        const result = await httpTestServer.request(method, url, payload);

        // then
        expect(result.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/users/me', function () {
    const method = 'GET';

    it('exists', async function () {
      // given
      sinon.stub(userController, 'getCurrentUser').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);

      const url = '/api/users/me';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/users/{id}/authentication-methods', function () {
    const method = 'GET';

    it('returns 400 when userId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);

      const userId = 'wrongId';
      const url = `/api/users/${userId}/authentication-methods`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('PATCH /api/users/{id}/password-update', function () {
    const method = 'PATCH';
    const url = '/api/users/12344/password-update';

    it('exists and pass through user verification pre-handler', async function () {
      // given
      sinon.stub(userController, 'updatePassword').returns('ok');
      sinon.stub(userVerification, 'verifyById').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);

      const payloadAttributes = { password: 'Pix2019!' };
      const payload = { data: { attributes: payloadAttributes } };

      // when
      const result = await httpTestServer.request(method, url, payload);

      // then
      expect(result.statusCode).to.equal(200);
      sinon.assert.calledOnce(userVerification.verifyById);
    });

    describe('Payload schema validation', function () {
      it('has a payload', async function () {
        // when
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(routesUnderTest);

        const result = await httpTestServer.request(method, url);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('has a password attribute in payload', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(routesUnderTest);

        const payload = { data: { attributes: {} } };

        // when
        const result = await httpTestServer.request(method, url, payload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      describe('password validation', function () {
        it('has a valid password format in payload', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(routesUnderTest);

          const payloadAttributes = {
            password: 'Mot de passe mal formé',
          };
          const payload = { data: { attributes: payloadAttributes } };

          // when
          const result = await httpTestServer.request(method, url, payload);

          // then
          expect(result.statusCode).to.equal(400);
        });
      });
    });
  });

  describe('PUT /api/users/{id}/email/verification-code', function () {
    it('returns HTTP code 204', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      sinon.stub(userController, 'sendVerificationCode').callsFake((request, h) => h.response({}).code(204));

      const url = '/api/users/1/email/verification-code';
      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            'new-email': 'user@example.net',
            password: 'Password123',
          },
        },
      };

      // when
      const result = await httpTestServer.request('PUT', url, payload);

      // then
      expect(result.statusCode).to.equal(204);
    });

    it('returns 422 when id is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);

      const url = '/api/users/wrongId/email/verification-code';

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            'new-email': 'user@example.net',
            password: 'Password123',
          },
        },
      };

      // when
      const result = await httpTestServer.request('PUT', url, payload);

      // then
      expect(result.statusCode).to.equal(422);
      expect(result.result.errors[0].detail).to.equal('"id" must be a number');
    });

    it('returns 422 when type is not users', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);

      const url = '/api/users/1/email/verification-code';

      const payload = {
        data: {
          type: 'WRONG-TYPE',
          attributes: {
            'new-email': 'user@example.net',
            password: 'Password123',
          },
        },
      };

      // when
      const result = await httpTestServer.request('PUT', url, payload);

      // then
      expect(result.statusCode).to.equal(422);
      expect(result.result.errors[0].detail).to.equal('"data.type" must be [email-verification-codes]');
    });

    it('returns 422 when email is not valid', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);

      const url = '/api/users/1/email/verification-code';

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            'new-email': 'newEmail',
            password: 'Password123',
          },
        },
      };

      // when
      const result = await httpTestServer.request('PUT', url, payload);

      // then
      expect(result.statusCode).to.equal(422);
      expect(result.result.errors[0].detail).to.equal('"data.attributes.new-email" must be a valid email');
    });

    it('returns 422 when password is not provided', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);

      const url = '/api/users/1/email/verification-code';

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            'new-email': 'user@example.net',
          },
        },
      };

      // when
      const result = await httpTestServer.request('PUT', url, payload);

      // then
      expect(result.statusCode).to.equal(422);
      expect(result.result.errors[0].detail).to.equal('"data.attributes.password" is required');
    });
  });
});
