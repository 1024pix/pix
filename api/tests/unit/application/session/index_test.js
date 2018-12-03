const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const sessionController = require('../../../../lib/application/sessions/session-controller');

describe('Unit | Application | Sessions | Routes', () => {
  let server;

  beforeEach(() => {
    server = this.server = Hapi.server();
    return server.register(require('../../../../lib/application/sessions'));
  });

  describe('GET /api/sessions/{id}', () => {

    before(() => {
      sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      sinon.stub(sessionController, 'get').returns('ok');
    });

    after(() => {
      securityController.checkUserHasRolePixMaster.restore();
      sessionController.get.restore();
    });

    it('should exist', async () => {
      const res = await server.inject({ method: 'GET', url: '/api/sessions/{id}' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('GET /api/sessions', () => {

    before(() => {
      sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      sinon.stub(sessionController, 'find').returns('ok');
    });

    after(() => {
      securityController.checkUserHasRolePixMaster.restore();
      sessionController.find.restore();
    });

    it('should exist', async () => {
      const res = await server.inject({ method: 'GET', url: '/api/sessions' });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('POST /api/session', () => {

    before(() => {
      sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      sinon.stub(sessionController, 'save').returns('ok');
    });

    after(() => {
      securityController.checkUserHasRolePixMaster.restore();
      sessionController.save.restore();
    });

    it('should exist', async () => {
      const res = await server.inject({ method: 'POST', url: '/api/sessions' });
      expect(res.statusCode).to.equal(200);
    });
  });
});
