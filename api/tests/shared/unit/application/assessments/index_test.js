import { assessmentAuthorization } from '../../../../../src/evaluation/application/pre-handlers/assessment-authorization.js';
import { assessmentController } from '../../../../../src/shared/application/assessments/assessment-controller.js';
import * as moduleUnderTest from '../../../../../src/shared/application/assessments/index.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { config as settings } from '../../../../../src/shared/config.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Router | assessment-router', function () {
  describe('POST /api/assessments', function () {
    it('should return 200', async function () {
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

  describe('POST /api/pix1d/assessments/preview', function () {
    it('should return 200', async function () {
      // given
      sinon
        .stub(assessmentController, 'createAssessmentPreviewForPix1d')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/pix1d/assessments/preview');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/assessments/{id}/next', function () {
    it('should return 200', async function () {
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

  describe('GET /api/assessments/{id}', function () {
    const method = 'GET';
    const url = '/api/assessments/1';

    it('should return 200', async function () {
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

    it('should call pre-handler', async function () {
      // given
      sinon.stub(assessmentAuthorization, 'verify').callsFake((request, h) => h.response(null));
      sinon.stub(assessmentController, 'get').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request(method, url);

      // then
      sinon.assert.called(assessmentAuthorization.verify);
    });
  });

  describe('GET /api/assessments/{id}/competence-evaluations', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(assessmentController, 'findCompetenceEvaluations').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/assessments/123/competence-evaluations');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should do throw a 400 status code when assessmentId provided is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/assessments/not_a_number/competence-evaluations');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('POST /api/admin/assessments/{id}/always-ok-validate-next-challenge', function () {
    let originalEnvValue;

    beforeEach(async function () {
      originalEnvValue = settings.featureToggles.isAlwaysOkValidateNextChallengeEndpointEnabled;
      settings.featureToggles.isAlwaysOkValidateNextChallengeEndpointEnabled = true;
    });

    afterEach(function () {
      settings.featureToggles.isAlwaysOkValidateNextChallengeEndpointEnabled = originalEnvValue;
    });

    it('should return a response with an HTTP status code 403 if user does not have the rights', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns((request, h) =>
        h
          .response({ errors: new Error('Unauthorized') })
          .code(403)
          .takeover(),
      );

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const { statusCode } = await httpTestServer.request(
        'POST',
        `/api/admin/assessments/123/always-ok-validate-next-challenge`,
      );

      // then
      expect(securityPreHandlers.hasAtLeastOneAccessOf).to.have.be.called;
      expect(statusCode).to.equal(403);
    });
  });
});
