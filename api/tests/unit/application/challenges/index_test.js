const Hapi = require('hapi');
const ChallengeController = require('../../../../lib/application/challenges/challenge-controller');

describe('Unit | Router | ChallengeRouter', function () {

  let server;

  beforeEach(function () {
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

  describe('GET /api/challenges', function () {

    before(function (done) {
      sinon.stub(ChallengeController, 'list', (request, reply) => reply('ok'));
      done();
    });

    after(function (done) {
      ChallengeController.list.restore();
      done();
    });

    it('should exist', function (done) {
      expectRouteToExist({ method: 'GET', url: '/api/challenges' }, done);
    });
  });

  describe('GET /api/challenges/{id}', function () {

    before(function (done) {
      sinon.stub(ChallengeController, 'get', (request, reply) => reply('ok'));
      done();
    });

    after(function (done) {
      ChallengeController.get.restore();
      done();
    });

    it('should exist', function (done) {
      expectRouteToExist({ method: 'GET', url: '/api/challenges/challenge_id' }, done);
    });
  });

  describe('POST /api/challenges/{id}', function () {

    before(function (done) {
      sinon.stub(ChallengeController, 'refresh', (request, reply) => reply('ok'));
      done();
    });

    after(function (done) {
      ChallengeController.refresh.restore();
      done();
    });

    it('should exist', function (done) {
      expectRouteToExist({ method: 'POST', url: '/api/challenges/challenge_id' }, done);
    });
  });

});
