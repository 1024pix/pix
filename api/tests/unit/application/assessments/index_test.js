const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const assessmentAuthorization = require('../../../../lib/application/preHandlers/assessment-authorization');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

const moduleUnderTest = require('../../../../lib/application/assessments');

const assessmentController = require('../../../../lib/application/assessments/assessment-controller');

describe('Integration | Route | AssessmentRoute', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(assessmentController, 'save').returns('ok');
    sinon.stub(assessmentController, 'getNextChallenge').returns('ok');
    sinon.stub(assessmentController, 'findByFilters').returns('ok');
    sinon.stub(assessmentController, 'get').returns('ok');
    sinon.stub(assessmentAuthorization, 'verify').returns('userId');
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster');

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('POST /api/assessments', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('POST', '/api/assessments');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/assessments/assessment_id/next', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/assessments/assessment_id/next');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/assessments', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/assessments');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/assessments/{id}', () => {

    const method = 'GET';
    const url = '/api/assessments/assessment_id';

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should call pre-handler', async () => {
      // when
      await httpTestServer.request(method, url);

      // then
      sinon.assert.called(assessmentAuthorization.verify);
    });
  });
});
