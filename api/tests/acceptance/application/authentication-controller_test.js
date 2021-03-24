const querystring = require('querystring');
const jsonwebtoken = require('jsonwebtoken');
const moment = require('moment');
const authenticationCache = require('../../../lib/infrastructure/caches/authentication-cache');

const { expect, databaseBuilder, knex, sinon, nock, generateValidRequestAuthorizationHeader } = require('../../test-helper');

const settings = require('../../../lib/config');
const createServer = require('../../../server');
const tokenService = require('../../../lib/domain/services/token-service');

const AuthenticationMethod = require('../../../lib/domain/models/AuthenticationMethod');

describe('Acceptance | Controller | authentication-controller', () => {

  const orgaRoleInDB = { id: 1, name: 'ADMIN' };

  const userEmailAddress = 'user@example.net';
  const userPassword = 'A124B2C3#!';

  let server;
  let userId;

  beforeEach(async () => {
    server = await createServer();

    userId = databaseBuilder.factory.buildUser.withRawPassword({
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

      databaseBuilder.factory.buildUser.withRawPassword({
        username,
        rawPassword: userPassword,
        cgu: true,
        shouldChangePassword,
      });

      const expectedResponseError = {
        errors: [{
          code: 'SHOULD_CHANGE_PASSWORD',
          detail: 'Erreur, vous devez changer votre mot de passe.',
          status: '401',
          title: 'PasswordShouldChange',
        }],
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
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        username: 'saml.jackson1234',
        rawPassword: password,
      });
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
        const rawPassword = 'Password123';
        const user = databaseBuilder.factory.buildUser.withRawPassword({
          rawPassword,
          shouldChangePassword: true,
        });
        await databaseBuilder.commit();

        options.payload.data.attributes.username = user.email;
        options.payload.data.attributes.password = rawPassword;

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

      context('When user has not account', () => {

        afterEach(async () => {
          await knex('authentication-methods').delete();
          await knex('users').delete();
        });

        it('should return http code 401', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(401);
        });

        it('should return an authenticationKey in meta', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.result.errors[0].meta).to.exist;
        });

        it('should return validate cgu in code', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.result.errors[0].code).to.exist;
          expect(response.result.errors[0].code).to.equal('SHOULD_VALIDATE_CGU');
        });

        it('should return an authenticationKey in meta which match to cached object', async () => {
          // when
          const response = await server.inject(options);
          const expectedObject = {
            accessToken: 'access_token',
            idToken: idToken,
            expiresIn: 60,
            refreshToken: 'refresh_token',
          };

          // then
          const actualObject = await authenticationCache.get(response.result.errors[0].meta.authenticationKey);
          expect(actualObject).to.exist;
          expect(actualObject).to.deep.equal(expectedObject);
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

      let authenticatedUser;
      beforeEach(async () => {
        authenticatedUser = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();

        options.headers['Authorization'] = generateValidRequestAuthorizationHeader(authenticatedUser.id);
      });

      afterEach(async () => {
        await knex('authentication-methods').delete();
        await knex('users').delete();
      });

      context('When the user does not have a POLE_EMPLOI authentication method', () => {

        it('should create a POLE_EMPLOI authentication method for the authenticated user', async () => {
          // when
          await server.inject(options);

          // then
          const authenticationMethods = await knex('authentication-methods').where({ userId: authenticatedUser.id });
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

      context('When the user does have a POLE_EMPLOI authentication method', () => {

        it('should update POLE_EMPLOI authentication method authentication complement', async () => {
          // given
          databaseBuilder.factory.buildAuthenticationMethod.buildPoleEmploiAuthenticationMethod({
            externalIdentifier,
            accessToken: 'old_access_token',
            refreshToken: 'old_refresh_token',
            expiresIn: 1000,
            userId: authenticatedUser.id,
          });

          await databaseBuilder.commit();

          // when
          await server.inject(options);

          // then
          const authenticationMethods = await knex('authentication-methods').where({ userId: authenticatedUser.id });
          expect(authenticationMethods[0].authenticationComplement.accessToken).to.equal(getAccessTokenResponse['access_token']);
          expect(authenticationMethods[0].authenticationComplement.expiredDate).to.equal(moment().add(getAccessTokenResponse['expires_in'], 's').toISOString());
          expect(authenticationMethods[0].authenticationComplement.refreshToken).to.equal(getAccessTokenResponse['refresh_token']);
        });

        it('should return a 409 Conflict if the authenticated user is not the expected one', async () => {
          // given
          const otherUser = databaseBuilder.factory.buildUser();
          databaseBuilder.factory.buildAuthenticationMethod.buildPoleEmploiAuthenticationMethod({
            externalIdentifier: 'other_external_identifier',
            userId: otherUser.id,
          });
          await databaseBuilder.commit();
          options.headers['Authorization'] = generateValidRequestAuthorizationHeader(otherUser.id);

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
        });
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

  describe('POST /api/token/anonymous', () => {

    let options;

    context('When is not simplified Access Campaign', () => {

      const campaignCode = 'RANDOM123';
      const lang = 'en';

      beforeEach(async () => {
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

      it('should return an 401', async() =>{
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.result.errors[0].detail).to.equal('L\'utilisateur ne peut pas être créé');
      });
    });

    context('When is simplified Access Campaign', () =>{

      const simplifiedAccessCampaignCode = 'SIMPLIFIE';
      const firstName = '';
      const lastName = '';
      const isAnonymous = true;
      const lang = 'en';

      beforeEach(async () => {

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

      it('should return a 200 with accessToken', async() =>{
        // when
        const response = await server.inject(options);
        const result = response.result;

        // then
        expect(response.statusCode).to.equal(200);

        expect(result.token_type).to.equal('bearer');
        expect(result.access_token).to.exist;
      });

      it('should create an anonymous user', async () => {
        // when
        await server.inject(options);

        // then
        const users = await knex('users').where({ firstName, lastName, isAnonymous });
        expect(users[0]).to.exist;
      });
    });
  });

  describe('POST /api/application/token', () => {

    let options;
    const OSMOSE_CLIENT_ID = 'graviteeOsmoseClientId';
    const OSMOSE_CLIENT_SECRET = 'graviteeOsmoseClientSecret';
    const SCOPE = 'organizations-certifications-result';

    beforeEach(async () => {
      options = {
        method: 'POST',
        url: '/api/application/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      };

      await databaseBuilder.commit();
    });

    it('should return an 200 with accessToken when clientId, client secret and scope are registred', async () => {
      // when

      options.payload = querystring.stringify({
        grant_type: 'client_credentials',
        client_id: OSMOSE_CLIENT_ID,
        client_secret: OSMOSE_CLIENT_SECRET,
        scope: SCOPE,
      });

      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);

      const result = response.result;
      expect(result.token_type).to.equal('bearer');
      expect(result.access_token).to.exist;
      expect(result.client_id).to.equal(OSMOSE_CLIENT_ID);
    });

    it('should return an 401 when clientId is not registred', async () => {
      // when

      options.payload = querystring.stringify({
        grant_type: 'client_credentials',
        client_id: 'NOT REGISTRED',
        client_secret: OSMOSE_CLIENT_SECRET,
        scope: SCOPE,
      });

      const response = await server.inject(options);

      // then
      expect(response.result.errors[0]).to.deep.equal({
        'title': 'Unauthorized',
        'detail': 'The client ID is invalid.',
        'status': '401',
      });

    });

    it('should return an 401 when client secret is not valid', async () => {
      // when

      options.payload = querystring.stringify({
        grant_type: 'client_credentials',
        client_id: OSMOSE_CLIENT_ID,
        client_secret: 'invalid secret',
        scope: SCOPE,
      });

      const response = await server.inject(options);

      // then
      expect(response.result.errors[0]).to.deep.equal({
        'title': 'Unauthorized',
        'detail': 'The client secret is invalid.',
        'status': '401',
      });

    });

    it('should return an 403 when scope is not allowed', async () => {
      // when

      options.payload = querystring.stringify({
        grant_type: 'client_credentials',
        client_id: OSMOSE_CLIENT_ID,
        client_secret: OSMOSE_CLIENT_SECRET,
        scope: 'invalid scope',
      });

      const response = await server.inject(options);

      // then
      expect(response.result.errors[0]).to.deep.equal({
        'title': 'Forbidden',
        'detail': 'The scope is not allowed.',
        'status': '403',
      });

    });

  });

});
