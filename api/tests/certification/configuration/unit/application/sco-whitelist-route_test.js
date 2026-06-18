import sinon from 'sinon';

import { scoWhitelistController } from '../../../../../src/certification/configuration/application/sco-whitelist-controller.js';
import { scoWhitelistRoute as moduleUnderTest } from '../../../../../src/certification/configuration/application/sco-whitelist-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Certification | Configuration | Unit | Application | Router | sco-whitelist-route', function () {
  describe('POST /api/admin/sco-whitelist', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(scoWhitelistController, 'importScoWhitelist').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/admin/sco-whitelist');

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(scoWhitelistController.importScoWhitelist);
      });
    });
  });

  describe('GET /api/admin/sco-whitelist', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(scoWhitelistController, 'exportScoWhitelist').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/sco-whitelist');

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(scoWhitelistController.exportScoWhitelist);
      });
    });
  });
});
