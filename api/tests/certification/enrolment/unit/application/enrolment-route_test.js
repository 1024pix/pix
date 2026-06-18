import FormData from 'form-data';
import sinon from 'sinon';

import { enrolmentController } from '../../../../../src/certification/enrolment/application/enrolment-controller.js';
import { enrolmentRoute as moduleUnderTest } from '../../../../../src/certification/enrolment/application/enrolment-route.js';
import { authorization } from '../../../../../src/certification/shared/application/pre-handlers/authorization.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Certification | Enrolment | Unit | Application | Routes', function () {
  describe('PUT /api/session/{sessionId}/enrol-students-to-session', function () {
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

  describe('GET /api/sessions/{sessionId}/candidates-import-sheet', function () {
    it('should return 200', async function () {
      // when
      sinon.stub(authorization, 'verifySessionAuthorization').resolves(true);
      sinon.stub(enrolmentController, 'getCandidatesImportSheet').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const auth = { credentials: { userId: 99 }, strategy: {} };

      const response = await httpTestServer.request('GET', '/api/sessions/3/candidates-import-sheet', {}, auth);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 404 if the user is not authorized on the session', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').throws(new NotFoundError());

      const auth = { credentials: { userId: 99 }, strategy: {} };
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const response = await httpTestServer.request('GET', '/api/sessions/3/candidates-import-sheet', {}, auth);

      // then
      expect(response.statusCode).to.equal(404);
    });
  });

  describe('POST /api/sessions/{sessionId}/certification-candidates/import', function () {
    const method = 'POST';

    let headers;
    let payload;

    beforeEach(function () {
      const form = new FormData();
      form.append('file', Buffer.alloc(0), { filename: 'test-file' });
      headers = form.getHeaders();
      payload = form.getBuffer();
    });

    it('should exist', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(enrolmentController, 'importCertificationCandidatesFromCandidatesImportSheet').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const sessionId = 3;
      const url = `/api/sessions/${sessionId}/certification-candidates/import`;

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('when session ID params is not a number', function () {
      it('should return 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const sessionId = 'salut';
        const url = `/api/sessions/${sessionId}/certification-candidates/import`;

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when session ID params is out of range for database integer (> 2147483647)', function () {
      it('should return 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const sessionId = 9999999999;
        const url = `/api/sessions/${sessionId}/certification-candidates/import`;

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
