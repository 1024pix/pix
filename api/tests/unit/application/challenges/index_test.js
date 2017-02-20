const { describe, it, before, after, beforeEach, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const ChallengeController = require('../../../../lib/application/challenges/challenge-controller');

describe('Unit | Router | challenge-router', function () {

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

    before(function () {
      sinon.stub(ChallengeController, 'list', (request, reply) => reply('ok'));
    });

    after(function () {
      ChallengeController.list.restore();
    });

    it('should exist', function (done) {
      expectRouteToExist({ method: 'GET', url: '/api/challenges' }, done);
    });
  });

  describe('GET /api/challenges/{id}', function () {

    before(function () {
      sinon.stub(ChallengeController, 'get', (request, reply) => reply('ok'));
    });

    after(function () {
      ChallengeController.get.restore();
    });

    it('should exist', function (done) {
      expectRouteToExist({ method: 'GET', url: '/api/challenges/challenge_id' }, done);
    });
  });

  describe('POST /api/challenges/{id}', function () {

    before(function () {
      sinon.stub(ChallengeController, 'refresh', (request, reply) => reply('ok'));
    });

    after(function () {
      ChallengeController.refresh.restore();
    });

    it('should exist', function (done) {
      expectRouteToExist({ method: 'POST', url: '/api/challenges/challenge_id' }, done);
    });
  });

  describe('PUT /api/challenges/{id}/validate', function () {

    before(function () {
      sinon.stub(ChallengeController, 'revalidateAnswers', (request, reply) => reply('ok'));
    });

    after(function () {
      ChallengeController.revalidateAnswers.restore();
    });

    it('should exist', function (done) {
      expectRouteToExist({ method: 'PUT', url: '/api/challenges/{id}/validate' }, done);
    });
  });
  
  describe('POST /api/challenges/{id}/solution', function () {

    before(function () {
      sinon.stub(ChallengeController, 'refreshSolution', (request, reply) => reply('ok'));
    });

    after(function () {
      ChallengeController.refreshSolution.restore();
    });

    it('should exist', function (done) {
      expectRouteToExist({ method: 'POST', url: '/api/challenges/challenge_id/solution' }, done);
    });
  });

});
