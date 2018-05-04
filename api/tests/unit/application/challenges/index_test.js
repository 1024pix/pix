const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const ChallengeController = require('../../../../lib/application/challenges/challenge-controller');

describe('Unit | Router | challenge-router', function() {

  let server;

  beforeEach(function() {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/challenges') });
  });

  function expectRouteToExist(routeOptions, done) {
    server.inject(routeOptions, (res) => {
      expect(res.statusCode).to.equal(200);
      done();
    });
  }

  describe('GET /api/challenges/{id}', function() {

    before(function() {
      sinon.stub(ChallengeController, 'get').callsFake((request, reply) => reply('ok'));
    });

    after(function() {
      ChallengeController.get.restore();
    });

    it('should exist', function(done) {
      expectRouteToExist({ method: 'GET', url: '/api/challenges/challenge_id' }, done);
    });
  });
});
