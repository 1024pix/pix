const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const sessionController = require('../../../../lib/application/sessions/session-controller');
const sessionAuthorization = require('../../../../lib/application/preHandlers/session-authorization');
const route = require('../../../../lib/application/sessions');
const fs = require('fs');
const FormData = require('form-data');
const streamToPromise = require('stream-to-promise');

describe('Unit | Application | Sessions | Routes', () => {
  let server;

  beforeEach(() => {
    server = this.server = Hapi.server();
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
    sinon.stub(sessionController, 'getCertifications').returns('ok');
    sinon.stub(sessionController, 'createCandidateParticipation').returns('ok');
    sinon.stub(sessionController, 'finalize').returns('ok');
    sinon.stub(sessionController, 'updatePublication').returns('ok');
    sinon.stub(sessionController, 'flagResultsAsSentToPrescriber').returns('ok');
    sinon.stub(sessionController, 'assignCertificationOfficer').returns('ok');

    return server.register(route);
  });

  describe('GET /api/sessions/{id}', () => {

    it('should exist', async () => {
      const res = await server.inject({ method: 'GET', url: '/api/sessions/3' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('GET /api/jury/sessions/{id}', () => {

    it('should exist', async () => {
      const res = await server.inject({ method: 'GET', url: '/api/jury/sessions/123' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('GET /api/jury/sessions', () => {

    it('should exist', async () => {
      const res = await server.inject({ method: 'GET', url: '/api/jury/sessions' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('POST /api/session', () => {

    it('should exist', async () => {
      const res = await server.inject({ method: 'POST', url: '/api/sessions' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('GET /api/sessions/{id}/attendance-sheet', () => {

    it('should exist', async () => {
      const res = await server.inject({ method: 'GET', url: '/api/sessions/1/attendance-sheet' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/sessions/{id}', () => {

    it('should exist', async () => {
      const res = await server.inject({ method: 'PATCH', url: '/api/sessions/1' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('POST /api/sessions/{id}/certification-candidates/import', () => {
    let sessionId;

    const testFilePath = `${__dirname}/testFile_temp.ods`;
    let options;
    beforeEach(async () => {
      // given
      fs.writeFileSync(testFilePath, Buffer.alloc(0));
      const form = new FormData();
      form.append('file', fs.createReadStream(testFilePath), { knownLength: fs.statSync(testFilePath).size });
      const payload = await streamToPromise(form);
      options = {
        method: 'POST',
        headers: form.getHeaders(),
        payload,
      };
    });

    afterEach(() => {
      fs.unlinkSync(testFilePath);
    });

    it('should exist', async () => {
      // given
      sessionId = 3;
      options.url = `/api/sessions/${sessionId}/certification-candidates/import`;

      // when
      const res = await server.inject(options);

      // then
      expect(res.statusCode).to.equal(200);
    });

    context('when session ID params is not a number', () => {

      it('should return 400', async () => {
        // given
        sessionId = 'salut';
        options.url = `/api/sessions/${sessionId}/certification-candidates/import`;

        // when
        const res = await server.inject(options);

        // then
        expect(res.statusCode).to.equal(400);
      });
    });

    context('when session ID params is out of range for database integer (> 2147483647)', () => {

      it('should return 400', async () => {
        // given
        sessionId = 9999999999;
        options.url = `/api/sessions/${sessionId}/certification-candidates/import`;

        // when
        const res = await server.inject(options);

        // then
        expect(res.statusCode).to.equal(400);
      });
    });
  });

  describe('GET /api/sessions/{id}/certification-candidates', () => {

    it('should exist', async () => {
      const res = await server.inject({ method: 'GET', url: '/api/sessions/3/certification-candidates' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('POST /api/sessions/{id}/certification-candidates', () => {

    it('should exist', async () => {
      const res = await server.inject({ method: 'POST', url: '/api/sessions/3/certification-candidates' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('DELETE /api/sessions/{id}/certification-candidates/{certificationCandidateId}', () => {

    it('should exist', async () => {
      const res = await server.inject({ method: 'DELETE', url: '/api/sessions/3/certification-candidates/1' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('GET /api/jury/sessions/{id}/certifications', () => {

    it('should exist', async () => {
      const res = await server.inject({ method: 'GET', url: '/api/jury/sessions/1/certifications' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('POST /api/sessions/{id}/candidate-participation', () => {

    it('should exist', async () => {
      const res = await server.inject({ method: 'POST', url: '/api/sessions/3/candidate-participation' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('PUT /api/sessions/{id}/finalization', () => {

    it('should exist', async () => {
      const res = await server.inject({ method: 'PUT', url: '/api/sessions/3/finalization' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/jury/sessions/{id}/publication', () => {

    it('should exist', async () => {
      const res = await server.inject({ method: 'PATCH', url: '/api/jury/sessions/1/publication', payload: { data: { attributes: { toPublish: true } } } });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('PUT /api/jury/sessions/{id}/results-sent-to-prescriber', () => {

    it('should exist', async () => {
      const res = await server.inject({ method: 'PUT', url: '/api/jury/sessions/3/results-sent-to-prescriber' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/jury/sessions/{id}/certification-officer-assignment', () => {

    it('should exist', async () => {
      const res = await server.inject({ method: 'PATCH', url: '/api/jury/sessions/1/certification-officer-assignment' });
      expect(res.statusCode).to.equal(200);
    });
  });

  [
    { condition: 'session ID params is not a number', request: { method: 'GET', url: '/api/sessions/salut' } },
    { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'GET', url: '/api/sessions/9999999999' } },
    { condition: 'session ID params is not a number', request: { method: 'GET', url: '/api/jury/sessions/salut' } },
    { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'GET', url: '/api/jury/sessions/9999999999' } },
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
    { condition: 'session ID params is not a number', request: { method: 'GET', url: '/api/jury/sessions/salut/certifications' } },
    { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'GET', url: '/api/jury/sessions/9999999999/certifications' } },
    { condition: 'session ID params is not a number', request: { method: 'POST', url: '/api/sessions/salut/candidate-participation' } },
    { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'POST', url: '/api/sessions/9999999999/candidate-participation' } },
    { condition: 'session ID params is not a number', request: { method: 'PUT', url: '/api/sessions/salut/finalization' } },
    { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'PUT', url: '/api/sessions/9999999999/finalization' } },
    { condition: 'session ID params is not a number', request: { method: 'PATCH', url: '/api/jury/sessions/salut/publication', payload: { data: { attributes: { toPublish: true } } } } },
    { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'PATCH', url: '/api/jury/sessions/9999999999/publication', payload: { data: { attributes: { toPublish: true } } } } },
    { condition: 'session ID params is not a number', request: { method: 'PUT', url: '/api/jury/sessions/salut/results-sent-to-prescriber' } },
    { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'PUT', url: '/api/jury/sessions/9999999999/results-sent-to-prescriber' } },
    { condition: 'session ID params is not a number', request: { method: 'PATCH', url: '/api/jury/sessions/salut/certification-officer-assignment' } },
    { condition: 'session ID params is out of range for database integer (> 2147483647)', request: { method: 'PATCH', url: '/api/jury/sessions/9999999999/certification-officer-assignment' } },
  ].forEach(({ condition, request }) => {
    it(`should return 400 when ${condition}`, async () => {
      const res = await server.inject(request);
      expect(res.statusCode).to.equal(400);
    });
  });
});
