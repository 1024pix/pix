const { writeFile, stat, unlink } = require('fs').promises;
const fs = require('fs');
const FormData = require('form-data');
const streamToPromise = require('stream-to-promise');
const { NotFoundError } = require('../../../../lib/application/http-errors');

const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const sessionController = require('../../../../lib/application/sessions/session-controller');
const sessionAuthorization = require('../../../../lib/application/preHandlers/session-authorization');

const moduleUnderTest = require('../../../../lib/application/sessions');

describe('Unit | Application | Sessions | Routes', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(sessionAuthorization, 'verify').returns(null);
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));

    sinon.stub(sessionController, 'get').returns('ok');
    sinon.stub(sessionController, 'getJurySession').returns('ok');
    sinon.stub(sessionController, 'findPaginatedFilteredJurySessions').returns('ok');
    sinon.stub(sessionController, 'save').returns('ok');
    sinon.stub(sessionController, 'getAttendanceSheet').returns('ok');
    sinon.stub(sessionController, 'update').returns('ok');
    sinon.stub(sessionController, 'importCertificationCandidatesFromAttendanceSheet').returns('ok');
    sinon.stub(sessionController, 'getCertificationCandidates').returns('ok');
    sinon.stub(sessionController, 'addCertificationCandidate').returns('ok');
    sinon.stub(sessionController, 'deleteCertificationCandidate').returns('ok');
    sinon.stub(sessionController, 'getJuryCertificationSummaries').returns('ok');
    sinon.stub(sessionController, 'createCandidateParticipation').returns('ok');
    sinon.stub(sessionController, 'finalize').returns('ok');
    sinon.stub(sessionController, 'publish').returns('ok');
    sinon.stub(sessionController, 'unpublish').returns('ok');
    sinon.stub(sessionController, 'flagResultsAsSentToPrescriber').returns('ok');
    sinon.stub(sessionController, 'assignCertificationOfficer').returns('ok');
    sinon.stub(sessionController, 'enrollStudentsToSession').returns('ok');

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('GET /api/sessions/{id}', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/sessions/3');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/admin/sessions/{id}', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/admin/sessions/123');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/admin/sessions', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/admin/sessions');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/session', () => {

    it('should exist', async () => {
      /// when
      const response = await httpTestServer.request('POST', '/api/sessions');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/sessions/{id}/attendance-sheet', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/sessions/1/attendance-sheet');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/sessions/{id}', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('PATCH', '/api/sessions/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/sessions/{id}/certification-candidates/import', () => {

    const testFilePath = `${__dirname}/testFile_temp.ods`;

    const method = 'POST';

    let headers;
    let url;
    let payload;

    let sessionId;

    beforeEach(async () => {
      await writeFile(testFilePath, Buffer.alloc(0));
      const form = new FormData();
      const knownLength = await stat(testFilePath).size;
      form.append('file', fs.createReadStream(testFilePath), { knownLength });

      headers = form.getHeaders();
      payload = await streamToPromise(form);
    });

    afterEach(async () => {
      await unlink(testFilePath);
    });

    it('should exist', async () => {
      // given
      sessionId = 3;
      url = `/api/sessions/${sessionId}/certification-candidates/import`;

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('when session ID params is not a number', () => {

      it('should return 400', async () => {
        // given
        sessionId = 'salut';
        url = `/api/sessions/${sessionId}/certification-candidates/import`;

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when session ID params is out of range for database integer (> 2147483647)', () => {

      it('should return 400', async () => {
        // given
        sessionId = 9999999999;
        url = `/api/sessions/${sessionId}/certification-candidates/import`;

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('GET /api/sessions/{id}/certification-candidates', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/sessions/3/certification-candidates');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/sessions/{id}/certification-candidates', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('POST', '/api/sessions/3/certification-candidates');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('DELETE /api/sessions/{id}/certification-candidates/{certificationCandidateId}', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('DELETE', '/api/sessions/3/certification-candidates/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/admin/sessions/{id}/jury-certification-summaries', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/admin/sessions/1/jury-certification-summaries');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/sessions/{id}/candidate-participation', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('POST', '/api/sessions/3/candidate-participation');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PUT /api/sessions/{id}/finalization', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('PUT', '/api/sessions/3/finalization');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/admin/sessions/{id}/publish', () => {

    it('should exist', async () => {
      // given
      const payload = {
        data: {
          attributes: {
            toPublish: true,
          },
        },
      };

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/sessions/1/publish', payload);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
  describe('PATCH /api/admin/sessions/{id}/unpublish', () => {

    it('should exist', async () => {
      // given
      const payload = {
        data: {
          attributes: {
            toPublish: true,
          },
        },
      };

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/sessions/1/unpublish', payload);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PUT /api/admin/sessions/{id}/results-sent-to-prescriber', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('PUT', '/api/admin/sessions/3/results-sent-to-prescriber');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/admin/sessions/{id}/certification-officer-assignment', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/sessions/1/certification-officer-assignment');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('id validation', () => {
    [
      { condition: 'session ID params is not a number', request: { method: 'GET', url: '/api/sessions/salut' } },
      { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'GET', url: '/api/sessions/9999999999' } },
      { condition: 'session ID params is not a number', request: { method: 'GET', url: '/api/admin/sessions/salut' } },
      { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'GET', url: '/api/admin/sessions/9999999999' } },
      { condition: 'session ID params is not a number', request: { method: 'GET', url: '/api/sessions/salut/attendance-sheet' } },
      { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'GET', url: '/api/sessions/9999999999/attendance-sheet' } },
      { condition: 'session ID params is not a number', request: { method: 'PATCH', url: '/api/sessions/salut' } },
      { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'PATCH', url: '/api/sessions/9999999999' } },
      { condition: 'session ID params is not a number', request: { method: 'GET', url: '/api/sessions/salut/certification-candidates' } },
      { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'GET', url: '/api/sessions/9999999999/certification-candidates' } },
      { condition: 'session ID params is not a number', request: { method: 'POST', url: '/api/sessions/salut/certification-candidates' } },
      { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'POST', url: '/api/sessions/9999999999/certification-candidates' } },
      { condition: 'session ID params is not a number', request: { method: 'DELETE', url: '/api/sessions/salut/certification-candidates/1' } },
      { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'DELETE', url: '/api/sessions/9999999999/certification-candidates/1' } },
      { condition: 'certification candidate ID params is not a number', request: { method: 'DELETE', url: '/api/sessions/1/certification-candidates/salut' } },
      { condition: 'certification candidate ID params is out of range for database integer (> 2147483647)', request: { method: 'DELETE', url: '/api/sessions/1/certification-candidates/9999999999' } },
      { condition: 'session ID params is not a number', request: { method: 'GET', url: '/api/admin/sessions/salut/jury-certification-summaries' } },
      { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'GET', url: '/api/admin/sessions/9999999999/jury-certification-summaries' } },
      { condition: 'session ID params is not a number', request: { method: 'POST', url: '/api/sessions/salut/candidate-participation' } },
      { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'POST', url: '/api/sessions/9999999999/candidate-participation' } },
      { condition: 'session ID params is not a number', request: { method: 'PUT', url: '/api/sessions/salut/finalization' } },
      { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'PUT', url: '/api/sessions/9999999999/finalization' } },
      { condition: 'session ID params is not a number', request: { method: 'PATCH', url: '/api/admin/sessions/salut/publish' } },
      { condition: 'session ID params is not a number', request: { method: 'PATCH', url: '/api/admin/sessions/salut/unpublish' } },
      { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'PATCH', url: '/api/admin/sessions/9999999999/publish' } },
      { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'PATCH', url: '/api/admin/sessions/9999999999/unpublish' } },
      { condition: 'session ID params is not a number', request: { method: 'PUT', url: '/api/admin/sessions/salut/results-sent-to-prescriber' } },
      { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'PUT', url: '/api/admin/sessions/9999999999/results-sent-to-prescriber' } },
      { condition: 'session ID params is not a number', request: { method: 'PATCH', url: '/api/admin/sessions/salut/certification-officer-assignment' } },
      { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'PATCH', url: '/api/admin/sessions/9999999999/certification-officer-assignment' } },
    ].forEach(({ condition, request }) => {
      it(`should return 400 when ${condition}`, async () => {
        // when
        const response = await httpTestServer.request(request.method, request.url, request.payload || null);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('PUT /api/session/{id}/enroll-students-to-session', () => {
    it('exists', async () => {
      // when
      const response = await httpTestServer.request('PUT', '/api/sessions/3/enroll-students-to-session');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('validates the session id', async () => {
      // when
      const response = await httpTestServer.request('PUT', '/api/sessions/invalidId/enroll-students-to-session');

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('denies access if the session of the logged used is not authorized', async () => {
      // given
      sessionAuthorization.verify.throws(new NotFoundError());

      // when
      const response = await httpTestServer.request('PUT', '/api/sessions/3/enroll-students-to-session');

      // then
      expect(response.statusCode).to.equal(404);
    });
  });

  describe('GET /api/admin/sessions/to-publish', () => {
    it('exists', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/admin/sessions/to-publish');

      // then
      expect(response.statusCode).to.equal(200);
    });
    it('is protected by a prehandler checking the Pix Master role', async () => {
      // given
      securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response().code(403).takeover());

      // when
      const response = await httpTestServer.request('GET', '/api/admin/sessions/to-publish');

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/admin/sessions/with-required-action', () => {
    it('exists', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/admin/sessions/with-required-action');

      // then
      expect(response.statusCode).to.equal(200);
    });
    it('is protected by a prehandler checking the Pix Master role', async () => {
      // given
      securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => h.response().code(403).takeover());

      // when
      const response = await httpTestServer.request('GET', '/api/admin/sessions/with-required-action');

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
