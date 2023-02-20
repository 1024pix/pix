import Hapi from '@hapi/hapi';
import preResponseUtils from '../../../lib/application/pre-response-utils';
import { handleFailAction } from '../../../lib/validate';
import authentication from '../../../lib/infrastructure/authentication';

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
 *   sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, reply) => reply(true));
 *   httpTestServer = new HttpTestServer();
 *   await httpTestServer.register(moduleUnderTest);
 * });
 */
class HttpTestServer {
  constructor({ mustThrowOn5XXError = true } = {}) {
    this.hapiServer = Hapi.server(routesConfig);
    this._mustThrow5XXOnError = mustThrowOn5XXError;
    this._setupErrorHandling();
  }

  async register(moduleUnderTest) {
    await this.hapiServer.register(moduleUnderTest);
  }

  _setupErrorHandling() {
    this.hapiServer.ext('onPreResponse', preResponseUtils.handleDomainAndHttpErrors);
  }

  async request(method, url, payload, auth, headers) {
    const result = await this.hapiServer.inject({ method, url, payload, auth, headers });

    if (this._mustThrowOn5XXError && result.statusCode >= 500) {
      throw new Error('Request Failed');
    }

    return result;
  }

  requestObject({ method, url, payload, auth, headers }) {
    return this.request(method, url, payload, auth, headers);
  }

  setupAuthentication() {
    this.hapiServer.auth.scheme(authentication.schemeName, authentication.scheme);
    authentication.strategies.forEach((strategy) =>
      this.hapiServer.auth.strategy(strategy.name, authentication.schemeName, strategy.configuration)
    );
    this.hapiServer.auth.default(authentication.defaultStrategy);
  }
}

export default HttpTestServer;
