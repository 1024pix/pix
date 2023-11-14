import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { assessmentController } from '../../../../../src/school/application/assessments/assessment-controller.js';
import * as moduleUnderTest from '../../../../../src/school/application/assessments/assessment-route.js';
import { AssessmentEndedError } from '../../../../../src/shared/domain/errors.js';

describe('Unit | Application | Router | assessment-router', function () {
  describe('GET /api/pix1d/assessments/{id}/next', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(assessmentController, 'getNextChallengeForPix1d').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/pix1d/assessments/1/next');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400', async function () {
      // given
      sinon.stub(assessmentController, 'getNextChallengeForPix1d').rejects(new AssessmentEndedError());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/pix1d/assessments/1/next');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('POST /api/pix1d/assessments', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(assessmentController, 'createForPix1d').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/pix1d/assessments', {
        missionId: 'unMissionID',
        learnerId: 34567,
      });

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/pix1d/assessments/{id}', function () {
    const method = 'GET';
    const url = '/api/pix1d/assessments/1';

    it('should return 200', async function () {
      sinon.stub(assessmentController, 'getByAssessmentId').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
