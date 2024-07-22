import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

const { ROLES } = PIX_ADMIN;

describe('Acceptance | Team | Route | Admin-member', function () {
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

    context('when user is not a member of pix admin and has no role', function () {
      it('should return 403 http status code', async function () {
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
        expect(response.statusCode).to.equal(403);
        expect(response.statusMessage).to.equal('Forbidden');
      });
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
});
