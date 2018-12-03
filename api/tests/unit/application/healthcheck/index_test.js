const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const healthcheckController = require('../../../../lib/application/healthcheck/healthcheck-controller');

describe('Unit | Router | HealthcheckRouter', function() {
  let server;

  beforeEach(function() {
    server = this.server = Hapi.server();
    return server.register(require('../../../../lib/application/healthcheck'));
  });

  describe('GET /api', function() {

    before(function() {
      sinon.stub(healthcheckController, 'get').returns('ok');
    });

    after(function() {
      healthcheckController.get.restore();
    });

    it('should exist', async function() {
      const res = await server.inject({ method: 'GET', url: '/api' });
      expect(res.statusCode).to.equal(200);
    });
  });
});
