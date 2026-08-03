import sinon from 'sinon';

import { assessmentsRoute as moduleUnderTest } from '../../../../../src/evaluation/application/assessments/index.js.js';
import { assessmentAuthorization } from '../../../../../src/evaluation/application/pre-handlers/assessment-authorization.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Integration | Evaluation | Application | Assessments | assessment-controller', function () {
  let assessment;
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(evaluationUsecases, 'updateAssessmentWithNextChallenge');
    sinon.stub(assessmentAuthorization, 'verify');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
    assessment = domainBuilder.buildAssessment();
  });

  describe('#getAssessmentWithNextChallenge', function () {
    context('Success cases', function () {
      beforeEach(function () {
        assessmentAuthorization.verify.resolves(assessment);
      });

      it('should resolve a 200 HTTP response', async function () {
        // given
        evaluationUsecases.updateAssessmentWithNextChallenge.resolves({ assessment, globalProgression: null });

        // when
        const response = await httpTestServer.request('GET', '/api/assessments/1234');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return a JSON API assessment', async function () {
        // given
        evaluationUsecases.updateAssessmentWithNextChallenge.resolves({ assessment, globalProgression: null });

        // when
        const response = await httpTestServer.request('GET', '/api/assessments/1234');

        // then
        expect(response.result.data.type).to.equal('assessments');
      });
    });

    context('Error cases', function () {
      context('when user is not allowed to access resource', function () {
        beforeEach(function () {
          assessmentAuthorization.verify.callsFake((request, h) => {
            return h.response({ some: 'error' }).code(401).takeover();
          });
        });

        it('should resolve a 401 HTTP response', async function () {
          // when
          const response = await httpTestServer.request('GET', '/api/assessments/1234');

          // then
          expect(response.statusCode).to.equal(401);
        });
      });
    });
  });
});
