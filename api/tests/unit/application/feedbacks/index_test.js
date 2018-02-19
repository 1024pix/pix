const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const feedbackController = require('../../../../lib/application/feedbacks/feedback-controller');

describe('Unit | Router | feedback-router', function() {

  let server;

  beforeEach(function() {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/feedbacks') });
  });

  function expectRouteToExist(routeOptions, done) {
    server.inject(routeOptions, (res) => {
      expect(res.statusCode).to.equal(200);
      done();
    });
  }

  describe('POST /api/feedbacks', function() {

    before(function() {
      sinon.stub(feedbackController, 'save').callsFake((request, reply) => reply('ok'));
    });

    after(function() {
      feedbackController.save.restore();
    });

    it('should exist', function(done) {
      expectRouteToExist({ method: 'POST', url: '/api/feedbacks' }, done);
    });
  });

  describe('GET /api/feedbacks', () => {

    before(function() {
      sinon.stub(feedbackController, 'find').callsFake((request, reply) => reply('ok'));
    });

    after(function() {
      feedbackController.find.restore();
    });

    it('should exist', (done) => {
      expectRouteToExist({ method: 'GET', url: '/api/feedbacks' }, done);
    });
  });

});
