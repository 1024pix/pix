const {
  expect,
  generateValidRequestAuthorizationHeader,
  databaseBuilder,
  HttpTestServer,
} = require('../../test-helper');
const securityPreHandlers = require('../../../lib/application/security-pre-handlers');
const { ROLES } = require('../../../lib/domain/constants').PIX_ADMIN;

describe('Integration | Application | SecurityPreHandlers', function () {
  describe('check admin member roles for pix admin routes', function () {
    let httpServerTest;

    beforeEach(async function () {
      console.time('beforeEach');
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
      await databaseBuilder.commit();
      console.timeEnd('beforeEach');
    });

    it('returns 403 when user is not an admin member', async function () {
      console.time('given');
      console.time('databaseBuilder.buildUser');
      const user = databaseBuilder.factory.buildUser();
      console.timeEnd('databaseBuilder.buildUser');
      console.time('databaseBuilder.commit');
      await databaseBuilder.commit();
      console.timeEnd('databaseBuilder.commit');
      console.timeEnd('given');

      console.time('when');
      const response = await httpServerTest.requestObject({
        method: 'GET',
        url: '/api/admin/users',
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      });
      console.timeEnd('when');

      console.time('then');
      expect(response.statusCode).to.equal(403);
      console.timeEnd('then');
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
});
