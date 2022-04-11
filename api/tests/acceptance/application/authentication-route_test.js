const querystring = require('querystring');
const jsonwebtoken = require('jsonwebtoken');
const moment = require('moment');

const {
  expect,
  databaseBuilder,
  knex,
  sinon,
  nock,
  generateValidRequestAuthorizationHeader,
} = require('../../test-helper');

const settings = require('../../../lib/config');
const tokenService = require('../../../lib/domain/services/token-service');
const AuthenticationMethod = require('../../../lib/domain/models/AuthenticationMethod');
const PoleEmploiTokens = require('../../../lib/domain/models/PoleEmploiTokens');
const poleEmploiTokensRepository = require('../../../lib/infrastructure/repositories/pole-emploi-tokens-repository');

const createServer = require('../../../server');

describe('Acceptance | Controller | authentication-controller', function () {
  describe('POST /api/token', function () {
    const orgaRoleInDB = { id: 1, name: 'ADMIN' };

    const userEmailAddress = 'user@example.net';
    const userPassword = 'A124B2C3#!';

    let server;
    let userId;

    beforeEach(async function () {
      server = await createServer();
      userId = databaseBuilder.factory.buildUser.withRawPassword({
        email: userEmailAddress,
        rawPassword: userPassword,
        cgu: true,
      }).id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({ userId, organizationId, organizationRoleId: orgaRoleInDB.id });
      await databaseBuilder.commit();
    });

    it('should return a 200 with an access token and a refresh token when authentication is ok', async function () {
      // given / when
      const response = await server.inject({
        method: 'POST',
        url: '/api/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        payload: querystring.stringify({
          grant_type: 'password',
          username: userEmailAddress,
          password: userPassword,
          scope: 'pix-orga',
        }),
      });

      // then
      const result = response.result;
      expect(response.statusCode).to.equal(200);
      expect(result.token_type).to.equal('bearer');
      expect(result.access_token).to.exist;
      expect(result.user_id).to.equal(userId);
      expect(result.refresh_token).to.exist;
    });

    it('should return a 400 if grant type is invalid', async function () {
      // when
      const errorResponse = await server.inject({
        method: 'POST',
        url: '/api/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        payload: querystring.stringify({
          grant_type: 'appleSauce',
        }),
      });

      // then
      expect(errorResponse.statusCode).to.equal(400);
    });

    it('should return http code 401 when user should change password', async function () {
      // given
      const username = 'username123';
      const shouldChangePassword = true;

      databaseBuilder.factory.buildUser.withRawPassword({
        username,
        rawPassword: userPassword,
        cgu: true,
        shouldChangePassword,
      });

      const expectedResponseError = {
        errors: [
          {
            code: 'SHOULD_CHANGE_PASSWORD',
            detail: 'Erreur, vous devez changer votre mot de passe.',
            status: '401',
            title: 'PasswordShouldChange',
          },
        ],
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        payload: querystring.stringify({
          grant_type: 'password',
          username,
          password: userPassword,
          scope: 'pix-orga',
        }),
      });

      // then
      expect(response.statusCode).to.equal(401);
      expect(response.result).to.deep.equal(expectedResponseError);
    });

    context('when scope is pix-certif', function () {
      context('when certification center has the supervisor access enabled', function () {
        it('should return http code 200 with accessToken when authentication is ok', async function () {
          //given
          databaseBuilder.factory.buildCertificationCenter({ id: 345, isSupervisorAccessEnabled: true });
          databaseBuilder.factory.buildSession({ id: 121, certificationCenterId: 345 });
          databaseBuilder.factory.buildCertificationCandidate({ sessionId: 121 });
          databaseBuilder.factory.buildSupervisorAccess({ userId, sessionId: 121 });
          await databaseBuilder.commit();

          const options = _getOptions({ scope: 'pix-certif', username: userEmailAddress, password: userPassword });

          await databaseBuilder.commit();
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);

          const result = response.result;
          expect(result.token_type).to.equal('bearer');
          expect(result.access_token).to.exist;
          expect(result.user_id).to.equal(userId);
        });
      });

      context('when certification center does not have the supervisor access enabled', function () {
        it('should return http code 403 ', async function () {
          //given
          databaseBuilder.factory.buildUser.withRawPassword({
            email: 'email@without.mb',
            rawPassword: userPassword,
            cgu: true,
          });
          databaseBuilder.factory.buildCertificationCenter({ id: 345, isSupervisorAccessEnabled: false });
          databaseBuilder.factory.buildSession({ id: 121, certificationCenterId: 345 });
          databaseBuilder.factory.buildCertificationCandidate({ sessionId: 121 });
          databaseBuilder.factory.buildSupervisorAccess({ userId, sessionId: 121 });

          await databaseBuilder.commit();
          const options = _getOptions({ scope: 'pix-certif', username: 'email@without.mb', password: userPassword });

          // when
          const { statusCode } = await server.inject(options);

          // then
          expect(statusCode).to.equal(403);
        });
      });
    });
  });

  describe('POST /api/token-from-external-user', function () {
    let server;

    beforeEach(async function () {
      server = await createServer();
    });

    afterEach(async function () {
      await knex('authentication-methods').delete();
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
          identityProvider: AuthenticationMethod.identityProviders.GAR,
          userId: user.id,
          externalIdentifier: 'SAMLJACKSONID',
        });
        expect(authenticationMethods.length).to.equal(1);
      });
    });
  });

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

        it('should return an authenticationKey in meta which match to stored poleEmploiTokens', async function () {
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

          const poleEmploiTokens = new PoleEmploiTokens({
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
          const result = await poleEmploiTokensRepository.getByKey(key);
          expect(result).to.deep.equal(poleEmploiTokens);
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
        const idToken = jsonwebtoken.sign(
          {
            given_name: 'John',
            family_name: 'Doe',
            nonce: 'nonce',
            idIdentiteExterne: 'externalIdentifier',
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
        const errorData = {
          error: 'invalid_client',
          error_description: 'Invalid authentication method for accessing this endpoint.',
        };
        const expectedDetail = `${errorData.error} ${errorData.error_description}`;
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
        expect(response.result.errors[0].detail).to.equal(expectedDetail);
      });
    });
  });

  describe('POST /api/token/anonymous', function () {
    let server;
    let options;

    beforeEach(async function () {
      server = await createServer();
    });

    context('When is not simplified Access Campaign', function () {
      const campaignCode = 'RANDOM123';
      const lang = 'en';

      beforeEach(async function () {
        const targetProfile = databaseBuilder.factory.buildTargetProfile({ isSimplifiedAccess: false });
        databaseBuilder.factory.buildCampaign({ code: campaignCode, targetProfile });

        options = {
          method: 'POST',
          url: '/api/token/anonymous',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          payload: querystring.stringify({
            campaign_code: campaignCode,
            lang,
          }),
        };

        await databaseBuilder.commit();
      });

      it('should return an 401', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.result.errors[0].detail).to.equal("L'utilisateur ne peut pas être créé");
      });
    });

    context('When is simplified Access Campaign', function () {
      const simplifiedAccessCampaignCode = 'SIMPLIFIE';
      const firstName = '';
      const lastName = '';
      const isAnonymous = true;
      const lang = 'en';

      beforeEach(async function () {
        const targetProfileId = databaseBuilder.factory.buildTargetProfile({ isSimplifiedAccess: true }).id;
        databaseBuilder.factory.buildCampaign({ code: simplifiedAccessCampaignCode, targetProfileId });

        options = {
          method: 'POST',
          url: '/api/token/anonymous',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          payload: querystring.stringify({
            campaign_code: simplifiedAccessCampaignCode,
            lang,
          }),
        };

        await databaseBuilder.commit();
      });

      it('should return a 200 with accessToken', async function () {
        // when
        const response = await server.inject(options);
        const result = response.result;

        // then
        expect(response.statusCode).to.equal(200);

        expect(result.token_type).to.equal('bearer');
        expect(result.access_token).to.exist;
      });

      it('should create an anonymous user', async function () {
        // when
        await server.inject(options);

        // then
        const users = await knex('users').where({ firstName, lastName, isAnonymous });
        expect(users[0]).to.exist;
      });
    });
  });

  describe('POST /api/application/token', function () {
    let server;
    let options;
    const OSMOSE_CLIENT_ID = 'graviteeOsmoseClientId';
    const OSMOSE_CLIENT_SECRET = 'graviteeOsmoseClientSecret';
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

  function _getOptions({ scope, password, username }) {
    return {
      method: 'POST',
      url: '/api/token',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      payload: querystring.stringify({
        grant_type: 'password',
        username,
        password,
        scope,
      }),
    };
  }
});
