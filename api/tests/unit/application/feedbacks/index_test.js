const { describe, it, beforeEach, before, after, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const FeedbackController = require('../../../../lib/application/feedbacks/feedback-controller');

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
      sinon.stub(FeedbackController, 'save', (request, reply) => reply('ok'));
    });

    after(function() {
      FeedbackController.save.restore();
    });

    it('should exist', function(done) {
      expectRouteToExist({ method: 'POST', url: '/api/feedbacks' }, done);
    });
  });

});
