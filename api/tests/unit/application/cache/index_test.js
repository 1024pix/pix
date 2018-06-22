const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const cacheController = require('../../../../lib/application/cache/cache-controller');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');

describe('Unit | Router | cache-router', () => {

  let sandbox;
  let server;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(cacheController, 'removeCacheEntry').callsFake((request, reply) => reply().code(204));
    sandbox.stub(cacheController, 'removeAllCacheEntries').callsFake((request, reply) => reply().code(204));
    sandbox.stub(cacheController, 'preloadCacheEntries').callsFake((request, reply) => reply().code(204));
    sandbox.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, reply) => reply(true));

    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/cache') });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('DELETE /api/cache/{cachekey}', function() {

    it('should exist', () => {
      // given
      const options = {
        method: 'DELETE',
        url: '/api/cache/test-cache-key'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(204);
      });
    });
  });

  describe('DELETE /api/cache', function() {

    it('should exist', () => {
      // given
      const options = {
        method: 'DELETE',
        url: '/api/cache'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(204);
      });
    });
  });

  describe('PATCH /api/cache', function() {

    it('should exist', () => {
      // given
      const options = {
        method: 'PATCH',
        url: '/api/cache'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(204);
      });
    });
  });

});
