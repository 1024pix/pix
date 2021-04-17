const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');

const authentication = require('../../../lib/infrastructure/authentication');

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

  constructor(moduleUnderTest, enableAuthentication = false) {
    this.hapiServer = Hapi.server(routesConfig);

    this.hapiServer.ext('onPreResponse', preResponseUtils.handleDomainAndHttpErrors);
    this.hapiServer.events.on({ name: 'request', channels: 'error' }, (request, event) => {
      // eslint-disable-next-line no-console
      console.error(event.error);
    });

    if (enableAuthentication) {
      this.hapiServer.auth.scheme(authentication.schemeName, authentication.scheme);
      authentication.strategies.map((strategy) => {
        this.hapiServer.auth.strategy(strategy.name, authentication.schemeName, strategy.configuration);
      });
      this.hapiServer.auth.default(authentication.defaultStrategy);
    }
    this.hapiServer.register(Inert);
    this.hapiServer.register(moduleUnderTest);
  }

  request(method, url, payload, auth, headers) {
    return this.hapiServer.inject({ method, url, payload, auth, headers });
  }

  inject({ method, url, payload, auth, headers }) {
    return this.hapiServer.inject({ method, url, payload, auth, headers });
  }

}

module.exports = HttpTestServer;
