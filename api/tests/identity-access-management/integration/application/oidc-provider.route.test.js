import jsonwebtoken from 'jsonwebtoken';
import sinon from 'sinon';

import { oidcProviderController } from '../../../../src/identity-access-management/application/oidc-provider/oidc-provider.controller.js';
import { identityAccessManagementRoutes } from '../../../../src/identity-access-management/application/routes.js';
import {
  AuthenticationKeyExpired,
  DifferentExternalIdentifierError,
} from '../../../../src/identity-access-management/domain/errors.js';
import { authenticationSessionService } from '../../../../src/identity-access-management/domain/services/authentication-session.service.js';
import {
  oidcAuthenticationServiceRegistry,
  usecases,
} from '../../../../src/identity-access-management/domain/usecases/index.js';
import { UserNotFoundError } from '../../../../src/shared/domain/errors.js';
import * as serverSideCookieSession from '../../../../src/shared/infrastructure/plugins/yar.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { createMockedTestOidcProviders } from '../../../tooling/mocks/openid-client.mock.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

const routesUnderTest = identityAccessManagementRoutes[0];

describe('Integration | Identity Access Management | Application | Route | oidc-provider', function () {
  let httpTestServer;

  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    httpTestServer.setupDeserialization();
    httpTestServer.setupAuthentication();
    await httpTestServer.register(serverSideCookieSession);
    await httpTestServer.register(routesUnderTest);
  });

  describe('GET /api/oidc/identity-providers', function () {
    it('can be used to not share cache between different applications with form /api/oidc/identity-providers/XXX', async function () {
      // given
      const oidcProvider1Properties = {
        application: 'orga',
        applicationTld: '.org',
        enabled: true,
        accessTokenLifespan: '7d',
        clientId: 'client',
        clientSecret: 'plainTextSecret',
        shouldCloseSession: true,
        identityProvider: 'OIDC_PROVIDER_FOR_OIDC_IDENTITY_PROVIDERS-1',
        openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
        organizationName: 'OIDC Example',
        redirectUri: 'https://orga.dev.pix.org/connexion/oidc-example-net',
        scope: 'openid profile',
        slug: 'oidc-example-net',
        source: 'oidcexamplenet',
      };
      await databaseBuilder.factory.buildOidcProvider(oidcProvider1Properties);

      const oidcProvider2Properties = {
        application: 'orga',
        applicationTld: '.fr',
        enabled: true,
        accessTokenLifespan: '7d',
        clientId: 'client',
        clientSecret: 'plainTextSecret',
        shouldCloseSession: true,
        identityProvider: 'OIDC_IDENTITY_PROVIDERS-2',
        openidConfigurationUrl: 'https://oidc.example.net/.well-known/openid-configuration',
        organizationName: 'OIDC Example',
        redirectUri: 'https://orga.dev.pix.fr/connexion/oidc-example-net',
        scope: 'openid profile',
        slug: 'oidc-example-net',
        source: 'oidcexamplenet',
      };
      await databaseBuilder.factory.buildOidcProvider(oidcProvider2Properties);

      await databaseBuilder.commit();

      await oidcAuthenticationServiceRegistry.testOnly_reset();

      // when
      const headers1 = { 'x-forwarded-proto': 'https', 'x-forwarded-host': 'orga.dev.pix.org' };
      const response1 = await httpTestServer.request('GET', '/api/oidc/identity-providers', null, null, headers1);

      const headers2 = { 'x-forwarded-proto': 'https', 'x-forwarded-host': 'orga.dev.pix.org' };
      const response2 = await httpTestServer.request('GET', '/api/oidc/identity-providers/org', null, null, headers2);

      // then
      expect(response2.statusCode).to.deep.equal(response1.statusCode);
      expect(response2.result.data).to.deep.equal(response1.result.data);
    });

    context('when an unexpected error occurs', function () {
      it('does not break and returns an empty array', async function () {
        // given
        const headers = { 'x-forwarded-proto': 'https', 'x-forwarded-host': 'orga.dev.pix.org' };

        const error = new Error('BOOM!');
        sinon.stub(usecases, 'getIdentityProvidersByRequestedApplication').rejects(error);

        // when
        const response = await httpTestServer.request('GET', '/api/oidc/identity-providers', null, null, headers);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({ data: [] });
      });
    });
  });

  describe('POST /api/oidc/token', function () {
    context('when state is missing in session', function () {
      it('returns a BadRequestError', async function () {
        // given
        const headers = { 'x-forwarded-proto': 'https', 'x-forwarded-host': 'orga.dev.pix.org' };
        const payload = {
          data: {
            attributes: {
              identity_provider: 'OIDC_EXAMPLE_NET',
              code: 'some code',
              state: 'some state',
            },
          },
        };

        // when
        const response = await httpTestServer.request('POST', '/api/oidc/token', payload, null, headers);

        // then
        expect(response.statusCode).to.equal(400);
        expect(response.result.errors[0].code).to.equal('MISSING_OIDC_STATE');
        expect(response.result.errors[0].detail).to.equal('Required "state" is missing in session');
      });
    });
  });

  describe('POST /api/oidc/user/check-reconciliation', function () {
    context('when user is not found', function () {
      it('returns a response with HTTP status code 404', async function () {
        // given
        sinon.stub(oidcProviderController, 'findUserForReconciliation').rejects(new UserNotFoundError());

        // when
        const response = await httpTestServer.request('POST', '/api/oidc/user/check-reconciliation', {
          data: {
            attributes: {
              email: 'eva.poree@example.net',
              password: 'pix123',
              'identity-provider': 'POLE_EMPLOI',
              'authentication-key': '123abc',
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(404);
        expect(response.result.errors[0].detail).to.equal('Ce compte est introuvable.');
      });
    });

    context('when user is blocked', function () {
      it('returns 403', async function () {
        // given
        const email = 'i.am.blocked@example.net';
        const password = 'pix123';
        const userId = databaseBuilder.factory.buildUser.withRawPassword({ email, rawPassword: password }).id;
        databaseBuilder.factory.buildUserLogin({ userId, failureCount: 50, blockedAt: new Date() });
        await databaseBuilder.commit();

        const idToken = jsonwebtoken.sign(
          {
            given_name: 'Brice',
            family_name: 'Glace',
            nonce: 'nonce',
            sub: 'some-user-unique-id',
          },
          'secret',
        );
        const userAuthenticationKey = await authenticationSessionService.save({
          sessionContent: { idToken },
          userInfo: {
            firstName: 'Brice',
            lastName: 'Glace',
            nonce: 'nonce',
            externalIdentityId: 'some-user-unique-id',
          },
        });

        // when
        const response = await httpTestServer.request('POST', '/api/oidc/user/check-reconciliation', {
          data: {
            attributes: {
              email,
              password,
              'identity-provider': 'OIDC_EXAMPLE_NET',
              'authentication-key': userAuthenticationKey,
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when authentication key expired', function () {
      it('returns a response with HTTP status code 401', async function () {
        // given
        sinon.stub(oidcProviderController, 'findUserForReconciliation').rejects(new AuthenticationKeyExpired());

        // when
        const response = await httpTestServer.request('POST', '/api/oidc/user/check-reconciliation', {
          data: {
            attributes: {
              email: 'eva.poree@example.net',
              password: 'pix123',
              'identity-provider': 'POLE_EMPLOI',
              'authentication-key': '123abc',
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.result.errors[0].detail).to.equal('This authentication key has expired.');
      });
    });

    context('when external identity id and external identifier are different', function () {
      it('returns a response with HTTP status code 412', async function () {
        // given
        sinon.stub(oidcProviderController, 'findUserForReconciliation').rejects(new DifferentExternalIdentifierError());

        // when
        const response = await httpTestServer.request('POST', '/api/oidc/user/check-reconciliation', {
          data: {
            attributes: {
              email: 'eva.poree@example.net',
              password: 'pix123',
              'identity-provider': 'POLE_EMPLOI',
              'authentication-key': '123abc',
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(409);
        expect(response.result.errors[0].detail).to.equal(
          "La valeur de l'externalIdentifier de la méthode de connexion ne correspond pas à celui reçu par le partenaire.",
        );
      });
    });
  });

  describe('POST /api/oidc/logout', function () {
    context('when the url UUID is invalid', function () {
      it(`returns an error and does not revoke tokens`, async function () {
        // given
        const headers = generateAuthenticatedUserRequestHeaders({ userId: 1234, audience: 'https://orga.pix.org' });
        //const auth = { credentials: { userId: 1234 }, strategy: {} };
        const payload = {
          identity_provider: 'OIDC_LOGOUT_EXAMPLE_NET',
          logout_url_uuid: 'invalid',
        };

        const identityProvider = 'OIDC_LOGOUT_EXAMPLE_NET';
        const [openIdClientMock] = await createMockedTestOidcProviders([
          {
            application: 'orga',
            applicationTld: '.org',
            identityProvider,
          },
        ]);

        openIdClientMock.buildEndSessionUrl.throws(new Error('Client Error: Wrong token hint'));

        // when
        const response = await httpTestServer.request('POST', '/api/oidc/logout', payload, null, headers);

        // then
        expect(response.statusCode).to.equal(422);
        expect(response.result.errors[0].code).to.equal('OIDC_GENERIC_ERROR');
      });
    });
  });
});
