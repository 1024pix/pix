const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const sessionController = require('../../../../lib/application/sessions/session-controller');
const route = require('../../../../lib/application/sessions');
const fs = require('fs');
const FormData = require('form-data');
const streamToPromise = require('stream-to-promise');

describe('Unit | Application | Sessions | Routes', () => {
  let server;

  beforeEach(() => {
    // given
    server = this.server = Hapi.server();
  });

  describe('GET /api/sessions/{id}', () => {

    beforeEach(() => {
      // given
      sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      sinon.stub(sessionController, 'get').returns('ok');
      return server.register(route);
    });

    it('should exist', async () => {
      // when
      const res = await server.inject({ method: 'GET', url: '/api/sessions/{id}' });

      // then
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('GET /api/sessions', () => {

    beforeEach(() => {
      // given
      sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      sinon.stub(sessionController, 'find').returns('ok');
      return server.register(route);
    });

    it('should exist', async () => {
      // when
      const res = await server.inject({ method: 'GET', url: '/api/sessions' });

      // then
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('POST /api/session', () => {

    beforeEach(() => {
      // given
      sinon.stub(sessionController, 'save').returns('ok');
      return server.register(route);
    });

    it('should exist', async () => {
      // when
      const res = await server.inject({ method: 'POST', url: '/api/sessions' });

      // then
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('GET /api/sessions/{id}/attendance-sheet', () => {

    beforeEach(() => {
      // given
      sinon.stub(sessionController, 'getAttendanceSheet').returns('ok');
      return server.register(route);
    });

    it('should exist', async () => {
      // when
      const res = await server.inject({ method: 'GET', url: '/api/sessions/{id}/attendance-sheet' });

      // then
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('POST /api/sessions/{id}/certification-candidates/parse-from-attendance-sheet', () => {

    const testFilePath = `${__dirname}/testFile_temp.ods`;
    let options;
    beforeEach(async () => {
      // given
      sinon.stub(sessionController, 'parseCertificationCandidatesFromAttendanceSheet').returns('ok');
      fs.writeFileSync(testFilePath, Buffer.alloc(0));
      const form = new FormData();
      form.append('file', fs.createReadStream(testFilePath), { knownLength: fs.statSync(testFilePath).size });
      const payload = await streamToPromise(form);
      options = {
        method: 'POST',
        url: '/api/sessions/{id}/certification-candidates/parse-from-attendance-sheet',
        headers: form.getHeaders(),
        payload,
      };

      await server.register(route);
    });

    afterEach(() => {
      fs.unlinkSync(testFilePath);
    });

    it('should exist', async () => {
      // when
      const res = await server.inject(options);

      // then
      expect(res.statusCode).to.equal(200);
    });

  });

});
