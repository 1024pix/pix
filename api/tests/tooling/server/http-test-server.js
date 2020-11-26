const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');

const preResponseUtils = require('../../../lib/application/pre-response-utils');
const { handleFailAction } = require('../../../lib/validate');

const routesConfig = {
  routes: {
    validate: {
      failAction: handleFailAction,
    },
  },
};

/**
 * ⚠️ You must declare your stubs before calling the HttpTestServer constructor (because of Node.Js memoization).
 *
 * Ex:
 *
 * beforeEach(() => {
 *   sinon.stub(usecases, 'updateOrganizationInformation');
 *   sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, reply) => reply(true));
 *   httpTestServer = new HttpTestServer(moduleUnderTest);
 * });
 */
class HttpTestServer {

  constructor(moduleUnderTest) {
    this.hapiServer = Hapi.server(routesConfig);

    this.hapiServer.ext('onPreResponse', preResponseUtils.handleDomainAndHttpErrors);
    this.hapiServer.events.on({ name: 'request', channels: 'error' }, (request, event) => {
      // eslint-disable-next-line no-console
      console.error(event.error);
    });

    this.hapiServer.register(Inert);
    this.hapiServer.register(moduleUnderTest);
  }

  request(method, url, payload, auth, headers) {
    return this.hapiServer.inject({ method, url, payload, auth, headers });
  }
}

module.exports = HttpTestServer;
