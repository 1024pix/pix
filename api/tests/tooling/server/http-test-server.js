const Hapi = require('@hapi/hapi');
const preResponseUtils = require('../../../lib/application/pre-response-utils');

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
    this.hapiServer.ext('onPreResponse', preResponseUtils.handleDomainAndHttpErrors);
    this.hapiServer.events.on({ name: 'request', channels: 'error' }, (request, event) => {
      console.error(event.error);
    });
    this.hapiServer.register(moduleUnderTest);
  }

  request(method, url, payload, auth) {
    return this.hapiServer.inject({ method, url, payload, auth });
  }
}

module.exports = HttpTestServer;
