const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const sessionController = require('../../../../lib/application/sessions/session-controller');

describe('Unit | Application | Sessions | Routes', () => {

  let server;

  beforeEach(() => {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/sessions') });
  });

  function expectRouteToExist(routeOptions, done) {
    server.inject(routeOptions, (res) => {
      expect(res.statusCode).to.equal(200);
      done();
    });
  }

  describe('GET /api/session', () => {

    before(() => {
      sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, reply) => reply(true));
      sinon.stub(sessionController, 'get').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      securityController.checkUserHasRolePixMaster.restore();
      sessionController.get.restore();
    });

    it('should exist', (done) => {
      expectRouteToExist({ method: 'GET', url: '/api/sessions' }, done);
    });
  });

  describe('POST /api/session', () => {

    before(() => {
      sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, reply) => reply(true));
      sinon.stub(sessionController, 'save').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      securityController.checkUserHasRolePixMaster.restore();
      sessionController.save.restore();
    });

    it('should exist', (done) => {
      expectRouteToExist({ method: 'POST', url: '/api/sessions' }, done);
    });
  });

});
