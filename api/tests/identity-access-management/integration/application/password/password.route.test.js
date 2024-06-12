import { passwordController } from '../../../../../src/identity-access-management/application/password/password.controller.js';
import { identityAccessManagementRoutes } from '../../../../../src/identity-access-management/application/routes.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

const routesUnderTest = identityAccessManagementRoutes[0];

describe('Integration | Identity Access Management | Application | Route | password', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(passwordController, 'createResetPasswordDemand').callsFake((request, h) => h.response().created());

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(routesUnderTest);
  });

  describe('POST /api/password-reset-demands', function () {
    const method = 'POST';
    const url = '/api/password-reset-demands';
    const headers = {
      'accept-language': 'fr',
    };
    const payload = {
      data: {
        type: 'password-reset-demands',
        attributes: { email: 'user@example.net' },
      },
    };

    it('returns 201 http status code', async function () {
      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(201);
    });
  });
});
