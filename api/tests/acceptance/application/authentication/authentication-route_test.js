import querystring from 'node:querystring';

import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { tokenService } from '../../../../src/shared/domain/services/token-service.js';
import { createServer, databaseBuilder, expect, knex } from '../../../test-helper.js';

describe('Acceptance | Controller | authentication-controller', function () {
  describe('POST /api/token-from-external-user', function () {
    let server;

    beforeEach(async function () {
      server = await createServer();
    });

    describe('when user has a reconciled Pix account, then connect to Pix from GAR', function () {
      it('should return an 200 with accessToken', async function () {
        // given
        const password = 'Pix123';
        const userAttributes = {
          firstName: 'saml',
          lastName: 'jackson',
          samlId: 'SAMLJACKSONID',
        };
        const user = databaseBuilder.factory.buildUser.withRawPassword({
          username: 'saml.jackson1234',
          rawPassword: password,
        });
        const expectedExternalToken = tokenService.createIdTokenForUserReconciliation(userAttributes);

        const options = {
          method: 'POST',
          url: '/api/token-from-external-user',
          payload: {
            data: {
              attributes: {
                username: user.username,
                password: password,
                'external-user-token': expectedExternalToken,
                'expected-user-id': user.id,
              },
              type: 'external-user-authentication-requests',
            },
          },
        };

        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes['access-token']).to.exist;
      });

      it('should add GAR authentication method', async function () {
        // given
        const password = 'Pix123';
        const userAttributes = {
          firstName: 'saml',
          lastName: 'jackson',
          samlId: 'SAMLJACKSONID',
        };
        const user = databaseBuilder.factory.buildUser.withRawPassword({
          username: 'saml.jackson1234',
          rawPassword: password,
        });
        const expectedExternalToken = tokenService.createIdTokenForUserReconciliation(userAttributes);

        const options = {
          method: 'POST',
          url: '/api/token-from-external-user',
          payload: {
            data: {
              attributes: {
                username: user.username,
                password: password,
                'external-user-token': expectedExternalToken,
                'expected-user-id': user.id,
              },
              type: 'external-user-authentication-requests',
            },
          },
        };

        await databaseBuilder.commit();

        // when
        await server.inject(options);

        // then
        const authenticationMethods = await knex('authentication-methods').where({
          identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
          userId: user.id,
          externalIdentifier: 'SAMLJACKSONID',
        });
        expect(authenticationMethods.length).to.equal(1);
        expect(authenticationMethods[0].authenticationComplement).to.deep.equal({
          firstName: 'saml',
          lastName: 'jackson',
        });
      });
    });
  });

  describe('POST /api/application/token', function () {
    let server;
    let options;
    const OSMOSE_CLIENT_ID = 'apimOsmoseClientId';
    const OSMOSE_CLIENT_SECRET = 'apimOsmoseClientSecret';
    const SCOPE = 'organizations-certifications-result';

    beforeEach(async function () {
      server = await createServer();
      options = {
        method: 'POST',
        url: '/api/application/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      };
    });

    it('should return an 200 with accessToken when clientId, client secret and scope are registred', async function () {
      // given
      options.payload = querystring.stringify({
        grant_type: 'client_credentials',
        client_id: OSMOSE_CLIENT_ID,
        client_secret: OSMOSE_CLIENT_SECRET,
        scope: SCOPE,
      });

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);

      const result = response.result;
      expect(result.token_type).to.equal('bearer');
      expect(result.access_token).to.exist;
      expect(result.client_id).to.equal(OSMOSE_CLIENT_ID);
    });

    it('should return an 401 when clientId is not registred', async function () {
      // given
      options.payload = querystring.stringify({
        grant_type: 'client_credentials',
        client_id: 'NOT REGISTRED',
        client_secret: OSMOSE_CLIENT_SECRET,
        scope: SCOPE,
      });

      // when
      const response = await server.inject(options);

      // then
      expect(response.result.errors[0]).to.deep.equal({
        title: 'Unauthorized',
        detail: 'The client ID is invalid.',
        status: '401',
      });
    });

    it('should return an 401 when client secret is not valid', async function () {
      // given
      options.payload = querystring.stringify({
        grant_type: 'client_credentials',
        client_id: OSMOSE_CLIENT_ID,
        client_secret: 'invalid secret',
        scope: SCOPE,
      });

      // when
      const response = await server.inject(options);

      // then
      expect(response.result.errors[0]).to.deep.equal({
        title: 'Unauthorized',
        detail: 'The client secret is invalid.',
        status: '401',
      });
    });

    it('should return an 403 when scope is not allowed', async function () {
      // given
      options.payload = querystring.stringify({
        grant_type: 'client_credentials',
        client_id: OSMOSE_CLIENT_ID,
        client_secret: OSMOSE_CLIENT_SECRET,
        scope: 'invalid scope',
      });

      // when
      const response = await server.inject(options);

      // then
      expect(response.result.errors[0]).to.deep.equal({
        title: 'Forbidden',
        detail: 'The scope is not allowed.',
        status: '403',
      });
    });
  });
});
