const Hapi = require('@hapi/hapi');
const preResponseUtils = require('../../../lib/infrastructure/utils/pre-response-utils');

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
 */
class HttpTestServer {

  constructor(moduleUnderTest) {
    this.hapiServer = Hapi.server();
    this.hapiServer.ext('onPreResponse', preResponseUtils.catchDomainAndInfrastructureErrors);
    this.hapiServer.register(moduleUnderTest);
  }

  request(method, url, payload) {
    return this.hapiServer.inject({ method, url, payload });
  }
}

module.exports = HttpTestServer;
