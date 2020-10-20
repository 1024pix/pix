const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

const moduleUnderTest = require('../../../../lib/application/cache');

const cacheController = require('../../../../lib/application/cache/cache-controller');

describe('Unit | Router | cache-router', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(cacheController, 'refreshCacheEntries').callsFake((request, h) => h.response().code(204));
    sinon.stub(cacheController, 'refreshCacheEntry').callsFake((request, h) => h.response().code(204));
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('DELETE /api/cache/{cachekey}', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('DELETE', '/api/cache/Table_recXYZ1234');

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('PATCH /api/cache', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('PATCH', '/api/cache');

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
