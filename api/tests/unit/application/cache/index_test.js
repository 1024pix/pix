const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const moduleUnderTest = require('../../../../lib/application/cache');
const cacheController = require('../../../../lib/application/cache/cache-controller');

describe('Unit | Router | cache-router', () => {

  describe('PATCH /api/cache/{model}/{id}', () => {

    it('should exist', async () => {
      //given
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
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

  describe('PATCH /api/cache', () => {

    it('should exist', async () => {
      //given
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
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
