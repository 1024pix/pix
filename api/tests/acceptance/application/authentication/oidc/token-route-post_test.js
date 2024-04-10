import querystring from 'node:querystring';

import jsonwebtoken from 'jsonwebtoken';

import { AuthenticationSessionContent } from '../../../../../lib/domain/models/AuthenticationSessionContent.js';
import * as authenticationSessionService from '../../../../../lib/domain/services/authentication/authentication-session-service.js';
import { oidcAuthenticationServiceRegistry } from '../../../../../lib/domain/services/authentication/oidc-authentication-service-registry.js';
import { createServer, databaseBuilder, expect, sinon } from '../../../../test-helper.js';

const uuidPattern = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);

describe('Acceptance | Route | oidc | token', function () {
  describe('POST /api/oidc/token', function () {
    let server, clock, payload, cookies, oidcExampleNetProvider;

    beforeEach(async function () {
      server = await createServer();
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
      it('should return status code 401 with authentication key matching session content and error code to validate cgu', async function () {
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
        expect(response.result['logout_url_uuid']).to.match(uuidPattern);
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
});
