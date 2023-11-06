import querystring from 'querystring';
import { expect, databaseBuilder, knex } from '../../../../test-helper.js';
import { PIX_ADMIN } from '../../../../../lib/domain/constants.js';

const { ROLES } = PIX_ADMIN;

import { createServer } from '../../../../../server.js';

describe('Acceptance | Authentication | Application | Controller', function () {
  afterEach(async function () {
    await knex('user-logins').delete();
  });

  describe('POST /api/token', function () {
    const orgaRoleInDB = { id: 1, name: 'ADMIN' };

    const userEmailAddress = 'user@example.net';
    const userPassword = 'A124B2C3#!';

    let server;
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
      server = await createServer();
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
        it('should return http code 403', async function () {
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
      it('should return http code 200 with accessToken when authentication is ok', async function () {
        //given
        databaseBuilder.factory.buildCertificationCenter({ id: 345 });
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
