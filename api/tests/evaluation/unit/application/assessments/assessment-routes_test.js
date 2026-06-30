import sinon from 'sinon';

import { assessmentController } from '../../../../../src/evaluation/application/assessments/assessment-controller.js';
import { assessmentsRoute as moduleUnderTest } from '../../../../../src/evaluation/application/assessments/index.js.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { config as settings } from '../../../../../src/shared/config.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Evaluation | Unit | Application | assessment-routes', function () {
  describe('POST /api/assessments', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(assessmentController, 'save').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = {
        data: {
          attributes: {
            type: Assessment.types.DEMO,
          },
        },
      };

      // when
      const response = await httpTestServer.request('POST', '/api/assessments', payload);

      // then
      expect(response.statusCode).to.equal(200);
    });

    describe('When type is not defined', function () {
      it('should return 400 Bad request', async function () {
        // given
        sinon.stub(assessmentController, 'save').callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/assessments');

        // then
        expect(response.statusCode).to.equal(400);
        expect(response.statusMessage).to.equal('Bad Request');
        sinon.assert.notCalled(assessmentController.save);
      });
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
});
