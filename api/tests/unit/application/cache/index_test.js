import { cacheController } from '../../../../lib/application/cache/cache-controller.js';
import * as moduleUnderTest from '../../../../lib/application/cache/index.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Router | cache-router', function () {
  describe('PATCH /api/cache/{model}/{id}', function () {
    it('should exist', async function () {
      //given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon.stub(cacheController, 'refreshCacheEntry').callsFake((request, h) => h.response().code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const updatedRecord = { id: 'recId', param: 'updatedValue' };

      // when
      const response = await httpTestServer.request('PATCH', '/api/cache/table/recXYZ1234', updatedRecord);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('PATCH /api/cache', function () {
    it('should exist', async function () {
      //given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon.stub(cacheController, 'refreshCacheEntries').callsFake((request, h) => h.response().code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/cache');

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
