import { identityAccessManagementRoutes } from '../../../../src/identity-access-management/application/routes.js';
import { userController } from '../../../../src/identity-access-management/application/user/user.controller.js';
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
});
