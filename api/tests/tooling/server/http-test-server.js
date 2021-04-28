const Hapi = require('@hapi/hapi');

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
 *   httpTestServer = new HttpTestServer();
 *   await httpTestServer.register(moduleUnderTest);
 * });
 */
class HttpTestServer {

  constructor() {
    this.hapiServer = Hapi.server(routesConfig);
    this._setupErrorHandling();
  }

  async register(moduleUnderTest) {
    await this.hapiServer.register(moduleUnderTest);
  }

  _setupErrorHandling() {
    this.hapiServer.ext('onPreResponse', preResponseUtils.handleDomainAndHttpErrors);
  }

  request(method, url, payload, auth, headers) {
    return this.hapiServer.inject({ method, url, payload, auth, headers });
  }

  requestObject({ method, url, payload, auth, headers }) {
    return this.hapiServer.inject({ method, url, payload, auth, headers });
  }

}

module.exports = HttpTestServer;
