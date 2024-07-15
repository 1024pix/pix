import { passwordController } from '../../../../../src/identity-access-management/application/password/password.controller.js';
import { identityAccessManagementRoutes } from '../../../../../src/identity-access-management/application/routes.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

const routesUnderTest = identityAccessManagementRoutes[0];

describe('Integration | Identity Access Management | Application | Route | password', function () {
  let httpTestServer;

  beforeEach(async function () {
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
      // given
      sinon.stub(passwordController, 'createResetPasswordDemand').callsFake((request, h) => h.response().created());

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('GET /api/password-reset-demands/{temporaryKey}', function () {
    const method = 'GET';
    const url = '/api/password-reset-demands/ABCDEF123';

    it('returns 200 http status code', async function () {
      // given
      sinon.stub(passwordController, 'checkResetDemand').callsFake((request, h) => h.response().code(200));

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
