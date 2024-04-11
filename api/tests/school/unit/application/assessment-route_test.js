import { assessmentController } from '../../../../src/school/application/assessment-controller.js';
import * as moduleUnderTest from '../../../../src/school/application/assessment-route.js';
import { AssessmentEndedError } from '../../../../src/shared/domain/errors.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Application | Router | assessment-router', function () {
  describe('GET /api/pix1d/assessments/{id}/next', function () {
    it('should call getNextChallengeForPix1d', async function () {
      // given
      const getNextStub = sinon.stub(assessmentController, 'getNextChallengeForPix1d');
      getNextStub.returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/pix1d/assessments/1/next');

      // then
      expect(getNextStub).to.have.been.called;
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
    it('should call create assessment', async function () {
      // given
      const createStub = sinon.stub(assessmentController, 'create');
      createStub.callsFake((request, h) => h.response('ok').code(201));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('POST', '/api/pix1d/assessments', {
        missionId: 1,
        learnerId: 34567,
      });

      // then
      expect(createStub).to.have.been.called;
    });
  });

  describe('GET /api/pix1d/assessments/{id}', function () {
    const method = 'GET';
    const url = '/api/pix1d/assessments/1';

    it('should call get assessment by id', async function () {
      const getAssessmentStub = sinon.stub(assessmentController, 'getById');
      getAssessmentStub.callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request(method, url);

      // then
      expect(getAssessmentStub).to.have.been.called;
    });
  });

  describe('GET /api/pix1d/assessments/{id}/current-activity', function () {
    it('should get current activity', async function () {
      const getCurrentActivityStub = sinon.stub(assessmentController, 'getCurrentActivity');
      getCurrentActivityStub.returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const assessmentId = '12345678';

      await httpTestServer.request('GET', `/api/pix1d/assessments/${assessmentId}/current-activity`);

      expect(getCurrentActivityStub).to.have.been.called;
    });
  });
});
