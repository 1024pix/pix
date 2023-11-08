import {
  expect,
  generateValidRequestAuthorizationHeader,
  databaseBuilder,
  HttpTestServer,
  sinon,
} from '../../test-helper.js';

import { securityPreHandlers } from '../../../lib/application/security-pre-handlers.js';
import { config as settings } from '../../../lib/config.js';
import { PIX_ADMIN } from '../../../src/access/authorization/domain/constants.js';

const { ROLES } = PIX_ADMIN;

describe('Integration | Application | SecurityPreHandlers', function () {
  describe('check admin member roles for pix admin routes', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'security-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/api/admin/users',
              handler: (r, h) => h.response().code(200),
              config: {
                pre: [
                  {
                    method: (request, h) =>
                      securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                        securityPreHandlers.checkAdminMemberHasRoleCertif,
                      ])(request, h),
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

    it('returns 403 when user is not an admin member', async function () {
      const user = databaseBuilder.factory.buildUser();

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/admin/users',
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      const response = await httpServerTest.requestObject(options);
      expect(response.statusCode).to.equal(403);
    });

    it('returns 403 when user is and admin member without one of the allowed roles', async function () {
      const user = databaseBuilder.factory.buildUser.withRole({ disabledAt: null, role: ROLES.METIER });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/admin/users',
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      const response = await httpServerTest.requestObject(options);
      expect(response.statusCode).to.equal(403);
    });

    it('returns 403 when user is and admin member with one of the allowed roles but is disabled', async function () {
      const user = databaseBuilder.factory.buildUser.withRole({ disabledAt: new Date() });

      await databaseBuilder.commit();

      const response = await httpServerTest.requestObject({
        method: 'GET',
        url: '/api/admin/users',
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      });
      expect(response.statusCode).to.equal(403);
    });

    it('returns 200 when user is and admin member with one of the allowed roles', async function () {
      const user = databaseBuilder.factory.buildUser.withRole({ disabledAt: null });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/admin/users',
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      const response = await httpServerTest.requestObject(options);
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#checkUserBelongsToOrganization', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'security-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/check/{id}',
              handler: (r, h) => h.response().code(200),
              config: {
                pre: [
                  {
                    method: securityPreHandlers.checkUserBelongsToOrganization,
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

    it('returns 403 when user is not in the organization', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/check/${organizationId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(403);
    });

    it('returns 200 when the user belongs to the organization', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildMembership({ userId, organizationId });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/check/${organizationId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#checkUserIsMemberOfAnOrganization', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'security-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/framework/tubes',
              handler: (r, h) => h.response().code(200),
              config: {
                pre: [
                  {
                    method: securityPreHandlers.checkUserIsMemberOfAnOrganization,
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

    it('returns 403 when user is not a member of an organization', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/framework/tubes',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(403);
    });

    it('returns 200 when the user is a member of an organization', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildMembership({ userId, organizationId });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/framework/tubes',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(200);
    });
  });

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
                    method: (request, h) => securityPreHandlers.checkIfUserIsBlocked(request, h),
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

  describe('#checkPix1dActivated', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'security-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/api/test-pix1d',
              handler: (r, h) => h.response().code(200),
              config: {
                auth: false,
                pre: [
                  {
                    method: (request, h) => securityPreHandlers.checkPix1dActivated(request, h),
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

    it('should authorize access to resource when Pix1D is activated', async function () {
      // given
      sinon.stub(settings.featureToggles, 'isPix1dEnabled').value(true);

      // when
      const options = {
        method: 'GET',
        url: '/api/test-pix1d',
      };

      const { statusCode } = await httpServerTest.requestObject(options);

      // then
      expect(statusCode).to.equal(200);
    });

    it('should forbid resource access when Pix1D is not activated', async function () {
      // given
      sinon.stub(settings.featureToggles, 'isPix1dEnabled').value(false);

      // when
      const options = {
        method: 'GET',
        url: '/api/test-pix1d',
      };

      const response = await httpServerTest.requestObject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
