import { passwordController } from '../../../../../src/identity-access-management/application/password/password.controller.js';
import { identityAccessManagementRoutes } from '../../../../../src/identity-access-management/application/routes.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

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
});
