const jsonwebtoken = require('jsonwebtoken');
const { expect, knex } = require('../../../../test-helper');
const authenticationSessionService = require('../../../../../lib/domain/services/authentication/authentication-session-service');
const createServer = require('../../../../../server');
const AuthenticationSessionContent = require('../../../../../lib/domain/models/AuthenticationSessionContent');
const OidcIdentityProviders = require('../../../../../lib/domain/constants/oidc-identity-providers');

describe('Acceptance | Route | oidc users', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/oidc/users', function () {
    afterEach(async function () {
      await knex('authentication-methods').delete();
      await knex('users').delete();
    });

    it('should return 200 HTTP status for oidc', async function () {
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
        'secret'
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
              identity_provider: OidcIdentityProviders.CNAV.service.code,
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
      it('should return 401 HTTP status', async function () {
        // given
        const userAuthenticationKey = 'authentication_expired';

        const request = {
          method: 'POST',
          url: '/api/oidc/users',
          payload: {
            data: {
              attributes: {
                identity_provider: OidcIdentityProviders.CNAV.service.code,
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
