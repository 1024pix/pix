const Hapi = require('hapi');

/**
 * ⚠️ You must declare your stubs before calling the HttpTestServer constructor (because of Node.Js memoization).
 *
 * Ex:
 *
 * beforeEach(() => {
 *   sinon.stub(usecases, 'updateOrganizationInformation');
 *   sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, reply) => reply(true));
 *   httpTestServer = new HttpTestServer(moduleUnderTest);
 * });
 *
 * afterEach(() => {
 *   usecases.updateOrganizationInformation.restore();
 *   securityController.checkUserHasRolePixMaster.restore();
 * });
 */
class HttpTestServer {

  constructor(moduleUnderTest) {
    this.hapiServer = new Hapi.Server();
    this.hapiServer.connection({ port: null });
    this.hapiServer.register({ register: moduleUnderTest });
  }

  request(method, url, payload) {
    return this.hapiServer.inject({ method, url, payload });
  }
}

module.exports = HttpTestServer;
