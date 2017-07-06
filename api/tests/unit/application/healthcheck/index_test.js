const { describe, it, expect, before, beforeEach, after, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const healthcheckController = require('../../../../lib/application/healthcheck/healthcheck-controller');

describe('Unit | Router | HealthcheckRouter', function() {

  let server;

  beforeEach(function() {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/healthcheck') });
  });

  function expectRouteToExist(routeOptions, done) {
    server.inject(routeOptions, (res) => {
      expect(res.statusCode).to.equal(200);
      done();
    });
  }

  describe('GET /api', function() {

    before(function() {
      sinon.stub(healthcheckController, 'get', (request, reply) => reply('ok'));
    });

    after(function() {
      healthcheckController.get.restore();
    });

    it('should exist', function(done) {
      return expectRouteToExist({ method: 'GET', url: '/api' }, done);
    });
  });

});
