const { describe, it, before, after, beforeEach, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const AssessmentController = require('../../../../lib/application/assessments/assessment-controller');

describe('Unit | Router | assessment-router', function() {

  let server;

  beforeEach(function() {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/assessments') });
  });

  function expectRouteToExist(routeOptions, done) {
    server.inject(routeOptions, (res) => {
      expect(res.statusCode).to.equal(200);
      done();
    });
  }

  describe('POST /api/assessments', function() {

    before(function() {
      sinon.stub(AssessmentController, 'save').callsFake((request, reply) => reply('ok'));
    });

    after(function() {
      AssessmentController.save.restore();
    });

    it('should exist', function(done) {
      expectRouteToExist({ method: 'POST', url: '/api/assessments' }, done);
    });
  });

  describe('GET /api/assessments/assessment_id/next', function() {

    before(function() {
      sinon.stub(AssessmentController, 'getNextChallenge').callsFake((request, reply) => reply('ok'));
    });

    after(function() {
      AssessmentController.getNextChallenge.restore();
    });

    it('should exist', function(done) {
      expectRouteToExist({ method: 'GET', url: '/api/assessments/assessment_id/next' }, done);
    });
  });

  describe('GET /api/assessments/assessment_id/next/challenge_id', function() {

    before(function() {
      sinon.stub(AssessmentController, 'getNextChallenge').callsFake((request, reply) => reply('ok'));
    });

    after(function() {
      AssessmentController.getNextChallenge.restore();
    });

    it('should exist', function(done) {
      expectRouteToExist({ method: 'GET', url: '/api/assessments/assessment_id/next/challenge_id' }, done);
    });
  });

  describe('GET /api/assessments/assessment_id', function() {

    before(function() {
      sinon.stub(AssessmentController, 'get').callsFake((request, reply) => reply('ok'));
    });

    after(function() {
      AssessmentController.get.restore();
    });

    it('should exist', function(done) {
      expectRouteToExist({ method: 'GET', url: '/api/assessments/assessment_id' }, done);
    });
  });
});
