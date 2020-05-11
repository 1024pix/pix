const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const cacheController = require('../../../../lib/application/cache/cache-controller');
const securityController = require('../../../../lib/application/security-controller');

describe('Unit | Router | cache-router', () => {

  let server;

  beforeEach(() => {
    sinon.stub(cacheController, 'refreshCacheEntries').callsFake((request, h) => h.response().code(204));
    sinon.stub(cacheController, 'refreshCacheEntry').callsFake((request, h) => h.response().code(204));
    sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));

    server = Hapi.server();

    return server.register(require('../../../../lib/application/cache'));
  });

  afterEach(() => {
    server.stop();
  });

  describe('DELETE /api/cache/{cachekey}', () => {

    it('should exist', async () => {
      // given
      const options = {
        method: 'DELETE',
        url: '/api/cache/Table_recXYZ1234'
      };

      // when
      const result = await server.inject(options);
      // then
      expect(result.statusCode).to.equal(204);
    });
  });

  describe('PATCH /api/cache', () => {

    it('should exist', async () => {
      // given
      const options = {
        method: 'PATCH',
        url: '/api/cache'
      };

      // when
      const result = await server.inject(options);

      // then
      expect(result.statusCode).to.equal(204);
    });
  });

});
