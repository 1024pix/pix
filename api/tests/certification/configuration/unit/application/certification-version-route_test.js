import sinon from 'sinon';

import { certificationVersionController } from '../../../../../src/certification/configuration/application/certification-version-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/configuration/application/certification-version-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';

import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Certification | Configuration | Application | Router | certification-version-route', function () {
  describe('GET /api/admin/certification-versions/{scope}/active', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(certificationVersionController, 'getActiveVersionByScope').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request('GET', '/api/admin/certification-versions/CORE/active');

        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(certificationVersionController.getActiveVersionByScope);
      });
    });

    describe('when the scope parameter is invalid', function () {
      it('should return 400 HTTP status code when scope is not a valid Framework', async function () {
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(true);
        sinon.stub(certificationVersionController, 'getActiveVersionByScope').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request('GET', '/api/admin/certification-versions/INVALID_SCOPE/active');

        expect(response.statusCode).to.equal(400);
        sinon.assert.notCalled(certificationVersionController.getActiveVersionByScope);
      });
    });
  });
});
