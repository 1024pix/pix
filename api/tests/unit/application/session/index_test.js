const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const sessionController = require('../../../../lib/application/sessions/session-controller');
const route = require('../../../../lib/application/sessions');

describe('Unit | Application | Sessions | Routes', () => {
  let server;

  beforeEach(() => {
    server = this.server = Hapi.server();
  });

  describe('GET /api/sessions/{id}', () => {

    beforeEach(() => {
      sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      sinon.stub(sessionController, 'get').returns('ok');
      return server.register(route);
    });

    it('should exist', async () => {
      const res = await server.inject({ method: 'GET', url: '/api/sessions/{id}' });
      expect(res.statusCode).to.equal(200);
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

  describe('GET /api/sessions/{id}/certification-courses', () => {

    beforeEach(() => {
      sinon.stub(sessionController, 'getCertificationCourses').returns('ok');
      return server.register(route);
    });

    it('should exist', async () => {
      const res = await server.inject({ method: 'GET', url: '/api/sessions/{id}/certification-courses' });
      expect(res.statusCode).to.equal(200);
    });
  });
});
