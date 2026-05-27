import { checkIfUserIsBlocked } from '../../../../src/identity-access-management/application/security-pre-handlers.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';

describe('Identity Access Management | Integration | Application | SecurityPreHandlers', function () {
  describe('#checkIfUserIsBlocked', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'security-test',
        register: async function (server) {
          server.route([
            {
              method: 'POST',
              path: '/api/token',
              handler: (r, h) => h.response().code(200),
              config: {
                auth: false,
                pre: [
                  {
                    method: (request, h) => checkIfUserIsBlocked(request, h),
                  },
                ],
              },
            },
          ]);
        },
      };
      httpServerTest = new HttpTestServer();
      await httpServerTest.register(moduleUnderTest);
      httpServerTest.setupAuthentication();
    });

    describe('when user is not blocked', function () {
      it('returns 200', async function () {
        // given
        databaseBuilder.factory.buildUser({ username: 'lucy123' });
        await databaseBuilder.commit();

        // when
        const response = await httpServerTest.requestObject({
          method: 'POST',
          url: '/api/token',
          payload: {
            username: 'lucy123',
            grant_type: 'password',
          },
        });

        // then
        expect(response.statusCode).to.equal(200);
      });

      describe('when the application tries to refresh the access token', function () {
        before(async function () {
          // given
          databaseBuilder.factory.buildUser({ username: 'refresh_token_user_1' });
          await databaseBuilder.commit();
        });

        it('returns 200', async function () {
          // when
          const { statusCode } = await httpServerTest.requestObject({
            method: 'POST',
            url: '/api/token',
            payload: { grant_type: 'refresh_token' },
          });

          // then
          expect(statusCode).to.equal(200);
        });
      });
    });

    describe('when user is temporary blocked', function () {
      it('returns 403 with specific code', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser({ username: 'natsu123' }).id;
        await databaseBuilder.factory.buildUserLogin({
          userId,
          temporaryBlockedUntil: new Date(Date.now() + 3600 * 1000),
        });
        await databaseBuilder.commit();

        // when
        const response = await httpServerTest.requestObject({
          method: 'POST',
          url: '/api/token',
          payload: {
            username: 'natsu123',
            grant_type: 'password',
          },
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.result.errors[0].code).to.equal('USER_IS_TEMPORARY_BLOCKED');
      });
    });

    describe('when user is blocked', function () {
      it('returns 403', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser({ username: 'natsu123' }).id;
        await databaseBuilder.factory.buildUserLogin({
          userId,
          blockedAt: new Date(),
        });
        await databaseBuilder.commit();

        // when
        const response = await httpServerTest.requestObject({
          method: 'POST',
          url: '/api/token',
          payload: { username: 'natsu123', grant_type: 'password' },
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.result.errors[0].code).to.equal('USER_IS_BLOCKED');
      });
    });
  });
});
