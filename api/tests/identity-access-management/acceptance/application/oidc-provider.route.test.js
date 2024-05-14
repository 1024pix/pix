import querystring from 'node:querystring';

import jsonwebtoken from 'jsonwebtoken';

import { AuthenticationSessionContent } from '../../../../lib/domain/models/index.js';
import { oidcAuthenticationServiceRegistry } from '../../../../lib/domain/usecases/index.js';
import { authenticationSessionService } from '../../../../src/identity-access-management/domain/services/authentication-session.service.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
  sinon,
} from '../../../test-helper.js';

const UUID_PATTERN = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);

describe('Acceptance | Identity Access Management | Application | Route | oidc-provider', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/oidc/identity-providers', function () {
    it('returns the list of all oidc providers with an HTTP status code 200', async function () {
      // given
      const options = {
        method: 'GET',
        url: '/api/oidc/identity-providers',
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
            'should-close-session': true,
            source: 'oidcexamplenet',
          },
        },
      ]);
    });
  });

  describe('GET /api/oidc/redirect-logout-url', function () {
    it('returns an object which contains the redirect logout url with an HTTP status code 200', async function () {
      // given
      const options = {
        method: 'GET',
        url: '/api/oidc/redirect-logout-url?identity_provider=OIDC_EXAMPLE_NET&logout_url_uuid=86e1338f-304c-41a8-9472-89fe1b9748a1',
        headers: { authorization: generateValidRequestAuthorizationHeader() },
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
    it('returns an object which contains the authentication url with an HTTP status code 200', async function () {
      // given
      const query = querystring.stringify({
        identity_provider: 'OIDC_EXAMPLE_NET',
        audience: 'app',
      });

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/oidc/authorization-url?${query}`,
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
    let clock, payload, cookies, oidcExampleNetProvider;

    beforeEach(async function () {
      clock = sinon.useFakeTimers({
        now: Date.now(),
        toFake: ['Date'],
      });

      const query = querystring.stringify({
        identity_provider: 'OIDC_EXAMPLE_NET',
      });
      const authUrlResponse = await server.inject({
        method: 'GET',
        url: `/api/oidc/authorization-url?${query}`,
      });
      cookies = authUrlResponse.headers['set-cookie'];

      const redirectTarget = new URL(authUrlResponse.result.redirectTarget);

      payload = {
        data: {
          attributes: {
            identity_provider: 'OIDC_EXAMPLE_NET',
            code: 'code',
            redirect_uri: 'redirect_uri',
            state: redirectTarget.searchParams.get('state'),
          },
        },
      };

      oidcExampleNetProvider = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
        identityProviderCode: 'OIDC_EXAMPLE_NET',
      });
      sinon.stub(oidcExampleNetProvider.client, 'callback');
    });

    afterEach(async function () {
      clock.restore();
    });

    context('When user does not have an account', function () {
      it('returns status code 401 with authentication key matching session content and error code to validate cgu', async function () {
        // given
        const idToken = jsonwebtoken.sign(
          {
            given_name: 'John',
            family_name: 'Doe',
            sub: 'sub',
          },
          'secret',
        );

        const getAccessTokenResponse = {
          access_token: 'access_token',
          id_token: idToken,
          expires_in: 60,
          refresh_token: 'refresh_token',
        };

        /*
        Le code ci-dessous a été commenté parce qu'on utilise un fournisseur d'identité
        non valide d'exemple et l'utilisation de nock n'est pas possible car la librairie
        openid-client tentera de valider le token reçu avec une configuration de chiffrement
        d'exemple.
         */
        //nock('https://oidc.example.net').post('/ea5ac20c-5076-4806-860a-b0aeb01645d4/oauth2/v2.0/token').reply(200, getAccessTokenResponse);
        oidcExampleNetProvider.client.callback.resolves(getAccessTokenResponse);

        const sessionContentAndUserInfo = {
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
        };

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/oidc/token',
          headers: { cookie: cookies[0] },
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
        expect(result).to.deep.equal(sessionContentAndUserInfo);
      });
    });

    context('When user has an account', function () {
      it('returns 200 with access_token and logout_url_uuid', async function () {
        // given
        const firstName = 'John';
        const lastName = 'Doe';
        const externalIdentifier = 'sub';

        const userId = databaseBuilder.factory.buildUser({
          firstName,
          lastName,
        }).id;

        databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
          identityProvider: 'OIDC_EXAMPLE_NET',
          externalIdentifier,
          accessToken: 'access_token',
          refreshToken: 'refresh_token',
          expiresIn: 1000,
          userId,
        });
        await databaseBuilder.commit();

        const idToken = jsonwebtoken.sign(
          {
            given_name: firstName,
            family_name: lastName,
            sub: externalIdentifier,
          },
          'secret',
        );
        const getAccessTokenResponse = {
          access_token: 'access_token',
          id_token: idToken,
          expires_in: 60,
          refresh_token: 'refresh_token',
        };
        /*
        Le code ci-dessous a été commenté parce qu'on utilise un fournisseur d'identité
        non valide d'exemple et l'utilisation de nock n'est pas possible car la librairie
        openid-client tentera de valider le token reçu avec une configuration de chiffrement
        d'exemple.
         */
        // const getAccessTokenRequest = nock(settings.poleEmploi.tokenUrl).post('/').reply(200, getAccessTokenResponse);
        oidcExampleNetProvider.client.callback.resolves(getAccessTokenResponse);

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/oidc/token',
          headers: { cookie: cookies[0] },
          payload,
        });

        // then
        /*
        Le code ci-dessous a été commenté parce qu'on utilise un fournisseur d'identité
        non valide d'exemple et l'utilisation de nock n'est pas possible car la librairie
        openid-client tentera de valider le token reçu avec une configuration de chiffrement
        d'exemple.
         */
        // expect(getAccessTokenRequest.isDone()).to.be.true;
        expect(oidcExampleNetProvider.client.callback).to.have.been.calledOnce;
        expect(response.statusCode).to.equal(200);
        expect(response.result['access_token']).to.exist;
        expect(response.result['logout_url_uuid']).to.match(UUID_PATTERN);
      });
    });

    context('when audience is admin', function () {
      context('when user does not have an admin role', function () {
        it('returns 403', async function () {
          // given
          const firstName = 'John';
          const lastName = 'Doe';
          const externalIdentifier = 'sub';

          payload.data.attributes.audience = 'admin';

          const userId = databaseBuilder.factory.buildUser({
            firstName,
            lastName,
          }).id;

          databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
            identityProvider: 'OIDC_EXAMPLE_NET',
            externalIdentifier,
            accessToken: 'access_token',
            refreshToken: 'refresh_token',
            expiresIn: 1000,
            userId,
          });
          await databaseBuilder.commit();

          const idToken = jsonwebtoken.sign(
            {
              given_name: firstName,
              family_name: lastName,
              sub: externalIdentifier,
            },
            'secret',
          );
          const getAccessTokenResponse = {
            access_token: 'access_token',
            id_token: idToken,
            expires_in: 60,
            refresh_token: 'refresh_token',
          };
          /*
          Le code ci-dessous a été commenté parce qu'on utilise un fournisseur d'identité
          non valide d'exemple et l'utilisation de nock n'est pas possible car la librairie
          openid-client tentera de valider le token reçu avec une configuration de chiffrement
          d'exemple.
           */
          // const getAccessTokenRequest = nock(settings.poleEmploi.tokenUrl).post('/').reply(200, getAccessTokenResponse);
          oidcExampleNetProvider.client.callback.resolves(getAccessTokenResponse);

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/oidc/token',
            headers: { cookie: cookies[0] },
            payload,
          });

          // then
          /*
          Le code ci-dessous a été commenté parce qu'on utilise un fournisseur d'identité
          non valide d'exemple et l'utilisation de nock n'est pas possible car la librairie
          openid-client tentera de valider le token reçu avec une configuration de chiffrement
          d'exemple.
           */
          // expect(getAccessTokenRequest.isDone()).to.be.true;
          expect(oidcExampleNetProvider.client.callback).to.have.been.calledOnce;
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when user has an admin role', function () {
        it('returns 200', async function () {
          // given
          const firstName = 'John';
          const lastName = 'Doe';
          const externalIdentifier = 'sub';

          payload.data.attributes.audience = 'admin';

          const userId = databaseBuilder.factory.buildUser.withRole({
            firstName,
            lastName,
            role: 'SUPER_ADMIN',
          }).id;

          databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
            identityProvider: 'OIDC_EXAMPLE_NET',
            externalIdentifier,
            accessToken: 'access_token',
            refreshToken: 'refresh_token',
            expiresIn: 1000,
            userId,
          });

          await databaseBuilder.commit();

          const idToken = jsonwebtoken.sign(
            {
              given_name: firstName,
              family_name: lastName,
              sub: externalIdentifier,
            },
            'secret',
          );
          const getAccessTokenResponse = {
            access_token: 'access_token',
            id_token: idToken,
            expires_in: 60,
            refresh_token: 'refresh_token',
          };
          /*
          Le code ci-dessous a été commenté parce qu'on utilise un fournisseur d'identité
          non valide d'exemple et l'utilisation de nock n'est pas possible car la librairie
          openid-client tentera de valider le token reçu avec une configuration de chiffrement
          d'exemple.
           */
          // const getAccessTokenRequest = nock(settings.poleEmploi.tokenUrl).post('/').reply(200, getAccessTokenResponse);
          oidcExampleNetProvider.client.callback.resolves(getAccessTokenResponse);

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/oidc/token',
            headers: { cookie: cookies[0] },
            payload,
          });

          // then
          /*
          Le code ci-dessous a été commenté parce qu'on utilise un fournisseur d'identité
          non valide d'exemple et l'utilisation de nock n'est pas possible car la librairie
          openid-client tentera de valider le token reçu avec une configuration de chiffrement
          d'exemple.
           */
          // expect(getAccessTokenRequest.isDone()).to.be.true;
          expect(oidcExampleNetProvider.client.callback).to.have.been.calledOnce;
          expect(response.statusCode).to.equal(200);
        });
      });
    });
  });

  describe('POST /api/oidc/users', function () {
    it('returns an accessToken with a 200 HTTP status code', async function () {
      // given
      const firstName = 'Brice';
      const lastName = 'Glace';
      const externalIdentifier = 'sub';
      const idToken = jsonwebtoken.sign(
        {
          given_name: firstName,
          family_name: lastName,
          nonce: 'nonce',
          sub: externalIdentifier,
        },
        'secret',
      );

      const sessionContent = new AuthenticationSessionContent({
        idToken,
      });
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
      expect(response.result['access_token']).to.exist;

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
});
