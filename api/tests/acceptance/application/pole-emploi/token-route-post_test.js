const querystring = require('querystring');
const jsonwebtoken = require('jsonwebtoken');
const {
  expect,
  databaseBuilder,
  knex,
  nock,
  sinon,
  generateValidRequestAuthorizationHeader,
} = require('../../../test-helper');

const createServer = require('../../../../server');
const settings = require('../../../../lib/config');
const moment = require('moment');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const AuthenticationSessionContent = require('../../../../lib/domain/models/AuthenticationSessionContent');
const authenticationSessionService = require('../../../../lib/domain/services/authentication/authentication-session-service');

describe('Acceptance | Route | pole emploi token', function () {
  describe('POST /api/pole-emploi/token', function () {
    let server;
    let clock;

    beforeEach(async function () {
      server = await createServer();
      clock = sinon.useFakeTimers({
        now: Date.now(),
        toFake: ['Date'],
      });
    });

    afterEach(function () {
      clock.restore();
    });

    context('When the state sent does not match the state received', function () {
      it('should return http code 400', async function () {
        // given
        const idToken = jsonwebtoken.sign(
          {
            given_name: 'John',
            family_name: 'Doe',
            nonce: 'nonce',
            idIdentiteExterne: 'idIdentiteExterne',
          },
          'secret'
        );
        const getAccessTokenResponse = {
          access_token: 'access_token',
          id_token: idToken,
          expires_in: 60,
          refresh_token: 'refresh_token',
        };
        nock(settings.poleEmploi.tokenUrl).post('/').reply(200, getAccessTokenResponse);

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/pole-emploi/token',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          payload: querystring.stringify({
            code: 'code',
            redirect_uri: 'redirect_uri',
            state_sent: 'a_state',
            state_received: 'another_state',
          }),
        });

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('When user is not connected to Pix', function () {
      context('When user has not account', function () {
        afterEach(async function () {
          await knex('authentication-methods').delete();
          await knex('users').delete();
        });

        it('should return http code 401', async function () {
          // given
          const idToken = jsonwebtoken.sign(
            {
              given_name: 'John',
              family_name: 'Doe',
              nonce: 'nonce',
              idIdentiteExterne: 'idIdentiteExterne',
            },
            'secret'
          );

          const getAccessTokenResponse = {
            access_token: 'access_token',
            id_token: idToken,
            expires_in: 60,
            refresh_token: 'refresh_token',
          };

          nock(settings.poleEmploi.tokenUrl).post('/').reply(200, getAccessTokenResponse);

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/pole-emploi/token',
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
            },
            payload: querystring.stringify({
              code: 'code',
              redirect_uri: 'redirect_uri',
              state_sent: 'state',
              state_received: 'state',
            }),
          });

          // then
          expect(response.statusCode).to.equal(401);
        });

        it('should return an authenticationKey in meta', async function () {
          // given
          const idToken = jsonwebtoken.sign(
            {
              given_name: 'John',
              family_name: 'Doe',
              nonce: 'nonce',
              idIdentiteExterne: 'idIdentiteExterne',
            },
            'secret'
          );

          const getAccessTokenResponse = {
            access_token: 'access_token',
            id_token: idToken,
            expires_in: 60,
            refresh_token: 'refresh_token',
          };

          nock(settings.poleEmploi.tokenUrl).post('/').reply(200, getAccessTokenResponse);

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/pole-emploi/token',
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
            },
            payload: querystring.stringify({
              code: 'code',
              redirect_uri: 'redirect_uri',
              state_sent: 'state',
              state_received: 'state',
            }),
          });

          // then
          expect(response.result.errors[0].meta).to.exist;
        });

        it('should return validate cgu in code', async function () {
          // given
          const idToken = jsonwebtoken.sign(
            {
              given_name: 'John',
              family_name: 'Doe',
              nonce: 'nonce',
              idIdentiteExterne: 'idIdentiteExterne',
            },
            'secret'
          );

          const getAccessTokenResponse = {
            access_token: 'access_token',
            id_token: idToken,
            expires_in: 60,
            refresh_token: 'refresh_token',
          };

          nock(settings.poleEmploi.tokenUrl).post('/').reply(200, getAccessTokenResponse);

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/pole-emploi/token',
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
            },
            payload: querystring.stringify({
              code: 'code',
              redirect_uri: 'redirect_uri',
              state_sent: 'state',
              state_received: 'state',
            }),
          });

          // then
          expect(response.result.errors[0].code).to.exist;
          expect(response.result.errors[0].code).to.equal('SHOULD_VALIDATE_CGU');
        });

        it('should return an authenticationKey in meta which match to stored pole Emploi tokens', async function () {
          // given
          const idToken = jsonwebtoken.sign(
            {
              given_name: 'John',
              family_name: 'Doe',
              nonce: 'nonce',
              idIdentiteExterne: 'idIdentiteExterne',
            },
            'secret'
          );

          const getAccessTokenResponse = {
            access_token: 'access_token',
            id_token: idToken,
            expires_in: 60,
            refresh_token: 'refresh_token',
          };

          nock(settings.poleEmploi.tokenUrl).post('/').reply(200, getAccessTokenResponse);

          const poleEmploiAuthenticationSessionContent = new AuthenticationSessionContent({
            accessToken: 'access_token',
            idToken: idToken,
            expiresIn: 60,
            refreshToken: 'refresh_token',
          });

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/pole-emploi/token',
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
            },
            payload: querystring.stringify({
              code: 'code',
              redirect_uri: 'redirect_uri',
              state_sent: 'state',
              state_received: 'state',
            }),
          });

          // then
          const key = response.result.errors[0].meta.authenticationKey;
          const result = await authenticationSessionService.getByKey(key);
          expect(result).to.deep.equal(poleEmploiAuthenticationSessionContent);
        });
      });

      context('When user and POLE EMPLOI authentication method exist', function () {
        it('should update POLE_EMPLOI authentication method authentication complement', async function () {
          // given
          const firstName = 'John';
          const lastName = 'Doe';
          const externalIdentifier = 'idIdentiteExterne';
          const idToken = jsonwebtoken.sign(
            {
              given_name: firstName,
              family_name: lastName,
              nonce: 'nonce',
              idIdentiteExterne: externalIdentifier,
            },
            'secret'
          );
          const getAccessTokenResponse = {
            access_token: 'access_token',
            id_token: idToken,
            expires_in: 60,
            refresh_token: 'refresh_token',
          };
          nock(settings.poleEmploi.tokenUrl).post('/').reply(200, getAccessTokenResponse);
          const userId = databaseBuilder.factory.buildUser({
            firstName,
            lastName,
          }).id;

          databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
            externalIdentifier,
            accessToken: 'old_access_token',
            refreshToken: 'old_refresh_token',
            expiresIn: 1000,
            userId,
          });
          await databaseBuilder.commit();

          // when
          await server.inject({
            method: 'POST',
            url: '/api/pole-emploi/token',
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
            },
            payload: querystring.stringify({
              code: 'code',
              redirect_uri: 'redirect_uri',
              state_sent: 'state',
              state_received: 'state',
            }),
          });

          // then
          const authenticationMethods = await knex('authentication-methods').where({ userId });
          expect(authenticationMethods[0].authenticationComplement.accessToken).to.equal(
            getAccessTokenResponse['access_token']
          );
          expect(authenticationMethods[0].authenticationComplement.expiredDate).to.equal(
            moment().add(getAccessTokenResponse['expires_in'], 's').toISOString()
          );
          expect(authenticationMethods[0].authenticationComplement.refreshToken).to.equal(
            getAccessTokenResponse['refresh_token']
          );
        });

        it('should return an 200 with access_token and id_token when authentication is ok', async function () {
          // given
          const firstName = 'John';
          const lastName = 'John';
          const externalIdentifier = 'idIdentiteExterne';
          const idToken = jsonwebtoken.sign(
            {
              given_name: firstName,
              family_name: lastName,
              nonce: 'nonce',
              idIdentiteExterne: externalIdentifier,
            },
            'secret'
          );
          const getAccessTokenResponse = {
            access_token: 'access_token',
            id_token: idToken,
            expires_in: 60,
            refresh_token: 'refresh_token',
          };
          const getAccessTokenRequest = nock(settings.poleEmploi.tokenUrl).post('/').reply(200, getAccessTokenResponse);
          const userId = databaseBuilder.factory.buildUser({
            firstName,
            lastName,
          }).id;

          databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
            externalIdentifier,
            accessToken: 'old_access_token',
            refreshToken: 'old_refresh_token',
            expiresIn: 1000,
            userId,
          });
          await databaseBuilder.commit();

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/pole-emploi/token',
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
            },
            payload: querystring.stringify({
              code: 'code',
              redirect_uri: 'redirect_uri',
              state_sent: 'state',
              state_received: 'state',
            }),
          });

          // then
          expect(response.statusCode).to.equal(200);
          expect(getAccessTokenRequest.isDone()).to.be.true;
          expect(response.result['access_token']).to.exist;
          expect(response.result['id_token']).to.equal(idToken);
        });
      });
    });

    context('When user is connected to Pix', function () {
      afterEach(async function () {
        await knex('authentication-methods').delete();
        await knex('users').delete();
      });

      context('When the user does not have a POLE_EMPLOI authentication method', function () {
        it('should create a POLE_EMPLOI authentication method for the authenticated user', async function () {
          // given
          const authenticatedUser = databaseBuilder.factory.buildUser();
          await databaseBuilder.commit();

          const idToken = jsonwebtoken.sign(
            {
              given_name: 'John',
              family_name: 'Doe',
              nonce: 'nonce',
              idIdentiteExterne: 'idIdentiteExterne',
            },
            'secret'
          );
          const getAccessTokenResponse = {
            access_token: 'access_token',
            id_token: idToken,
            expires_in: 60,
            refresh_token: 'refresh_token',
          };
          nock(settings.poleEmploi.tokenUrl).post('/').reply(200, getAccessTokenResponse);

          // when
          await server.inject({
            method: 'POST',
            url: '/api/pole-emploi/token',
            headers: {
              Authorization: generateValidRequestAuthorizationHeader(authenticatedUser.id),
              'content-type': 'application/x-www-form-urlencoded',
            },
            payload: querystring.stringify({
              code: 'code',
              redirect_uri: 'redirect_uri',
              state_sent: 'state',
              state_received: 'state',
            }),
          });

          // then
          const authenticationMethods = await knex('authentication-methods').where({ userId: authenticatedUser.id });
          expect(authenticationMethods[0].identityProvider).to.equal(
            AuthenticationMethod.identityProviders.POLE_EMPLOI
          );
          expect(authenticationMethods[0].externalIdentifier).to.equal('idIdentiteExterne');
          expect(authenticationMethods[0].authenticationComplement.accessToken).to.equal(
            getAccessTokenResponse['access_token']
          );
          expect(authenticationMethods[0].authenticationComplement.expiredDate).to.equal(
            moment().add(getAccessTokenResponse['expires_in'], 's').toISOString()
          );
          expect(authenticationMethods[0].authenticationComplement.refreshToken).to.equal(
            getAccessTokenResponse['refresh_token']
          );
        });

        it('should return an 200 with access_token and id_token when authentication is ok', async function () {
          // given
          const authenticatedUser = databaseBuilder.factory.buildUser();
          await databaseBuilder.commit();

          const idToken = jsonwebtoken.sign(
            {
              given_name: 'John',
              family_name: 'Doe',
              nonce: 'nonce',
              idIdentiteExterne: 'idIdentiteExterne',
            },
            'secret'
          );
          const getAccessTokenResponse = {
            access_token: 'access_token',
            id_token: idToken,
            expires_in: 60,
            refresh_token: 'refresh_token',
          };
          const getAccessTokenRequest = nock(settings.poleEmploi.tokenUrl).post('/').reply(200, getAccessTokenResponse);

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/pole-emploi/token',
            headers: {
              Authorization: generateValidRequestAuthorizationHeader(authenticatedUser.id),
              'content-type': 'application/x-www-form-urlencoded',
            },
            payload: querystring.stringify({
              code: 'code',
              redirect_uri: 'redirect_uri',
              state_sent: 'state',
              state_received: 'state',
            }),
          });

          // then
          expect(response.statusCode).to.equal(200);
          expect(getAccessTokenRequest.isDone()).to.be.true;
          expect(response.result['access_token']).to.exist;
          expect(response.result['id_token']).to.equal(idToken);
        });
      });

      context('When the user does have a POLE_EMPLOI authentication method', function () {
        it('should update POLE_EMPLOI authentication method authentication complement', async function () {
          // given
          const externalIdentifier = 'idIdentiteExterne';
          const authenticatedUser = databaseBuilder.factory.buildUser();
          databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
            externalIdentifier,
            accessToken: 'old_access_token',
            refreshToken: 'old_refresh_token',
            expiresIn: 1000,
            userId: authenticatedUser.id,
          });
          await databaseBuilder.commit();

          const idToken = jsonwebtoken.sign(
            {
              given_name: 'John',
              family_name: 'Doe',
              nonce: 'nonce',
              idIdentiteExterne: externalIdentifier,
            },
            'secret'
          );
          const getAccessTokenResponse = {
            access_token: 'access_token',
            id_token: idToken,
            expires_in: 60,
            refresh_token: 'refresh_token',
          };
          nock(settings.poleEmploi.tokenUrl).post('/').reply(200, getAccessTokenResponse);

          // when
          await server.inject({
            method: 'POST',
            url: '/api/pole-emploi/token',
            headers: {
              Authorization: generateValidRequestAuthorizationHeader(authenticatedUser.id),
              'content-type': 'application/x-www-form-urlencoded',
            },
            payload: querystring.stringify({
              code: 'code',
              redirect_uri: 'redirect_uri',
              state_sent: 'state',
              state_received: 'state',
            }),
          });

          // then
          const authenticationMethods = await knex('authentication-methods').where({ userId: authenticatedUser.id });
          expect(authenticationMethods[0].authenticationComplement.accessToken).to.equal(
            getAccessTokenResponse['access_token']
          );
          expect(authenticationMethods[0].authenticationComplement.expiredDate).to.equal(
            moment().add(getAccessTokenResponse['expires_in'], 's').toISOString()
          );
          expect(authenticationMethods[0].authenticationComplement.refreshToken).to.equal(
            getAccessTokenResponse['refresh_token']
          );
        });

        it('should return a 409 Conflict if the authenticated user is not the expected one', async function () {
          // given
          databaseBuilder.factory.buildUser();
          const otherUser = databaseBuilder.factory.buildUser();
          databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
            externalIdentifier: 'other_external_identifier',
            userId: otherUser.id,
          });
          await databaseBuilder.commit();

          const idToken = jsonwebtoken.sign(
            {
              given_name: 'John',
              family_name: 'Doe',
              nonce: 'nonce',
              idIdentiteExterne: 'idIdentiteExterne',
            },
            'secret'
          );
          const getAccessTokenResponse = {
            access_token: 'access_token',
            id_token: idToken,
            expires_in: 60,
            refresh_token: 'refresh_token',
          };
          nock(settings.poleEmploi.tokenUrl).post('/').reply(200, getAccessTokenResponse);

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/pole-emploi/token',
            headers: {
              Authorization: generateValidRequestAuthorizationHeader(otherUser.id),
              'content-type': 'application/x-www-form-urlencoded',
            },
            payload: querystring.stringify({
              code: 'code',
              redirect_uri: 'redirect_uri',
              state_sent: 'state',
              state_received: 'state',
            }),
          });

          // then
          expect(response.statusCode).to.equal(409);
        });
      });

      it('should return an 200 with access_token and id_token when authentication is ok', async function () {
        const idToken = jsonwebtoken.sign(
          {
            given_name: 'John',
            family_name: 'Doe',
            nonce: 'nonce',
            idIdentiteExterne: 'idIdentiteExterne',
          },
          'secret'
        );
        const getAccessTokenResponse = {
          access_token: 'access_token',
          id_token: idToken,
          expires_in: 60,
          refresh_token: 'refresh_token',
        };
        const getAccessTokenRequest = nock(settings.poleEmploi.tokenUrl).post('/').reply(200, getAccessTokenResponse);

        const authenticatedUser = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/pole-emploi/token',
          headers: {
            Authorization: generateValidRequestAuthorizationHeader(authenticatedUser.id),
            'content-type': 'application/x-www-form-urlencoded',
          },
          payload: querystring.stringify({
            code: 'code',
            redirect_uri: 'redirect_uri',
            state_sent: 'state',
            state_received: 'state',
          }),
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(getAccessTokenRequest.isDone()).to.be.true;
        expect(response.result['access_token']).to.exist;
        expect(response.result['id_token']).to.equal(idToken);
      });
    });

    context('When user has an invalid token', function () {
      it('should be rejected by API', async function () {
        // given
        const idToken = jsonwebtoken.sign(
          {
            given_name: 'John',
            family_name: 'Doe',
            nonce: 'nonce',
            idIdentiteExterne: 'idIdentiteExterne',
          },
          'secret'
        );
        const getAccessTokenResponse = {
          access_token: 'access_token',
          id_token: idToken,
          expires_in: 60,
          refresh_token: 'refresh_token',
        };
        nock(settings.poleEmploi.tokenUrl).post('/').reply(200, getAccessTokenResponse);

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/pole-emploi/token',
          headers: {
            Authorization: 'invalid_token',
            'content-type': 'application/x-www-form-urlencoded',
          },
          payload: querystring.stringify({
            code: 'code',
            redirect_uri: 'redirect_uri',
            state_sent: 'state',
            state_received: 'state',
          }),
        });

        // expect
        expect(response.statusCode).to.equal(401);
      });
    });

    context('When pole-emploi request fail', function () {
      it('should return HTTP 500 with error detail', async function () {
        // given
        const errorData = {
          error: 'invalid_client',
          error_description: 'Invalid authentication method for accessing this endpoint.',
        };
        nock.cleanAll();
        nock(settings.poleEmploi.tokenUrl).post('/').reply(400, errorData);

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/pole-emploi/token',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          payload: querystring.stringify({
            code: 'code',
            redirect_uri: 'redirect_uri',
            state_sent: 'state',
            state_received: 'state',
          }),
        });

        // expect
        expect(response.statusCode).to.equal(500);
        expect(response.result.errors[0].detail).to.equal(
          '{"error":"invalid_client","error_description":"Invalid authentication method for accessing this endpoint."}'
        );
      });
    });
  });
});
