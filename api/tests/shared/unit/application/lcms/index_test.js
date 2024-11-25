import * as moduleUnderTest from '../../../../../src/shared/application/lcms/index.js';
import { lcmsController } from '../../../../../src/shared/application/lcms/lcms-controller.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Router | lcms-router', function () {
  let httpTestServer;

  beforeEach(function () {
    sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
    sinon.stub(lcmsController, 'refreshCacheEntry').callsFake((request, h) => h.response().code(204));
    sinon.stub(lcmsController, 'createRelease').callsFake((request, h) => h.response().code(204));
    sinon.stub(lcmsController, 'refreshCacheEntries').callsFake((request, h) => h.response().code(204));
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

  describe('PATCH /api/cache/{model}/{id}', function () {
    it('should exist', async function () {
      //given
      const updatedRecord = { id: 'recId', param: 'updatedValue' };

      // when
      const response = await httpTestServer.request('PATCH', '/api/cache/table/recXYZ1234', updatedRecord);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('PATCH /api/cache', function () {
    it('should exist', async function () {
      // when
      const response = await httpTestServer.request('PATCH', '/api/cache');

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
