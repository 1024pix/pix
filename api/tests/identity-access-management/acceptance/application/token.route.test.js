import querystring from 'node:querystring';

import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';
import { createServer, databaseBuilder, expect, knex } from '../../../test-helper.js';

const { ROLES } = PIX_ADMIN;

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

    it('returns a 400 if grant type is invalid', async function () {
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

    it('returns http code 401 when user should change password', async function () {
      // given
      databaseBuilder.factory.buildUser.withRawPassword({
        username: 'beth.rave1212',
        rawPassword: userPassword,
        cgu: true,
        shouldChangePassword: true,
      });

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
          username: 'beth.rave1212',
          password: userPassword,
          scope: 'pix',
        }),
      });

      // then
      expect(response.statusCode).to.equal(401);
      expect(response.result.errors[0].title).equal('PasswordShouldChange');
      expect(response.result.errors[0].meta).to.exist;
    });

    context('when user needs to refresh his access token', function () {
      it('returns a 200 with a new access token', async function () {
        // given
        const { result: accessTokenResult } = await server.inject({
          method: 'POST',
          url: '/api/token',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          payload: querystring.stringify({
            grant_type: 'password',
            username: userEmailAddress,
            password: userPassword,
            scope: 'pix',
          }),
        });

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/token',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          payload: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: accessTokenResult.refresh_token,
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
    });

    context('when scope is admin', function () {
      context('when admin member has allowed role but has been disabled', function () {
        it('returns http code 403', async function () {
          //given
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
          const options = _getOptions({ scope: 'pix-admin', username: user.email, password: userPassword });

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    context('when scope is pix-certif', function () {
      it('returns http code 200 with accessToken when authentication is ok', async function () {
        //given
        databaseBuilder.factory.buildCertificationCenter({ id: 345 });
        databaseBuilder.factory.buildSession({ id: 121, certificationCenterId: 345 });
        const candidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId: 121 });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
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

          const options = _getOptions({ scope: 'pix', username: 'email@without.mb', password: 'wrongPassword' });

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

          const options = _getOptions({ scope: 'pix', username: 'email@without.mb', password: userPassword });

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

          const options = _getOptions({ scope: 'pix', username: 'email@without.mb', password: userPassword });

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
          const localeFromCookie = 'fr';
          const email = 'user-without-locale@example.net';
          const userWithoutLocale = databaseBuilder.factory.buildUser.withRawPassword({
            email,
            rawPassword: userPassword,
            locale: null,
          });
          await databaseBuilder.commit();

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/token',
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
              cookie: `locale=${localeFromCookie}`,
            },
            payload: querystring.stringify({
              grant_type: 'password',
              username: userWithoutLocale.email,
              password: userPassword,
            }),
          });

          // then
          expect(response.statusCode).to.equal(200);
          const user = await knex('users').where({ id: userWithoutLocale.id }).first();
          expect(user.locale).to.equal(localeFromCookie);
        });
      });

      context('when the user has already a locale saved', function () {
        it('does not update the user locale', async function () {
          // given
          const localeFromCookie = 'fr-BE';
          const userLocale = 'fr';
          const email = 'user-with-locale@example.net';
          const userWithLocale = databaseBuilder.factory.buildUser.withRawPassword({
            email,
            rawPassword: userPassword,
            locale: userLocale,
          });
          await databaseBuilder.commit();

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/token',
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
              cookie: `locale=${localeFromCookie}`,
            },
            payload: querystring.stringify({
              grant_type: 'password',
              username: userWithLocale.email,
              password: userPassword,
            }),
          });

          // then
          expect(response.statusCode).to.equal(200);
          const user = await knex('users').where({ id: userWithLocale.id }).first();
          expect(user.locale).to.not.equal(localeFromCookie);
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

      it('returns a 200 with accessToken', async function () {
        // when
        const response = await server.inject(options);
        const result = response.result;

        // then
        expect(response.statusCode).to.equal(200);

        expect(result.token_type).to.equal('bearer');
        expect(result.access_token).to.exist;
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
