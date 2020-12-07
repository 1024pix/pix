const { expect, databaseBuilder, knex, sinon, nock, generateValidRequestAuthorizationHeader } = require('../../test-helper');
const querystring = require('querystring');
const jsonwebtoken = require('jsonwebtoken');
const settings = require('../../../lib/config');
const createServer = require('../../../server');
const tokenService = require('../../../lib/domain/services/token-service');
const moment = require('moment');

const AuthenticationMethod = require('../../../lib/domain/models/AuthenticationMethod');

describe('Acceptance | Controller | authentication-controller', () => {

  const orgaRoleInDB = { id: 1, name: 'ADMIN' };

  const userEmailAddress = 'user@example.net';
  const userPassword = 'A124B2C3#!';

  let server;
  let userId;

  beforeEach(async () => {
    server = await createServer();

    userId = databaseBuilder.factory.buildUser.withUnencryptedPassword({
      email: userEmailAddress,
      rawPassword: userPassword,
      cgu: true,
    }).id;

    await databaseBuilder.commit();
  });

  describe('POST /api/token', () => {

    let options;

    beforeEach(async () => {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({ userId, organizationId, organizationRoleId: orgaRoleInDB.id });

      options = {
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
      };

      await databaseBuilder.commit();
    });

    it('should return an 200 with accessToken when authentication is ok', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);

      const result = response.result;
      expect(result.token_type).to.equal('bearer');
      expect(result.access_token).to.exist;
      expect(result.user_id).to.equal(userId);
    });

    it('should return http code 401 when user should change password', async () => {
      // given
      const username = 'username123';
      const shouldChangePassword = true;

      databaseBuilder.factory.buildUser.withUnencryptedPassword({
        username,
        rawPassword: userPassword,
        cgu: true,
        shouldChangePassword,
      });

      const expectedResponseError = {
        errors: [
          {
            title: 'PasswordShouldChange',
            status: '401',
            detail: 'Erreur, vous devez changer votre mot de passe.',
          },
        ],
      };

      options.payload = querystring.stringify({
        grant_type: 'password',
        username,
        password: userPassword,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(401);
      expect(response.result).to.deep.equal(expectedResponseError);
    });
  });

  describe('POST /api/token-from-external-user', () => {

    let options;

    beforeEach(async () => {
      const password = 'Pix123';
      const userAttributes = {
        firstName: 'saml',
        lastName: 'jackson',
        samlId: 'SAMLJACKSONID',
      };
      const user = databaseBuilder.factory.buildUser.withUnencryptedPassword({ username: 'saml.jackson1234', rawPassword: password });
      const expectedExternalToken = tokenService.createIdTokenForUserReconciliation(userAttributes);

      options = {
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
    });

    afterEach(() => {
      return knex('authentication-methods').delete();
    });

    it('should return an 200 with accessToken when authentication is ok', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.attributes['access-token']).to.exist;
    });

    context('When credentials are not valid', () => {

      it('should return a 401 Unauthorized', async () => {
        // given
        options.payload.data.attributes.username = 'unknown';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.result.errors[0].detail).to.equal('L\'adresse e-mail et/ou le mot de passe saisis sont incorrects.');
      });
    });

    context('When user should change password', () => {

      it('should return a 401 Unauthorized', async () => {
        // given
        const password = 'password';
        const user = databaseBuilder.factory.buildUser.withUnencryptedPassword({ rawPassword: password, shouldChangePassword: true });
        await databaseBuilder.commit();

        options.payload.data.attributes.username = user.email;
        options.payload.data.attributes.password = password;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.result.errors[0].title).to.equal('PasswordShouldChange');
        expect(response.result.errors[0].detail).to.equal('Erreur, vous devez changer votre mot de passe.');
      });
    });

    context('When the authentified user does not match the expected one', () => {

      it('should return a 409 Conflict', async () => {
        // given
        const invalidUserId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();
        options.payload.data.attributes['expected-user-id'] = invalidUserId;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(409);
        expect(response.result.errors[0].code).to.equal('UNEXPECTED_USER_ACCOUNT');
        expect(response.result.errors[0].detail).to.equal('Ce compte utilisateur n\'est pas celui qui est attendu.');
      });
    });
  });

  describe('POST /api/pole-emploi/token', () => {

    let clock;
    let options;
    let getAccessTokenRequest;
    let getAccessTokenResponse;
    let idToken;

    const firstName = 'John';
    const lastName = 'Doe';
    const externalIdentifier = 'idIdentiteExterne';

    beforeEach(async () => {
      sinon.stub(settings.featureToggles, 'isPoleEmploiEnabled').value(true);

      clock = sinon.useFakeTimers({
        now: Date.now(),
        toFake: ['Date'],
      });

      const code = 'code';
      const client_id = 'client_id';
      const redirect_uri = 'redirect_uri';

      options = {
        method: 'POST',
        url: '/api/pole-emploi/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        payload: querystring.stringify({
          code,
          client_id,
          redirect_uri,
        }),
      };

      idToken = jsonwebtoken.sign({
        given_name: firstName,
        family_name: lastName,
        nonce: 'nonce',
        idIdentiteExterne: externalIdentifier,
      }, 'secret');

      getAccessTokenResponse = {
        access_token: 'access_token',
        id_token: idToken,
        expires_in: 60,
        refresh_token: 'refresh_token',
      };

      getAccessTokenRequest = nock(settings.poleEmploi.tokenUrl)
        .post('/')
        .reply(200, getAccessTokenResponse);
    });

    afterEach(() => {
      clock.restore();
    });

    context('When user is not connected to Pix', () => {

      context('When user does not exist', () => {

        afterEach(async () => {
          await knex('authentication-methods').delete();
          await knex('users').delete();
        });

        it('should create a user with firstName and lastName contained in the pole emploi idToken', async () => {
          // when
          await server.inject(options);

          // then
          const users = await knex('users').where({ firstName, lastName });
          expect(users[0]).to.exist;
        });

        it('should create a POLE_EMPLOI authentication method for the created user', async () => {
          // when
          await server.inject(options);

          // then
          const users = await knex('users').where({ firstName, lastName });
          const authenticationMethods = await knex('authentication-methods').where({ userId: users[0].id });
          expect(authenticationMethods[0].identityProvider).to.equal(AuthenticationMethod.identityProviders.POLE_EMPLOI);
          expect(authenticationMethods[0].externalIdentifier).to.equal(externalIdentifier);
          expect(authenticationMethods[0].authenticationComplement.accessToken).to.equal(getAccessTokenResponse['access_token']);
          expect(authenticationMethods[0].authenticationComplement.expiredDate).to.equal(moment().add(getAccessTokenResponse['expires_in'], 's').toISOString());
          expect(authenticationMethods[0].authenticationComplement.refreshToken).to.equal(getAccessTokenResponse['refresh_token']);
        });

        it('should return an 200 with access_token and id_token when authentication is ok', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(getAccessTokenRequest.isDone()).to.be.true;
          expect(response.result['access_token']).to.exist;
          expect(response.result['id_token']).to.equal(idToken);
        });
      });

      context('When user and POLE EMPLOI authentication method exist', () => {

        let userId;

        beforeEach(async () => {
          userId = databaseBuilder.factory.buildUser({
            firstName,
            lastName,
          }).id;

          databaseBuilder.factory.buildAuthenticationMethod.buildPoleEmploiAuthenticationMethod({
            externalIdentifier,
            accessToken: 'old_access_token',
            refreshToken: 'old_refresh_token',
            expiresIn: 1000,
            userId,
          });

          await databaseBuilder.commit();
        });

        it('should update POLE_EMPLOI authentication method authentication complement', async () => {
          // when
          await server.inject(options);

          // then
          const authenticationMethods = await knex('authentication-methods').where({ userId });
          expect(authenticationMethods[0].authenticationComplement.accessToken).to.equal(getAccessTokenResponse['access_token']);
          expect(authenticationMethods[0].authenticationComplement.expiredDate).to.equal(moment().add(getAccessTokenResponse['expires_in'], 's').toISOString());
          expect(authenticationMethods[0].authenticationComplement.refreshToken).to.equal(getAccessTokenResponse['refresh_token']);
        });

        it('should return an 200 with access_token and id_token when authentication is ok', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(getAccessTokenRequest.isDone()).to.be.true;
          expect(response.result['access_token']).to.exist;
          expect(response.result['id_token']).to.equal(idToken);
        });
      });
    });

    context('When user is connected to Pix', () => {

      beforeEach(async () => {
        const user = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();

        options.headers['Authorization'] = generateValidRequestAuthorizationHeader(user.id);
      });

      afterEach(async () => {
        await knex('authentication-methods').delete();
        await knex('users').delete();
      });

      it('should not be rejected by API', async () => {
        // when
        const response = await server.inject(options);

        // expect
        expect(response.statusCode).to.equal(200);
      });
    });

    context('When user has an invalid token', () => {

      it('should be rejected by API', async () => {

        options.headers['Authorization'] = 'invalid_token';
        // when
        const response = await server.inject(options);

        // expect
        expect(response.statusCode).to.equal(401);

      });
    });
  });
});
