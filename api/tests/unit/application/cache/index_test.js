const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const cacheController = require('../../../../lib/application/cache/cache-controller');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');

describe('Unit | Router | cache-router', () => {

  let server;

  beforeEach(() => {
    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/cache') });
  });

  describe('DELETE /api/cache', function() {
    before(() => {
      sinon.stub(cacheController, 'removeCacheEntry').callsFake((request, reply) => reply('ok'));
      sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, reply) => reply(true));
    });

    after(() => {
      cacheController.removeCacheEntry.restore();
      securityController.checkUserHasRolePixMaster.restore();
    });

    it('should exist', () => {
      // when
      return server.inject({ method: 'DELETE', url: '/api/cache' })
        .then((res) => {
          expect(res.statusCode).to.equal(200);
        });
    });
  });

});
