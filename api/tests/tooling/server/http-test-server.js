import Hapi from '@hapi/hapi';
import Qs from 'qs';

import { setupErrorHandling } from '../../../config/server-setup-error-handling.js';
import { authentication } from '../../../lib/infrastructure/authentication.js';
import { handleFailAction } from '../../../lib/validate.js';
import { deserializer } from '../../../src/shared/infrastructure/serializers/jsonapi/deserializer.js';

const routesConfig = {
  routes: {
    validate: {
      failAction: handleFailAction,
    },
  },
  query: {
    parser: (query) => Qs.parse(query),
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
    setupErrorHandling(this.hapiServer);
  }

  async register(moduleUnderTest) {
    await this.hapiServer.register(moduleUnderTest);
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
      this.hapiServer.auth.strategy(strategy.name, authentication.schemeName, strategy.configuration),
    );
    this.hapiServer.auth.default(authentication.defaultStrategy);
  }

  setupDeserialization() {
    this.hapiServer.ext('onPreHandler', async (request, h) => {
      if (request.payload?.data) {
        request.deserializedPayload = await deserializer.deserialize(request.payload);
      }
      return h.continue;
    });
  }
}

export { HttpTestServer };
