const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');
const { ROLES } = require('../../../../lib/domain/constants').PIX_ADMIN;

describe('Acceptance | Application | Admin-members | Routes', function () {
  describe('GET /api/admin/admin-members', function () {
    it('should return 200 http status code when user has role "SUPER_ADMIN"', async function () {
      // given
      const admin = databaseBuilder.factory.buildUser.withRole({
        id: 1234,
        firstName: 'Super',
        lastName: 'Papa',
        email: 'super.papa@example.net',
        password: 'Password123',
        role: ROLES.SUPER_ADMIN,
      });

      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const response = await server.inject({
        headers: {
          authorization: generateValidRequestAuthorizationHeader(admin.id),
        },
        method: 'GET',
        url: `/api/admin/admin-members`,
      });

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/admin/admin-members/{id}', function () {
    it('should return 200 http status code if use has role "SUPER_ADMIN"', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRole();
      const pixAdminUserToUpdate = databaseBuilder.factory.buildUser.withRole();
      const pixAdminRole = databaseBuilder.factory.buildPixAdminRole({
        userId: pixAdminUserToUpdate.id,
        role: ROLES.SUPPORT,
      });
      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const response = await server.inject({
        headers: {
          authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
        },
        method: 'PATCH',
        url: `/api/admin/admin-members/${pixAdminRole.id}`,
        payload: {
          data: {
            attributes: {
              role: ROLES.CERTIF,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 403 if user is not Super Admin', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const response = await server.inject({
        headers: {
          authorization: generateValidRequestAuthorizationHeader(user.id),
        },
        method: 'PATCH',
        url: `/api/admin/admin-members/${user.id}`,
        payload: {
          data: {
            attributes: {
              role: ROLES.SUPER_ADMIN,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should return 400 if the payload is invalid', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRole();
      const pixAdminUserToUpdate = databaseBuilder.factory.buildUser.withRole();
      const pixAdminRole = databaseBuilder.factory.buildPixAdminRole({
        userId: pixAdminUserToUpdate.id,
        role: ROLES.SUPPORT,
      });
      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const response = await server.inject({
        headers: {
          authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
        },
        method: 'PATCH',
        url: `/api/admin/admin-members/${pixAdminRole.id}`,
        payload: {
          data: {
            attributes: {
              role: 'INVALID_ROLE',
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
