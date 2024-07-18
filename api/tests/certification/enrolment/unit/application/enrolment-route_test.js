import { enrolmentController } from '../../../../../src/certification/enrolment/application/enrolment-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/enrolment/application/enrolment-route.js';
import { authorization } from '../../../../../src/certification/shared/application/pre-handlers/authorization.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Application | Routes', function () {
  describe('PUT /api/session/{id}/enrol-students-to-session', function () {
    it('exists', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(enrolmentController, 'enrolStudentsToSession').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PUT', '/api/sessions/3/enrol-students-to-session');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('validates the session id', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(enrolmentController, 'enrolStudentsToSession').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PUT', '/api/sessions/invalidId/enrol-students-to-session');

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('denies access if the session of the logged used is not authorized', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').throws(new NotFoundError());
      sinon.stub(enrolmentController, 'enrolStudentsToSession').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PUT', '/api/sessions/3/enrol-students-to-session');

      // then
      expect(response.statusCode).to.equal(404);
    });
  });
});
