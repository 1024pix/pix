import jsonwebtoken from 'jsonwebtoken';

import { createServer } from '../../../../server.js';
import { authenticationSessionService } from '../../../../src/identity-access-management/domain/services/authentication-session.service.js';
import { tokenService } from '../../../../src/shared/domain/services/token-service.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { createMockedTestOidcProviders } from '../../../tooling/mocks/openid-client.mock.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Acceptance | Identity Access Management | Route | Admin | oidc-provider', function () {
  let server;

  describe('GET /api/admin/oidc-providers/import/template', function () {
    it('returns a 200 HTTP status code and a JSON formatted string', async function () {
      // given
      server = await createServer();

      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/admin/oidc-providers/import/template',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.be.a.string;
      expect(() => JSON.parse(response.result)).not.to.throw();
    });
  });

  describe('POST /api/admin/oidc-providers/import', function () {
    it('imports oidc providers and returns an HTTP status code 204', async function () {
      // given
      server = await createServer();

      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      await databaseBuilder.commit();

      const payload = [
        {
          application: 'orga',
          applicationTld: '.org',
          accessTokenLifespan: '7d',
          claimsToStore: 'email',
          clientId: 'client-id-aqwzsxedcrfvtgbyhnuj-ikolp',
          clientSecret: 'client-secret-azertyuiopqsdfghjklmwxcvbn',
          enabled: false,
          enabledForPixAdmin: true,
          identityProvider: 'GOOGLE-ORGA',
          openidConfigurationUrl: 'https://accounts.google.com/.well-known/openid-configuration',
          organizationName: 'Google',
          redirectUri: 'https://redirect.uri/',
          scope: 'openid profile email',
          slug: 'google',
          source: 'google',
          isVisible: true,
          connectionMethodCode: 'GOOGLE',
        },
      ];
      const options = {
        method: 'POST',
        url: '/api/admin/oidc-providers/import',
        payload,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
      const oidcProviders = await knex('oidc-providers').select();
      expect(oidcProviders).to.have.lengthOf(1);
      expect(oidcProviders[0]).to.contain({
        application: 'orga',
        applicationTld: '.org',
        accessTokenLifespan: '7d',
        claimsToStore: 'email',
        clientId: 'client-id-aqwzsxedcrfvtgbyhnuj-ikolp',
        enabled: false,
        enabledForPixAdmin: true,
        identityProvider: 'GOOGLE-ORGA',
        openidConfigurationUrl: 'https://accounts.google.com/.well-known/openid-configuration',
        organizationName: 'Google',
        redirectUri: 'https://redirect.uri/',
        scope: 'openid profile email',
        slug: 'google',
        source: 'google',
        isVisible: true,
        connectionMethodCode: 'GOOGLE',
      });
    });
  });

  describe('GET /api/admin/oidc/identity-providers', function () {
    it('returns the list of all oidc providers with an HTTP status code 200', async function () {
      // given
      await createMockedTestOidcProviders([
        {
          identityProvider: 'IDP',
          application: 'app',
          applicationTld: '.fr',
          organizationName: 'Idp',
          slug: 'idp',
          source: 'idp',
        },
        {
          identityProvider: 'IDP_ORGA',
          application: 'orga',
          applicationTld: '.fr',
          organizationName: 'Idp',
          slug: 'idp',
          connectionMethodCode: 'IDP_1',
          source: 'idp',
        },
      ]);
      server = await createServer();

      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/admin/oidc/identity-providers',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.length).to.equal(2);
      expect(response.result.data.at(0)).to.deep.equal({
        type: 'oidc-identity-providers',
        id: 'IDP',
        attributes: {
          code: 'IDP',
          application: 'app',
          'application-tld': '.fr',
          'organization-name': 'Idp',
          slug: 'idp',
          'should-close-session': true,
          source: 'idp',
          'is-visible': true,
        },
      });
      expect(response.result.data.at(1)).to.deep.equal({
        type: 'oidc-identity-providers',
        id: 'IDP_ORGA',
        attributes: {
          code: 'IDP_ORGA',
          application: 'orga',
          'application-tld': '.fr',
          'organization-name': 'Idp',
          slug: 'idp',
          'should-close-session': true,
          source: 'idp',
          'is-visible': true,
        },
      });
    });
  });

  describe('POST /api/admin/oidc/user/reconcile', function () {
    beforeEach(async function () {
      await createMockedTestOidcProviders([{ application: 'admin', applicationTld: '.fr' }]);
      server = await createServer();
    });

    it('returns an accessToken with a 200 HTTP status code', async function () {
      // given
      const start = new Date();

      const user = databaseBuilder.factory.buildUser.withRawPassword({
        email: 'eva.poree@example.net',
        rawPassword: 'pix123',
      });
      await databaseBuilder.commit();

      const idToken = jsonwebtoken.sign(
        {
          given_name: 'Brice',
          family_name: 'Glace',
          sub: 'some-user-unique-id',
        },
        'secret',
      );
      const userAuthenticationKey = await authenticationSessionService.save({
        sessionContent: { idToken },
        userInfo: {
          firstName: 'Brice',
          lastName: 'Glace',
          externalIdentityId: 'some-user-unique-id',
        },
      });

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/oidc/user/reconcile`,
        headers: {
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'admin.pix.fr',
        },
        payload: {
          data: {
            attributes: {
              identity_provider: 'OIDC_EXAMPLE_NET',
              authentication_key: userAuthenticationKey,
              email: user.email,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(200);

      const result = response.result;
      expect(result).to.have.property('access_token');

      const decodedAccessToken = tokenService.getDecodedToken(result.access_token);
      expect(decodedAccessToken).to.include({ aud: 'https://admin.pix.fr' });

      const authenticationMethods = await knex('authentication-methods');
      const createdAuthenticationMethod = authenticationMethods.find(
        (authenticationMethod) => authenticationMethod.identityProvider == 'OIDC_EXAMPLE_NET',
      );
      expect(createdAuthenticationMethod).to.exist;
      expect(createdAuthenticationMethod.externalIdentifier).to.equal('some-user-unique-id');

      const userLogin = await knex('user-logins').first();
      expect(userLogin.lastLoggedAt).to.be.greaterThanOrEqual(start);

      const lastUserApplicationConnection = await knex('last-user-application-connections').first();
      expect(lastUserApplicationConnection.application).to.equal('admin');
      expect(lastUserApplicationConnection.lastLoggedAt).to.be.greaterThanOrEqual(start);
    });
  });

  context('when the OIDC provider has a connectionMethodCode', function () {
    beforeEach(async function () {
      await createMockedTestOidcProviders([{ application: 'admin', applicationTld: '.fr' }]);
      server = await createServer();
    });

    describe('POST /api/admin/oidc/user/reconcile', function () {
      beforeEach(async function () {
        await createMockedTestOidcProviders([
          {
            application: 'admin',
            applicationTld: '.fr',
            identityProvider: 'OIDC_EXAMPLE_NET-ADMIN',
            connectionMethodCode: 'OIDC_EXAMPLE_NET',
          },
        ]);
        server = await createServer();
      });

      it('returns an accessToken with a 200 HTTP status code', async function () {
        // given
        const start = new Date();

        const user = databaseBuilder.factory.buildUser.withRawPassword({
          email: 'eva.poree@example.net',
          rawPassword: 'pix123',
        });
        await databaseBuilder.commit();

        const idToken = jsonwebtoken.sign(
          {
            given_name: 'Brice',
            family_name: 'Glace',
            sub: 'some-user-unique-id',
          },
          'secret',
        );
        const userAuthenticationKey = await authenticationSessionService.save({
          sessionContent: { idToken },
          userInfo: {
            firstName: 'Brice',
            lastName: 'Glace',
            externalIdentityId: 'some-user-unique-id',
          },
        });

        // when
        const response = await server.inject({
          method: 'POST',
          url: `/api/admin/oidc/user/reconcile`,
          headers: {
            'x-forwarded-proto': 'https',
            'x-forwarded-host': 'admin.pix.fr',
          },
          payload: {
            data: {
              attributes: {
                identity_provider: 'OIDC_EXAMPLE_NET-ADMIN',
                authentication_key: userAuthenticationKey,
                email: user.email,
              },
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(200);

        const result = response.result;
        expect(result).to.have.property('access_token');

        const decodedAccessToken = tokenService.getDecodedToken(result.access_token);
        expect(decodedAccessToken).to.include({ aud: 'https://admin.pix.fr' });

        const authenticationMethods = await knex('authentication-methods');
        const createdAuthenticationMethod = authenticationMethods.find(
          (authenticationMethod) => authenticationMethod.identityProvider == 'OIDC_EXAMPLE_NET',
        );
        expect(createdAuthenticationMethod).to.exist;
        expect(createdAuthenticationMethod.externalIdentifier).to.equal('some-user-unique-id');

        const userLogin = await knex('user-logins').first();
        expect(userLogin.lastLoggedAt).to.be.greaterThanOrEqual(start);

        const lastUserApplicationConnection = await knex('last-user-application-connections').first();
        expect(lastUserApplicationConnection.application).to.equal('admin');
        expect(lastUserApplicationConnection.lastLoggedAt).to.be.greaterThanOrEqual(start);
      });
    });
  });
});
