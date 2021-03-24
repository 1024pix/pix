const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const assessmentAuthorization = require('../../../../lib/application/preHandlers/assessment-authorization');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

const moduleUnderTest = require('../../../../lib/application/assessments');

const assessmentController = require('../../../../lib/application/assessments/assessment-controller');

describe('Integration | Route | AssessmentRoute', function() {

  let httpTestServer;

  beforeEach(function() {
    sinon.stub(assessmentController, 'save').returns('ok');
    sinon.stub(assessmentController, 'getNextChallenge').returns('ok');
    sinon.stub(assessmentController, 'findByFilters').returns('ok');
    sinon.stub(assessmentController, 'get').returns('ok');
    sinon.stub(assessmentController, 'findCompetenceEvaluations').returns('ok');
    sinon.stub(assessmentAuthorization, 'verify').returns('userId');
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster');

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('POST /api/assessments', function() {

    it('should exist', async function() {
      // when
      const response = await httpTestServer.request('POST', '/api/assessments');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/assessments/assessment_id/next', function() {

    it('should exist', async function() {
      // when
      const response = await httpTestServer.request('GET', '/api/assessments/1/next');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/assessments', function() {

    it('should exist', async function() {
      // when
      const response = await httpTestServer.request('GET', '/api/assessments');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/assessments/{id}', function() {

    const method = 'GET';
    const url = '/api/assessments/1';

    it('should exist', async function() {
      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should call pre-handler', async function() {
      // when
      await httpTestServer.request(method, url);

      // then
      sinon.assert.called(assessmentAuthorization.verify);
    });
  });

  describe('GET /api/assessments/{id}/competence-evaluations', function() {

    it('should exist', async function() {
      // when
      const response = await httpTestServer.request('GET', '/api/assessments/123/competence-evaluations');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should do throw a 400 status code when assessmentId provided is not a number', async function() {
      // when
      const response = await httpTestServer.request('GET', '/api/assessments/not_a_number/competence-evaluations');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
