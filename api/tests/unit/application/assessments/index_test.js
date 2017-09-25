const { describe, it, before, after, beforeEach, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const AssessmentController = require('../../../../lib/application/assessments/assessment-controller');
const AssessmentAuthorization = require('../../../../lib/application/preHandlers/assessment-authorization');

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

    let sandbox;

    before(function() {
      sandbox = sinon.sandbox.create();
      sandbox.stub(AssessmentController, 'get').callsFake((request, reply) => reply('ok'));
      sandbox.stub(AssessmentAuthorization, 'verify').callsFake((request, reply) => reply('userId'));
    });

    after(function() {
      sandbox.restore();
    });

    it('should exist', function(done) {
      expectRouteToExist({ method: 'GET', url: '/api/assessments/assessment_id' }, done);
    });

    it('should call pre-handler', (done) => {
      return server.inject({ method: 'GET', url: '/api/assessments/assessment_id' }, () => {
        sinon.assert.called(AssessmentAuthorization.verify);
        done();
      });
    });
  });
});
