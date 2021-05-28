const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');
const assessmentAuthorization = require('../../../../lib/application/preHandlers/assessment-authorization');
const moduleUnderTest = require('../../../../lib/application/assessments');
const assessmentController = require('../../../../lib/application/assessments/assessment-controller');

describe('Unit | Application | Router | assessment-router', () => {

  describe('POST /api/assessments', () => {

    it('should return 200', async () => {
      // given
      sinon.stub(assessmentController, 'save').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/assessments');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/assessments', () => {

    it('should return 200', async () => {
      // given
      sinon.stub(assessmentController, 'findByFilters').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/assessments');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/assessments/{id}/next', () => {

    it('should return 200', async () => {
      // given
      sinon.stub(assessmentController, 'getNextChallenge').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/assessments/1/next');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/assessments/{id}', () => {

    const method = 'GET';
    const url = '/api/assessments/1';

    it('should return 200', async () => {
      // given
      sinon.stub(assessmentAuthorization, 'verify').callsFake((request, h) => h.response(null));
      sinon.stub(assessmentController, 'get').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should call pre-handler', async () => {
      // given
      sinon.stub(assessmentAuthorization, 'verify').callsFake((request, h) => h.response(null));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request(method, url);

      // then
      sinon.assert.called(assessmentAuthorization.verify);
    });
  });

  describe('GET /api/assessments/{id}/competence-evaluations', () => {

    it('should return 200', async () => {
      // given
      sinon.stub(assessmentController, 'findCompetenceEvaluations').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/assessments/123/competence-evaluations');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should do throw a 400 status code when assessmentId provided is not a number', async () => {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/assessments/not_a_number/competence-evaluations');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
