const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const SessionController = require('../../../../lib/application/sessions/session-controller');

describe('Unit | Route | session-router', function() {

  let server;

  beforeEach(function() {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/sessions') });
  });

  function expectRouteToExist(routeOptions, done) {
    server.inject(routeOptions, (res) => {
      expect(res.statusCode).to.equal(200);
      done();
    });
  }

  describe('GET /api/session', function() {

    before(function() {
      sinon.stub(SessionController, 'get').callsFake((request, reply) => reply('ok'));
    });

    after(function() {
      SessionController.get.restore();
    });

    it('should exist', function(done) {
      expectRouteToExist({ method: 'GET', url: '/api/sessions' }, done);
    });
  });

  describe('POST /api/session', function() {

    before(function() {
      sinon.stub(SessionController, 'save').callsFake((request, reply) => reply('ok'));
    });

    after(function() {
      SessionController.save.restore();
    });

    it('should exist', function(done) {
      expectRouteToExist({ method: 'POST', url: '/api/sessions' }, done);
    });
  });

});
