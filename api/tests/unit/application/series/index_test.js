const { describe, it, before, after, beforeEach, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const SerieController = require('../../../../lib/application/series/serie-controller');

describe('Unit | Router | serie-router', function() {

  let server;

  beforeEach(function() {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/series') });
  });

  function expectRouteToExist(routeOptions, done) {
    server.inject(routeOptions, (res) => {
      expect(res.statusCode).to.equal(200);
      done();
    });
  }

  describe('GET /api/series', function() {

    before(function() {
      sinon.stub(SerieController, 'list', (request, reply) => reply('ok'));
    });

    after(function() {
      SerieController.list.restore();
    });

    it('should exist', function(done) {
      expectRouteToExist({ method: 'GET', url: '/api/series' }, done);
    });
  });
});
