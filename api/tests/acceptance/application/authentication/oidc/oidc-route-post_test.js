const { expect, databaseBuilder } = require('../../../../test-helper');
const createServer = require('../../../../../server');
const jsonwebtoken = require('jsonwebtoken');
const authenticationSessionService = require('../../../../../lib/domain/services/authentication/authentication-session-service');
const { featureToggles } = require('../../../../../lib/config');

describe('Acceptance | Application | Oidc | Routes', function () {
  describe('POST /api/oidc/user/check-reconciliation', function () {
    let server;

    beforeEach(async function () {
      server = await createServer();
      featureToggles.isSsoAccountReconciliationEnabled = true;
    });

    afterEach(async function () {
      featureToggles.isSsoAccountReconciliationEnabled = false;
    });

    context('when user has no oidc authentication method', function () {
      it('should return 200 HTTP status', async function () {
        // given
        databaseBuilder.factory.buildUser.withRawPassword({ email: 'eva.poree@example.net', rawPassword: 'pix123' });
        await databaseBuilder.commit();

        const idToken = jsonwebtoken.sign(
          {
            given_name: 'Brice',
            family_name: 'Glace',
            nonce: 'nonce',
            sub: 'some-user-unique-id',
          },
          'secret'
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
                'identity-provider': 'CNAV',
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

    context('when user has an oidc authentication method', function () {
      it('should return access token with 200 HTTP status', async function () {
        // given
        const user = databaseBuilder.factory.buildUser.withRawPassword({
          email: 'eva.poree@example.net',
          rawPassword: 'pix123',
        });
        databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
          identityProvider: 'CNAV',
          userId: user.id,
          externalIdentifier: 'some-user-unique-id',
        });
        await databaseBuilder.commit();

        const idToken = jsonwebtoken.sign(
          {
            given_name: 'Brice',
            family_name: 'Glace',
            nonce: 'nonce',
            sub: 'some-user-unique-id',
          },
          'secret'
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
                'identity-provider': 'CNAV',
                'authentication-key': userAuthenticationKey,
              },
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes['access-token']).to.exist;
      });

      context('when identity provider is POLE_EMPLOI', function () {
        it('should return logout url uuid with 200 HTTP status', async function () {
          // given
          const user = databaseBuilder.factory.buildUser.withRawPassword({
            email: 'eva.poree@example.net',
            rawPassword: 'pix123',
          });
          databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
            userId: user.id,
            externalIdentifier: 'some-user-unique-id',
          });
          await databaseBuilder.commit();

          const idToken = jsonwebtoken.sign(
            {
              given_name: 'Brice',
              family_name: 'Glace',
              nonce: 'nonce',
              sub: 'some-user-unique-id',
            },
            'secret'
          );
          const userAuthenticationKey = await authenticationSessionService.save({
            sessionContent: { idToken, accessToken: 'accessToken', refreshToken: 'refreshToken' },
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
                  'identity-provider': 'POLE_EMPLOI',
                  'authentication-key': userAuthenticationKey,
                },
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.data.attributes['access-token']).to.exist;
          expect(response.result.data.attributes['logout-url-uuid']).to.exist;
        });
      });
    });
  });
});
