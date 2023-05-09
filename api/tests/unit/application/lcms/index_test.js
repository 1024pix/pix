import { expect, HttpTestServer, sinon } from '../../../test-helper.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { moduleUnderTest } from '../../../../lib/application/lcms.js';
import { lcmsController } from '../../../../lib/application/lcms/lcms-controller.js';

describe('Unit | Router | lcms-router', function () {
  let httpTestServer;

  beforeEach(function () {
    sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
    sinon.stub(lcmsController, 'createRelease').callsFake((request, h) => h.response().code(204));

    httpTestServer = new HttpTestServer();
    httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/lcms/releases', function () {
    it('should exist', async function () {
      // when
      const response = await httpTestServer.request('POST', '/api/lcms/releases');

      // then
      expect(response.statusCode).to.equal(204);
      expect(lcmsController.createRelease).to.have.been.called;
    });
  });
});
