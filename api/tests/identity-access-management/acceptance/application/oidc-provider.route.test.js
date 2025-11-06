import querystring from 'node:querystring';

import jsonwebtoken from 'jsonwebtoken';

import { authenticationSessionService } from '../../../../src/identity-access-management/domain/services/authentication-session.service.js';
import { AuthenticationSessionContent } from '../../../../src/shared/domain/models/AuthenticationSessionContent.js';
import { tokenService } from '../../../../src/shared/domain/services/token-service.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  knex,
} from '../../../test-helper.js';
import { createMockedTestOidcProvider } from '../../../tooling/openid-client/openid-client-mocks.js';

const UUID_PATTERN = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);

describe('Acceptance | Identity Access Management | Application | Route | oidc-provider', function () {
  let server, openIdClientMock;

  describe('GET /api/oidc/identity-providers', function () {
    beforeEach(async function () {
      await createServerWithMockedTestOidcProvider({ application: 'app', applicationTld: '.org' });
    });

    it('returns the list of all oidc providers with an HTTP status code 200', async function () {
      // given
      const options = {
        method: 'GET',
        url: '/api/oidc/identity-providers',
        headers: {
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'app.dev.pix.org',
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal([
        {
          type: 'oidc-identity-providers',
          id: 'oidc-example-net',
          attributes: {
            code: 'OIDC_EXAMPLE_NET',
            'organization-name': 'OIDC Example',
            slug: 'oidc-example-net',
            'should-close-session': true,
            source: 'oidcexamplenet',
            'is-visible': true,
          },
        },
      ]);
    });
  });

  describe('GET /api/oidc/redirect-logout-url', function () {
    beforeEach(async function () {
      await createServerWithMockedTestOidcProvider({ application: 'app', applicationTld: '.org' });
    });

    it('returns an object which contains the redirect logout url with an HTTP status code 200', async function () {
      // given
      const options = {
        method: 'GET',
        url: '/api/oidc/redirect-logout-url?identity_provider=OIDC_EXAMPLE_NET&logout_url_uuid=86e1338f-304c-41a8-9472-89fe1b9748a1',
        headers: generateAuthenticatedUserRequestHeaders(),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.redirectLogoutUrl).to.equal(
        'https://oidc.example.net/ea5ac20c-5076-4806-860a-b0aeb01645d4/oauth2/v2.0/logout?client_id=client',
      );
    });
  });

  describe('GET /api/oidc/authorization-url', function () {
    beforeEach(async function () {
      await createServerWithMockedTestOidcProvider({ application: 'app', applicationTld: '.org' });
    });

    it('returns an object which contains the authentication url with an HTTP status code 200', async function () {
      // given
      const query = querystring.stringify({ identity_provider: 'OIDC_EXAMPLE_NET' });

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/oidc/authorization-url?${query}`,
        headers: {
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'app.dev.pix.org',
        },
      });

      // then
      expect(response.statusCode).to.equal(200);

      const redirectTargetUrl = new URL(response.result.redirectTarget);

      expect(redirectTargetUrl.origin).to.equal('https://oidc.example.net');
      expect(redirectTargetUrl.pathname).to.equal('/ea5ac20c-5076-4806-860a-b0aeb01645d4/oauth2/v2.0/authorize');
      expect(redirectTargetUrl.searchParams.get('redirect_uri')).to.equal(
        'https://app.dev.pix.org/connexion/oidc-example-net',
      );
      expect(redirectTargetUrl.searchParams.get('client_id')).to.equal('client');
      expect(redirectTargetUrl.searchParams.get('response_type')).to.equal('code');
      expect(redirectTargetUrl.searchParams.get('scope')).to.equal('openid profile');
    });
  });

  describe('POST /api/oidc/token', function () {
    let payload, cookies;

    context('when requestedApplication is generic (i.e. is not admin)', function () {
      beforeEach(async function () {
        await createServerWithMockedTestOidcProvider({ application: 'app', applicationTld: '.org' });

        const query = querystring.stringify({ identity_provider: 'OIDC_EXAMPLE_NET' });
        const authUrlResponse = await server.inject({
          method: 'GET',
          url: `/api/oidc/authorization-url?${query}`,
          headers: {
            'x-forwarded-proto': 'https',
            'x-forwarded-host': 'app.dev.pix.org',
          },
        });
        cookies = authUrlResponse.headers['set-cookie'];

        const redirectTarget = new URL(authUrlResponse.result.redirectTarget);

        payload = {
          data: {
            attributes: {
              identity_provider: 'OIDC_EXAMPLE_NET',
              code: 'code',
              state: redirectTarget.searchParams.get('state'),
            },
          },
        };
      });

      context('When user does not have an account', function () {
        it('returns status code 401 with authentication key matching session content and error code to validate cgu', async function () {
          // given
          const idToken = jsonwebtoken.sign({ given_name: 'John', family_name: 'Doe', sub: 'sub' }, 'secret');

          openIdClientMock.authorizationCodeGrant.resolves({
            access_token: 'access_token',
            id_token: idToken,
            expires_in: 60,
            refresh_token: 'refresh_token',
          });

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/oidc/token',
            headers: {
              cookie: cookies[0],
              'x-forwarded-proto': 'https',
              'x-forwarded-host': 'app.dev.pix.org',
            },
            payload,
          });

          // then
          const [error] = response.result.errors;
          expect(response.statusCode).to.equal(401);
          expect(error.code).to.exist;
          expect(error.code).to.equal('SHOULD_VALIDATE_CGU');

          const authenticationKey = error.meta.authenticationKey;
          expect(authenticationKey).to.exist;

          const result = await authenticationSessionService.getByKey(authenticationKey);
          expect(result).to.deep.equal({
            sessionContent: new AuthenticationSessionContent({
              accessToken: 'access_token',
              idToken,
              expiresIn: 60,
              refreshToken: 'refresh_token',
            }),
            userInfo: {
              externalIdentityId: 'sub',
              firstName: 'John',
              lastName: 'Doe',
            },
          });
        });
      });

      context('When user has an account', function () {
        it('returns 200 with access_token and logout_url_uuid', async function () {
          // given
          const firstName = 'John';
          const lastName = 'Doe';
          const externalIdentifier = 'sub';

          const userId = databaseBuilder.factory.buildUser({ firstName, lastName }).id;
          databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
            identityProvider: 'OIDC_EXAMPLE_NET',
            externalIdentifier,
            userId,
          });
          await databaseBuilder.commit();

          const idToken = jsonwebtoken.sign(
            { given_name: firstName, family_name: lastName, sub: externalIdentifier },
            'secret',
          );

          openIdClientMock.authorizationCodeGrant.resolves({
            access_token: 'access_token',
            id_token: idToken,
            expires_in: 60,
            refresh_token: 'refresh_token',
          });

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/oidc/token',
            headers: {
              cookie: cookies[0],
              'x-forwarded-proto': 'https',
              'x-forwarded-host': 'app.pix.org',
            },
            payload,
          });

          // then
          expect(openIdClientMock.authorizationCodeGrant).to.have.been.calledOnce;
          expect(response.result.access_token).to.exist;

          const decodedAccessToken = tokenService.getDecodedToken(response.result.access_token);
          expect(decodedAccessToken).to.include({ aud: 'https://app.pix.org' });
          expect(response.statusCode).to.equal(200);
          expect(response.result['logout_url_uuid']).to.match(UUID_PATTERN);
        });
      });
    });

    context('when requestedApplication is admin', function () {
      beforeEach(async function () {
        await createServerWithMockedTestOidcProvider({ application: 'admin', applicationTld: '.fr' });

        const query = querystring.stringify({ identity_provider: 'OIDC_EXAMPLE_NET' });
        const authUrlResponse = await server.inject({
          method: 'GET',
          url: `/api/oidc/authorization-url?${query}`,
          headers: {
            'x-forwarded-proto': 'https',
            'x-forwarded-host': 'admin.pix.fr',
          },
        });
        cookies = authUrlResponse.headers['set-cookie'];

        const redirectTarget = new URL(authUrlResponse.result.redirectTarget);

        payload = {
          data: {
            attributes: {
              identity_provider: 'OIDC_EXAMPLE_NET',
              code: 'code',
              state: redirectTarget.searchParams.get('state'),
            },
          },
        };
      });

      context('when user does not have an admin role', function () {
        it('returns 403', async function () {
          // given
          const firstName = 'John';
          const lastName = 'Doe';
          const externalIdentifier = 'sub';

          const userId = databaseBuilder.factory.buildUser({ firstName, lastName }).id;
          databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
            identityProvider: 'OIDC_EXAMPLE_NET',
            externalIdentifier,
            userId,
          });
          await databaseBuilder.commit();

          const idToken = jsonwebtoken.sign(
            { given_name: firstName, family_name: lastName, sub: externalIdentifier },
            'secret',
          );

          openIdClientMock.authorizationCodeGrant.resolves({
            access_token: 'access_token',
            id_token: idToken,
            expires_in: 60,
            refresh_token: 'refresh_token',
          });

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/oidc/token',
            headers: {
              cookie: cookies[0],
              'x-forwarded-proto': 'https',
              'x-forwarded-host': 'admin.pix.fr',
            },
            payload,
          });

          // then
          expect(openIdClientMock.authorizationCodeGrant).to.have.been.calledOnce;
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when user has an admin role', function () {
        it('returns 200', async function () {
          // given
          const firstName = 'John';
          const lastName = 'Doe';
          const externalIdentifier = 'sub';

          const userId = databaseBuilder.factory.buildUser.withRole({ firstName, lastName, role: 'SUPER_ADMIN' }).id;
          databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
            identityProvider: 'OIDC_EXAMPLE_NET',
            externalIdentifier,
            userId,
          });
          await databaseBuilder.commit();

          const idToken = jsonwebtoken.sign(
            { given_name: firstName, family_name: lastName, sub: externalIdentifier },
            'secret',
          );

          openIdClientMock.authorizationCodeGrant.resolves({
            access_token: 'access_token',
            id_token: idToken,
            expires_in: 60,
            refresh_token: 'refresh_token',
          });

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/oidc/token',
            headers: {
              cookie: cookies[0],
              'x-forwarded-proto': 'https',
              'x-forwarded-host': 'admin.pix.fr',
            },
            payload,
          });

          // then
          expect(openIdClientMock.authorizationCodeGrant).to.have.been.calledOnce;
          expect(response.result.access_token).to.exist;

          const decodedAccessToken = tokenService.getDecodedToken(response.result.access_token);
          expect(decodedAccessToken).to.include({ aud: 'https://admin.pix.fr' });
          expect(response.statusCode).to.equal(200);
        });
      });
    });
  });

  describe('POST /api/oidc/users', function () {
    beforeEach(async function () {
      await createServerWithMockedTestOidcProvider({ application: 'app', applicationTld: '.org' });
    });

    it('returns an accessToken with a 200 HTTP status code', async function () {
      // given
      const firstName = 'Brice';
      const lastName = 'Glace';
      const externalIdentifier = 'sub';
      const idToken = jsonwebtoken.sign(
        { given_name: firstName, family_name: lastName, nonce: 'nonce', sub: externalIdentifier },
        'secret',
      );

      const sessionContent = new AuthenticationSessionContent({ idToken });
      const userAuthenticationKey = await authenticationSessionService.save({
        sessionContent,
        userInfo: {
          firstName,
          lastName,
          nonce: 'nonce',
          externalIdentityId: externalIdentifier,
        },
      });

      const request = {
        method: 'POST',
        url: '/api/oidc/users',
        headers: {
          cookie: 'locale=fr-FR',
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'app.dev.pix.org',
        },
        payload: {
          data: {
            attributes: {
              identity_provider: 'OIDC_EXAMPLE_NET',
              authentication_key: userAuthenticationKey,
            },
          },
        },
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.access_token).to.exist;
      const decodedAccessToken = tokenService.getDecodedToken(response.result.access_token);
      expect(decodedAccessToken).to.include({ aud: 'https://app.dev.pix.org' });

      const createdUser = await knex('users').first();
      expect(createdUser.firstName).to.equal('Brice');
      expect(createdUser.lastName).to.equal('Glace');
      expect(createdUser.locale).to.equal('fr-FR');

      const createdAuthenticationMethod = await knex('authentication-methods').first();
      expect(createdAuthenticationMethod.externalIdentifier).to.equal('sub');
    });

    context('when authentication key has expired', function () {
      it('returns a 401 HTTP status code', async function () {
        // given
        const userAuthenticationKey = 'authentication_expired';

        const request = {
          method: 'POST',
          url: '/api/oidc/users',
          headers: generateAuthenticatedUserRequestHeaders(),
          payload: {
            data: {
              attributes: {
                identity_provider: 'OIDC_EXAMPLE_NET',
                authentication_key: userAuthenticationKey,
              },
            },
          },
        };

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.result.errors[0].detail).to.equal('This authentication key has expired.');
      });
    });
  });

  describe('POST /api/oidc/user/check-reconciliation', function () {
    beforeEach(async function () {
      await createServerWithMockedTestOidcProvider({ application: 'app', applicationTld: '.org' });
    });

    context('when user has no oidc authentication method', function () {
      it('returns 200 HTTP status', async function () {
        // given
        const server = await createServer();
        databaseBuilder.factory.buildUser.withRawPassword({ email: 'eva.poree@example.net', rawPassword: 'pix123' });
        await databaseBuilder.commit();

        const idToken = jsonwebtoken.sign(
          { given_name: 'Brice', family_name: 'Glace', nonce: 'nonce', sub: 'some-user-unique-id' },
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
        const response = await server.inject({
          method: 'POST',
          url: `/api/oidc/user/check-reconciliation`,
          payload: {
            data: {
              attributes: {
                email: 'eva.poree@example.net',
                password: 'pix123',
                'identity-provider': 'OIDC_EXAMPLE_NET',
                'authentication-key': userAuthenticationKey,
              },
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes['full-name-from-pix']).to.exist;
        expect(response.result.data.attributes['full-name-from-external-identity-provider']).to.exist;
        expect(response.result.data.attributes['email']).to.exist;
        expect(response.result.data.attributes['authentication-methods']).to.exist;
      });
    });
  });

  describe('POST /api/oidc/user/reconcile', function () {
    beforeEach(async function () {
      await createServerWithMockedTestOidcProvider({ application: 'app', applicationTld: '.org' });
    });

    it('returns 200 HTTP status code', async function () {
      // given
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        email: 'eva.poree@example.net',
        rawPassword: 'pix123',
      });
      await databaseBuilder.commit();

      const idToken = jsonwebtoken.sign(
        { given_name: 'Brice', family_name: 'Glace', nonce: 'nonce', sub: 'some-user-unique-id' },
        'secret',
      );
      const userAuthenticationKey = await authenticationSessionService.save({
        sessionContent: { idToken },
        userInfo: {
          userId: user.id,
          firstName: 'Brice',
          lastName: 'Glace',
          nonce: 'nonce',
          externalIdentityId: 'some-user-unique-id',
        },
      });

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/oidc/user/reconcile`,
        headers: {
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'app.dev.pix.org',
        },
        payload: {
          data: {
            attributes: {
              identity_provider: 'OIDC_EXAMPLE_NET',
              authentication_key: userAuthenticationKey,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.access_token).to.exist;

      const decodedAccessToken = tokenService.getDecodedToken(response.result.access_token);
      expect(decodedAccessToken).to.include({ aud: 'https://app.dev.pix.org' });
      expect(response.result['logout_url_uuid']).to.match(UUID_PATTERN);
    });
  });

  async function createServerWithMockedTestOidcProvider({ application, applicationTld }) {
    openIdClientMock = await createMockedTestOidcProvider({ application, applicationTld });
    server = await createServer();
  }
});
