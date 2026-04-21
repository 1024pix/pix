import sinon from 'sinon';

import { passwordController } from '../../../../../src/identity-access-management/application/password/password.controller.js';
import { identityAccessManagementRoutes } from '../../../../../src/identity-access-management/application/routes.js';

import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

const routesUnderTest = identityAccessManagementRoutes[0];

describe('Unit | Identity Access Management | Application | Route | password', function () {
  describe('POST /api/password-reset-demands', function () {
    const method = 'POST';
    const url = '/api/password-reset-demands';

    it('returns 200 http status code', async function () {
      // given
      sinon.stub(passwordController, 'createResetPasswordDemand').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);

      const payload = {
        data: {
          attributes: {
            email: 'uzinagaz@example.net',
          },
          type: 'password-reset',
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('When payload has a bad format or no email is provided', function () {
      it('returns 400 http status code', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(routesUnderTest);

        const payload = {
          data: {
            attributes: {},
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('POST /api/expired-password-updates', function () {
    const method = 'POST';
    const url = '/api/expired-password-updates';

    it('returns 201 http status code', async function () {
      // given
      sinon.stub(passwordController, 'updateExpiredPassword').callsFake((request, h) => h.response().created());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);

      const payload = {
        data: {
          attributes: {
            'password-reset-token': 'PASSWORD_RESET_TOKEN',
            'new-password': 'Password123',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });

    context('When the payload has the wrong format or no passwordResetToken or newPassword is provided.', function () {
      it('returns 400 http status code', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(routesUnderTest);

        const payload = {
          data: {
            attributes: {
              'password-reset-token': 'PASSWORD_RESET_TOKEN',
              newPassword: null,
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
