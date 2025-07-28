import querystring from 'node:querystring';

import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';
import { decodeIfValid } from '../../../../src/shared/domain/services/token-service.js';
import { createServer, databaseBuilder, expect, knex } from '../../../test-helper.js';

const { ROLES } = PIX_ADMIN;
import { config } from '../../../../src/shared/config.js';

describe('Acceptance | Identity Access Management | Route | Token', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/token', function () {
    const orgaRoleInDB = { id: 1, name: 'ADMIN' };
    const userEmailAddress = 'user@example.net';
    const userPassword = 'A124B2C3#!';

    let userId;

    beforeEach(async function () {
      config.authentication.permitPixAdminLoginFromPassword = true;
      userId = databaseBuilder.factory.buildUser.withRawPassword({
        email: userEmailAddress,
        rawPassword: userPassword,
        cgu: true,
      }).id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({ userId, organizationId, organizationRoleId: orgaRoleInDB.id });
      await databaseBuilder.commit();
    });

    it('returns a 200 with an access token and a refresh token when authentication is ok', async function () {
      // given
      const options = _getPostFormOptions({
        url: '/api/token',
        dataToPost: { grant_type: 'password', username: userEmailAddress, password: userPassword },
        applicationName: 'orga',
      });

      // when
      const response = await server.inject(options);

      // then
      const result = response.result;
      expect(response.statusCode).to.equal(200);
      expect(result.token_type).to.equal('bearer');
      expect(result.access_token).to.exist;
      const decodedAccessToken = await decodeIfValid(result.access_token);
      expect(decodedAccessToken).to.include({
        aud: 'https://orga.pix.fr',
      });
      expect(result.user_id).to.equal(userId);
      expect(result.refresh_token).to.exist;
    });

    it('returns http code 401 when user should change password', async function () {
      // given
      databaseBuilder.factory.buildUser.withRawPassword({
        username: 'beth.rave1212',
        rawPassword: userPassword,
        cgu: true,
        shouldChangePassword: true,
      });

      await databaseBuilder.commit();

      const options = _getPostFormOptions({
        url: '/api/token',
        dataToPost: { grant_type: 'password', username: 'beth.rave1212', password: userPassword },
        applicationName: 'orga',
      });

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(401);
      expect(response.result.errors[0].title).equal('PasswordShouldChange');
      expect(response.result.errors[0].meta).to.exist;
    });

    context('when user needs to refresh his access token', function () {
      it('returns a 200 with a new access token', async function () {
        // given
        const optionsForAccessToken = _getPostFormOptions({
          url: '/api/token',
          dataToPost: {
            grant_type: 'password',
            username: userEmailAddress,
            password: userPassword,
          },
          applicationName: 'orga',
        });
        const { result: accessTokenResult } = await server.inject(optionsForAccessToken);

        const options = _getPostFormOptions({
          url: '/api/token',
          dataToPost: {
            grant_type: 'refresh_token',
            refresh_token: accessTokenResult.refresh_token,
          },
          applicationName: 'orga',
        });

        // when
        const response = await server.inject(options);

        // then
        const result = response.result;
        expect(response.statusCode).to.equal(200);
        expect(result.token_type).to.equal('bearer');
        expect(result.access_token).to.exist;
        const decodedAccessToken = await decodeIfValid(result.access_token);
        expect(decodedAccessToken).to.include({
          aud: 'https://orga.pix.fr',
        });
        expect(result.user_id).to.equal(userId);
        expect(result.refresh_token).to.exist;
      });
    });

    context('when requestedApplication is admin', function () {
      context('when admin member has allowed role but has been disabled', function () {
        it('returns http code 403', async function () {
          // given
          const user = databaseBuilder.factory.buildUser.withRawPassword({
            email: 'email@example.net',
            rawPassword: userPassword,
            cgu: true,
          });
          databaseBuilder.factory.buildPixAdminRole({
            userId: user.id,
            role: ROLES.CERTIF,
            disabledAt: new Date('2021-01-02'),
          });
          await databaseBuilder.commit();

          const options = _getPostFormOptions({
            url: '/api/token',
            dataToPost: { grant_type: 'password', username: user.email, password: userPassword },
            applicationName: 'admin',
          });

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    context('when application is Pix Certif', function () {
      it('returns http code 200 with accessToken when authentication is ok', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({ id: 345 });
        databaseBuilder.factory.buildSession({ id: 121, certificationCenterId: 345 });
        const candidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId: 121 });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
        databaseBuilder.factory.buildSupervisorAccess({ userId, sessionId: 121 });
        await databaseBuilder.commit();

        const options = _getPostFormOptions({
          url: '/api/token',
          dataToPost: { grant_type: 'password', username: userEmailAddress, password: userPassword },
          applicationName: 'certif',
        });

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);

        const result = response.result;
        expect(result.token_type).to.equal('bearer');
        expect(result.access_token).to.exist;
        const decodedAccessToken = await decodeIfValid(result.access_token);
        expect(decodedAccessToken).to.include({
          aud: 'https://certif.pix.fr',
        });
        expect(result.user_id).to.equal(userId);
      });
    });

    context('User blocking', function () {
      context('when user fails to authenticate for the threshold failure count', function () {
        it('replies an unauthorized error and blocks the user for the blocking time', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser.withRawPassword({
            email: 'email@without.mb',
            rawPassword: userPassword,
            cgu: true,
          }).id;
          databaseBuilder.factory.buildUserLogin({ userId, failureCount: 9 });
          await databaseBuilder.commit();

          const options = _getPostFormOptions({
            url: '/api/token',
            dataToPost: { grant_type: 'password', username: 'email@without.mb', password: 'wrongPassword' },
            applicationName: 'app',
          });

          // when
          const { statusCode } = await server.inject(options);

          // then
          expect(statusCode).to.equal(401);
          const userLogin = await knex('user-logins').where({ userId }).first();
          expect(userLogin.failureCount).to.equal(10);
          expect(userLogin.temporaryBlockedUntil).to.exist;
        });
      });

      context('when user successfully authenticate but still blocked', function () {
        it('replies a forbidden error and keep on blocking the user for the blocking time', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser.withRawPassword({
            email: 'email@without.mb',
            rawPassword: userPassword,
            cgu: true,
          }).id;
          databaseBuilder.factory.buildUserLogin({
            userId,
            failureCount: 10,
            temporaryBlockedUntil: new Date(Date.now() + 3600 * 1000),
          });
          await databaseBuilder.commit();

          const options = _getPostFormOptions({
            url: '/api/token',
            dataToPost: { grant_type: 'password', username: 'email@without.mb', password: userPassword },
            applicationName: 'app',
          });

          // when
          const { statusCode } = await server.inject(options);

          // then
          expect(statusCode).to.equal(403);
        });
      });

      context('when user successfully authenticate after being blocked', function () {
        it('resets the failure count and the temporary blocked until date', async function () {
          // given
          const userId = databaseBuilder.factory.buildUser.withRawPassword({
            email: 'email@without.mb',
            rawPassword: userPassword,
            cgu: true,
          }).id;
          databaseBuilder.factory.buildUserLogin({
            userId,
            failureCount: 10,
            temporaryBlockedUntil: new Date('2022-11-28'),
          });
          await databaseBuilder.commit();

          const options = _getPostFormOptions({
            url: '/api/token',
            dataToPost: { grant_type: 'password', username: 'email@without.mb', password: userPassword },
            applicationName: 'app',
          });

          // when
          const { statusCode } = await server.inject(options);

          // then
          expect(statusCode).to.equal(200);
          const userLogin = await knex('user-logins').where({ userId }).first();
          expect(userLogin.failureCount).to.equal(0);
          expect(userLogin.temporaryBlockedUntil).to.be.null;
        });
      });
    });

    context('when there is a locale cookie', function () {
      context('when the user has no locale saved', function () {
        it('updates the user locale with the locale cookie', async function () {
          // given
          const locale = 'fr';
          const email = 'user-without-locale@example.net';
          const userWithoutLocale = databaseBuilder.factory.buildUser.withRawPassword({
            email,
            rawPassword: userPassword,
            locale: null,
          });
          await databaseBuilder.commit();

          const options = _getPostFormOptions({
            url: '/api/token',
            dataToPost: { grant_type: 'password', username: userWithoutLocale.email, password: userPassword },
            applicationName: 'app',
            locale,
          });

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          const user = await knex('users').where({ id: userWithoutLocale.id }).first();
          expect(user.locale).to.equal(locale);
        });
      });

      context('when the user has already a locale saved', function () {
        it('does not update the user locale', async function () {
          // given
          const locale = 'fr-BE';
          const userLocale = 'fr';
          const email = 'user-with-locale@example.net';
          const userWithLocale = databaseBuilder.factory.buildUser.withRawPassword({
            email,
            rawPassword: userPassword,
            locale: userLocale,
          });
          await databaseBuilder.commit();

          const options = _getPostFormOptions({
            url: '/api/token',
            dataToPost: {
              grant_type: 'password',
              username: userWithLocale.email,
              password: userPassword,
            },
            applicationName: 'app',
            locale,
          });

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          const user = await knex('users').where({ id: userWithLocale.id }).first();
          expect(user.locale).to.not.equal(locale);
          expect(user.locale).to.equal(userLocale);
        });
      });
    });
  });

  describe('POST /api/token/anonymous', function () {
    let options;

    context('when is not simplified Access Campaign', function () {
      const campaignCode = 'RANDOM123';
      const lang = 'en';

      beforeEach(async function () {
        const targetProfile = databaseBuilder.factory.buildTargetProfile({ isSimplifiedAccess: false });
        databaseBuilder.factory.buildCampaign({ code: campaignCode, targetProfile });
        await databaseBuilder.commit();

        options = _getPostFormOptions({
          url: '/api/token/anonymous',
          dataToPost: {
            campaign_code: campaignCode,
            lang,
          },
          applicationName: 'app',
        });
      });

      it('returns an 401', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.result.errors[0].detail).to.equal("L'utilisateur ne peut pas être créé");
      });
    });

    context('when is simplified Access Campaign', function () {
      const simplifiedAccessCampaignCode = 'SIMPLIFIE';
      const firstName = '';
      const lastName = '';
      const isAnonymous = true;
      const lang = 'en';

      beforeEach(async function () {
        const targetProfileId = databaseBuilder.factory.buildTargetProfile({ isSimplifiedAccess: true }).id;
        databaseBuilder.factory.buildCampaign({ code: simplifiedAccessCampaignCode, targetProfileId });
        await databaseBuilder.commit();

        options = _getPostFormOptions({
          url: '/api/token/anonymous',
          dataToPost: {
            campaign_code: simplifiedAccessCampaignCode,
            lang,
          },
          applicationName: 'app',
        });
      });

      it('returns a 200 with accessToken', async function () {
        // when
        const response = await server.inject(options);
        const result = response.result;

        // then
        expect(response.statusCode).to.equal(200);

        expect(result.token_type).to.equal('bearer');
        expect(result.access_token).to.exist;
        const decodedToken = await decodeIfValid(result.access_token);
        expect(decodedToken).to.include({
          aud: 'https://app.pix.fr',
        });
      });

      it('creates an anonymous user', async function () {
        // when
        await server.inject(options);

        // then
        const users = await knex('users').where({ firstName, lastName, isAnonymous });
        expect(users[0]).to.exist;
      });
    });
  });

  describe('POST /api/revoke', function () {
    const method = 'POST';
    const url = '/api/revoke';
    const headers = {
      'content-type': 'application/x-www-form-urlencoded',
    };

    let payload;

    beforeEach(function () {
      payload = querystring.stringify({
        token: 'jwt.access.token',
        token_type_hint: 'access_token',
      });
    });

    it('returns a response with HTTP status code 204 when route handler (a.k.a. controller) is successful', async function () {
      // when
      const response = await server.inject({ method, url, payload, auth: null, headers });

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('returns a 400 when grant type is not "access_token" nor "refresh_token"', async function () {
      // given
      payload = querystring.stringify({
        token: 'jwt.access.token',
        token_type_hint: 'not_standard_token_type',
      });

      // when
      const response = await server.inject({ method, url, payload, auth: null, headers });

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('returns a 400 when token is missing', async function () {
      // given
      payload = querystring.stringify({
        token_type_hint: 'access_token',
      });

      // when
      const response = await server.inject({ method, url, payload, auth: null, headers });

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('returns a response with HTTP status code 204 even when token type hint is missing', async function () {
      // given
      payload = querystring.stringify({
        token: 'jwt.access.token',
      });

      // when
      const response = await server.inject({ method, url, payload, auth: null, headers });

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('returns a JSON API error (415) when request "Content-Type" header is not "application/x-www-form-urlencoded"', async function () {
      // given
      headers['content-type'] = 'text/html';

      // when
      const response = await server.inject({ method, url, payload, auth: null, headers });

      // then
      expect(response.statusCode).to.equal(415);
    });
  });

  describe('POST /api/application/token', function () {
    let server;
    let options;
    const OSMOSE_CLIENT_ID = 'test-apimOsmoseClientId';
    const OSMOSE_CLIENT_SECRET = 'test-apimOsmoseClientSecret';
    const SCOPE1 = 'organizations-certifications-result';
    const SCOPE2 = 'another-scope';

    beforeEach(async function () {
      server = await createServer();
      options = {
        method: 'POST',
        url: '/api/application/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'app.pix.fr',
        },
      };

      databaseBuilder.factory.buildClientApplication({
        name: 'osmose',
        clientId: OSMOSE_CLIENT_ID,
        clientSecret: OSMOSE_CLIENT_SECRET,
        scopes: [SCOPE1, SCOPE2],
      });
      await databaseBuilder.commit();
    });

    it('should return a 200 with accessToken when clientId, client secret and scope are registred', async function () {
      // given
      options.payload = querystring.stringify({
        grant_type: 'client_credentials',
        client_id: OSMOSE_CLIENT_ID,
        client_secret: OSMOSE_CLIENT_SECRET,
        scope: `${SCOPE1} ${SCOPE2}`,
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

    it('should return a 401 when clientId is not registred', async function () {
      // given
      options.payload = querystring.stringify({
        grant_type: 'client_credentials',
        client_id: 'NOT REGISTRED',
        client_secret: OSMOSE_CLIENT_SECRET,
        scope: SCOPE1,
      });

      // when
      const response = await server.inject(options);

      // then
      expect(response.result.errors[0]).to.deep.equal({
        title: 'Unauthorized',
        detail: 'The client ID and/or secret are invalid.',
        status: '401',
      });
    });

    it('should return a 401 when client secret is not valid', async function () {
      // given
      options.payload = querystring.stringify({
        grant_type: 'client_credentials',
        client_id: OSMOSE_CLIENT_ID,
        client_secret: 'invalid secret',
        scope: SCOPE1,
      });

      // when
      const response = await server.inject(options);

      // then
      expect(response.result.errors[0]).to.deep.equal({
        title: 'Unauthorized',
        detail: 'The client ID and/or secret are invalid.',
        status: '401',
      });
    });

    it('should return a 403 when at least one scope is not allowed', async function () {
      // given
      options.payload = querystring.stringify({
        grant_type: 'client_credentials',
        client_id: OSMOSE_CLIENT_ID,
        client_secret: OSMOSE_CLIENT_SECRET,
        scope: `invalid-scope ${SCOPE1}`,
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

function _getPostFormOptions({ url, dataToPost, applicationName, locale }) {
  return {
    method: 'POST',
    url,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'x-forwarded-proto': 'https',
      'x-forwarded-host': `${applicationName}.pix.fr`,
      ...(locale && { cookie: `locale=${locale}` }),
    },
    payload: querystring.stringify(dataToPost),
  };
}
