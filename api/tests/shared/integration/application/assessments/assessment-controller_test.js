import sinon from 'sinon';

import { assessmentAuthorization } from '../../../../../src/evaluation/application/pre-handlers/assessment-authorization.js';
import { assessmentsRoute as moduleUnderTest } from '../../../../../src/shared/application/assessments/index.js';
import { sharedUsecases } from '../../../../../src/shared/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Integration | Application | Assessments | assessment-controller', function () {
  let assessment;

  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(sharedUsecases, 'updateAssessmentWithNextChallenge');
    sinon.stub(assessmentAuthorization, 'verify');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
    assessment = domainBuilder.buildAssessment();
  });

  describe('#get', function () {
    context('Success cases', function () {
      beforeEach(function () {
        assessmentAuthorization.verify.resolves(assessment);
      });

      it('should resolve a 200 HTTP response', async function () {
        // given
        sharedUsecases.updateAssessmentWithNextChallenge.resolves({ assessment, globalProgression: null });

        // when
        const response = await httpTestServer.request('GET', '/api/assessments/1234');

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return a JSON API assessment', async function () {
        // given
        sharedUsecases.updateAssessmentWithNextChallenge.resolves({ assessment, globalProgression: null });

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
