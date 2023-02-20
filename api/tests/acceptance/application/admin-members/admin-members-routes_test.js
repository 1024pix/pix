import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper';

import createServer from '../../../../server';
import { PIX_ADMIN } from '../../../../lib/domain/constants';

const { ROLES: ROLES } = PIX_ADMIN;

describe('Acceptance | Application | Admin-members | Routes', function () {
  describe('GET /api/admin/admin-members/me', function () {
    it('should return 200 http status code', async function () {
      // given
      databaseBuilder.factory.buildUser.withRole();
      const admin = await insertUserWithRoleSuperAdmin();
      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const response = await server.inject({
        headers: {
          authorization: generateValidRequestAuthorizationHeader(admin.id),
        },
        method: 'GET',
        url: '/api/admin/admin-members/me',
      });

      // then
      expect(response.statusCode).to.equal(200);
    });
    it('should return 404 http status code when user is not a member of pix admin and has no role', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const response = await server.inject({
        headers: {
          authorization: generateValidRequestAuthorizationHeader(user.id),
        },
        method: 'GET',
        url: '/api/admin/admin-members/me',
      });

      // then
      expect(response.statusCode).to.equal(404);
      expect(response.statusMessage).to.equal('Not Found');
    });
  });

  describe('GET /api/admin/admin-members', function () {
    it('should return 200 http status code when admin member has role "SUPER_ADMIN"', async function () {
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
    it('should return 200 http status code if admin member has role "SUPER_ADMIN"', async function () {
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
  });

  describe('PUT /api/admin/admin-members/{id}/deactivate', function () {
    it('should return 204 http status code if admin member has role "SUPER_ADMIN" and admin member has been successfully deactivated', async function () {
      // given
      const superAdmin = await databaseBuilder.factory.buildUser.withRole({ role: ROLES.SUPER_ADMIN });
      const user = databaseBuilder.factory.buildUser();
      const adminMemberToDeactivate = databaseBuilder.factory.buildPixAdminRole({
        userId: user.id,
        role: ROLES.SUPPORT,
      });

      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const response = await server.inject({
        headers: {
          authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
        },
        method: 'PUT',
        url: `/api/admin/admin-members/${adminMemberToDeactivate.id}/deactivate`,
      });

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('POST /api/admin/admin-members', function () {
    context('when admin member has role "SUPER_ADMIN"', function () {
      it('should return a response with an HTTP status code 201', async function () {
        // given
        const adminMemberWithRoleSuperAdmin = databaseBuilder.factory.buildUser.withRole({
          firstName: 'jaune',
          lastName: 'attends',
          email: 'jaune.attends@example.net',
          password: 'j@Un3@Tt3nds',
          role: ROLES.SUPER_ADMIN,
        });
        const user = databaseBuilder.factory.buildUser({
          id: 1101,
          firstName: '11',
          lastName: '01',
          email: '11.01@example.net',
        });
        await databaseBuilder.commit();
        const server = await createServer();

        // when
        const { statusCode, result } = await server.inject({
          headers: {
            authorization: generateValidRequestAuthorizationHeader(adminMemberWithRoleSuperAdmin.id),
          },
          method: 'POST',
          url: '/api/admin/admin-members',
          payload: {
            data: {
              attributes: {
                email: user.email,
                role: ROLES.CERTIF,
              },
            },
          },
        });

        // then
        expect(statusCode).to.equal(201);
        expect(result.data.attributes['user-id']).to.equal(1101);
        expect(result.data.attributes.role).to.equal('CERTIF');
        expect(result.data.attributes.email).to.equal('11.01@example.net');
      });
    });
  });
});
