const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
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
  });

  describe('GET /api/sessions/{id}', () => {
    let sessionId;

    beforeEach(() => {
      sinon.stub(sessionAuthorization, 'verify').returns(null);
      sinon.stub(sessionController, 'get').returns('ok');
      return server.register(route);
    });

    it('should exist', async () => {
      // given
      sessionId = 3;

      const res = await server.inject({ method: 'GET', url: `/api/sessions/${sessionId}` });
      expect(res.statusCode).to.equal(200);
    });

    context('when session ID params is not a number', () => {

      it('should return 400', async () => {
        // given
        sessionId = 'salut';

        const res = await server.inject({ method: 'GET', url: `/api/sessions/${sessionId}` });
        expect(res.statusCode).to.equal(400);
      });
    });
  });

  describe('GET /api/sessions', () => {

    beforeEach(() => {
      sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      sinon.stub(sessionController, 'find').returns('ok');
      return server.register(route);
    });

    it('should exist', async () => {
      const res = await server.inject({ method: 'GET', url: '/api/sessions' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('POST /api/session', () => {

    beforeEach(() => {
      sinon.stub(sessionController, 'save').returns('ok');
      return server.register(route);
    });

    it('should exist', async () => {
      const res = await server.inject({ method: 'POST', url: '/api/sessions' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('GET /api/sessions/{id}/attendance-sheet', () => {

    beforeEach(() => {
      sinon.stub(sessionController, 'getAttendanceSheet').returns('ok');
      return server.register(route);
    });

    it('should exist', async () => {
      const res = await server.inject({ method: 'GET', url: '/api/sessions/{id}/attendance-sheet' });

      expect(res.statusCode).to.equal(200);
    });
  });

  describe('POST /api/sessions/{id}/certification-candidates/import', () => {
    let sessionId;

    const testFilePath = `${__dirname}/testFile_temp.ods`;
    let options;
    beforeEach(async () => {
      // given
      sinon.stub(sessionAuthorization, 'verify').returns(null);
      sinon.stub(sessionController, 'importCertificationCandidatesFromAttendanceSheet').returns('ok');
      fs.writeFileSync(testFilePath, Buffer.alloc(0));
      const form = new FormData();
      form.append('file', fs.createReadStream(testFilePath), { knownLength: fs.statSync(testFilePath).size });
      const payload = await streamToPromise(form);
      options = {
        method: 'POST',
        headers: form.getHeaders(),
        payload,
      };

      await server.register(route);
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

  });

  describe('GET /api/sessions/{id}/certification-candidates', () => {
    let sessionId;

    beforeEach(() => {
      sinon.stub(sessionAuthorization, 'verify').returns(null);
      sinon.stub(sessionController, 'getCertificationCandidates').returns('ok');
      return server.register(route);
    });

    it('should exist', async () => {
      //given
      sessionId = 3;

      const res = await server.inject({ method: 'GET', url: `/api/sessions/${sessionId}/certification-candidates` });
      expect(res.statusCode).to.equal(200);
    });

    context('when session ID params is not a number', () => {

      it('should return 400', async () => {
        // given
        sessionId = 'salut';

        const res = await server.inject({ method: 'GET', url: `/api/sessions/${sessionId}/certification-candidates` });
        expect(res.statusCode).to.equal(400);
      });
    });
  });

  describe('GET /api/sessions/{id}/certifications', () => {

    beforeEach(() => {
      sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      sinon.stub(sessionController, 'getCertifications').returns('ok');
      return server.register(route);
    });

    it('should exist', async () => {
      const res = await server.inject({ method: 'GET', url: '/api/sessions/{id}/certifications' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('POST /api/sessions/{id}/candidate-participation', () => {

    beforeEach(() => {
      sinon.stub(sessionController, 'createCandidateParticipation').returns('ok');
      return server.register(route);
    });

    it('should exist', async () => {
      const res = await server.inject({ method: 'POST', url: '/api/sessions/3/candidate-participation' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('PUT /api/sessions/{id}/finalization', () => {
    let sessionId;

    beforeEach(() => {
      sinon.stub(sessionAuthorization, 'verify').returns(null);
      sinon.stub(sessionController, 'finalize').returns('ok');
      return server.register(route);
    });

    it('should exist', async () => {
      // given
      sessionId = 3;

      const res = await server.inject({ method: 'PUT', url: `/api/sessions/${sessionId}/finalization` });
      expect(res.statusCode).to.equal(200);
    });

    context('when session ID params is not a number', () => {

      it('should return 400', async () => {
        // given
        sessionId = 'salut';

        const res = await server.inject({ method: 'PUT', url: `/api/sessions/${sessionId}/finalization` });
        expect(res.statusCode).to.equal(400);
      });
    });
  });
});
