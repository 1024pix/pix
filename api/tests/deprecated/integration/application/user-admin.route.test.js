import sinon from 'sinon';

import { deprecatedRoutes } from '../../../../src/deprecated/application/routes.js';
import { userAdminController } from '../../../../src/deprecated/application/user-admin.controller.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../test-helper.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';

const routesUnderTest = deprecatedRoutes[0];

describe('Integration | Deprecated | Application | Route | User admin', function () {
  let httpTestServer;

  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(routesUnderTest);
  });

  describe('GET /api/admin/users/{id}', function () {
    it('returns an HTTP status code 200', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(userAdminController, 'getUserDetails').resolves('ok');

      // when
      const response = await httpTestServer.request('GET', '/api/admin/users/8');

      // then
      expect(response.statusCode).to.equal(200);
      sinon.assert.calledOnce(securityPreHandlers.hasAtLeastOneAccessOf);
      sinon.assert.calledOnce(userAdminController.getUserDetails);
    });

    it('returns an HTTP status code 403', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns((request, h) =>
        h
          .response({ errors: new Error('') })
          .code(403)
          .takeover(),
      );

      // when
      const response = await httpTestServer.request('GET', '/api/admin/users/8');

      // then
      expect(response.statusCode).to.equal(403);
      sinon.assert.calledOnce(securityPreHandlers.hasAtLeastOneAccessOf);
    });
  });
});
